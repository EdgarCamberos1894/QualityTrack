package com.nocountry.qualitytrack.customers.service;

import com.nocountry.qualitytrack.auth.token.OpaqueTokenService;
import com.nocountry.qualitytrack.customers.dto.request.AcceptCustomerInvitationRequest;
import com.nocountry.qualitytrack.customers.dto.request.CompleteCustomerInvitationRegistrationRequest;
import com.nocountry.qualitytrack.customers.dto.request.CreateCustomerInvitationRequest;
import com.nocountry.qualitytrack.customers.dto.response.CustomerInvitationResponse;
import com.nocountry.qualitytrack.customers.dto.response.CustomerMemberResponse;
import com.nocountry.qualitytrack.customers.entity.Customer;
import com.nocountry.qualitytrack.customers.entity.CustomerInvitation;
import com.nocountry.qualitytrack.customers.entity.CustomerMembership;
import com.nocountry.qualitytrack.customers.enums.CustomerInvitationStatus;
import com.nocountry.qualitytrack.customers.enums.CustomerMembershipRole;
import com.nocountry.qualitytrack.customers.enums.CustomerMembershipStatus;
import com.nocountry.qualitytrack.customers.repository.CustomerInvitationRepository;
import com.nocountry.qualitytrack.customers.repository.CustomerMembershipRepository;
import com.nocountry.qualitytrack.customers.repository.CustomerRepository;
import com.nocountry.qualitytrack.notification.email.EmailService;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.users.enums.AccountType;
import com.nocountry.qualitytrack.users.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Optional;

@Service
public class CustomerInvitationService {

    private final CustomerRepository customerRepository;
    private final CustomerMembershipRepository membershipRepository;
    private final CustomerInvitationRepository invitationRepository;
    private final UserRepository userRepository;
    private final OpaqueTokenService opaqueTokenService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final Duration invitationExpiration;

    public CustomerInvitationService(
            CustomerRepository customerRepository,
            CustomerMembershipRepository membershipRepository,
            CustomerInvitationRepository invitationRepository,
            UserRepository userRepository,
            OpaqueTokenService opaqueTokenService,
            EmailService emailService,
            PasswordEncoder passwordEncoder,
            @Value("${app.customer-invitations.expiration:PT72H}") Duration invitationExpiration
    ) {
        if (invitationExpiration == null || invitationExpiration.isZero() || invitationExpiration.isNegative()) {
            throw new IllegalStateException("La expiración de las invitaciones debe ser mayor a cero.");
        }

        this.customerRepository = customerRepository;
        this.membershipRepository = membershipRepository;
        this.invitationRepository = invitationRepository;
        this.userRepository = userRepository;
        this.opaqueTokenService = opaqueTokenService;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.invitationExpiration = invitationExpiration;
    }

    @Transactional
    public CustomerInvitationResponse createInvitation(
            Long currentUserId,
            Long customerId,
            CreateCustomerInvitationRequest request
    ) {
        Customer customer = customerRepository.findByIdForUpdate(customerId)
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.RESOURCE_NOT_FOUND,
                        "No se encontró la empresa."
                ));

        CustomerMembership inviterMembership = requireActiveAdmin(currentUserId, customerId);
        User inviter = inviterMembership.getUser();
        String email = normalizeEmail(request.email());
        Instant now = Instant.now();

        validateTargetCanBeInvited(customerId, email);
        expirePreviousInvitationIfNecessary(customerId, email, now);

        OpaqueTokenService.GeneratedOpaqueToken token = opaqueTokenService.generate();
        CustomerInvitation invitation = CustomerInvitation.create(
                customer,
                email,
                request.role(),
                token.hash(),
                now.plus(invitationExpiration),
                inviter
        );

        invitation = invitationRepository.saveAndFlush(invitation);
        emailService.sendCustomerInvitationEmail(
                email,
                token.value(),
                customer.getName(),
                request.role().name()
        );

        return CustomerInvitationResponse.from(invitation);
    }

    @Transactional
    public CustomerMemberResponse acceptInvitation(
            Long currentUserId,
            AcceptCustomerInvitationRequest request
    ) {
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.RESOURCE_NOT_FOUND,
                        "No se encontró el usuario autenticado."
                ));

        if (user.getAccountType() != AccountType.CUSTOMER) {
            throw new BusinessException(
                    ApiErrorCode.ACCESS_DENIED,
                    "Solo una cuenta de cliente puede aceptar invitaciones de empresa."
            );
        }

        CustomerInvitation invitation = requirePendingInvitation(request.token());

        if (!invitation.getEmail().equals(normalizeEmail(user.getEmail()))) {
            throw new BusinessException(
                    ApiErrorCode.ACCESS_DENIED,
                    "La invitación pertenece a otra dirección de correo electrónico."
            );
        }

        return acceptInvitationForUser(invitation, user, Instant.now());
    }

    @Transactional
    public CustomerMemberResponse completeRegistration(
            CompleteCustomerInvitationRegistrationRequest request
    ) {
        CustomerInvitation invitation = requirePendingInvitation(request.token());
        String email = invitation.getEmail();

        if (userRepository.existsByEmail(email)) {
            throw existingAccountForInvitation();
        }

        Instant acceptedAt = Instant.now();
        User user = User.registerCustomer(
                request.firstName().trim(),
                request.lastName().trim(),
                email,
                passwordEncoder.encode(request.password())
        );

        // Receiving the invitation at this address proves control of the email account.
        user.verifyEmail(acceptedAt);

        try {
            user = userRepository.saveAndFlush(user);
        } catch (DataIntegrityViolationException exception) {
            // Covers a concurrent registration using the same invited email.
            throw existingAccountForInvitation();
        }

        return acceptInvitationForUser(invitation, user, acceptedAt);
    }

    private CustomerMemberResponse acceptInvitationForUser(
            CustomerInvitation invitation,
            User user,
            Instant acceptedAt
    ) {
        CustomerMembership membership = activateMembership(invitation, user, acceptedAt);
        invitation.accept(user, acceptedAt);
        invitationRepository.save(invitation);

        return CustomerMemberResponse.from(membership);
    }

    private CustomerInvitation requirePendingInvitation(String rawToken) {
        String tokenHash = opaqueTokenService.hash(rawToken.trim());
        CustomerInvitation invitation = invitationRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.INVALID_CUSTOMER_INVITATION_TOKEN,
                        "La invitación no es válida."
                ));

        if (invitation.getStatus() == CustomerInvitationStatus.EXPIRED) {
            throw expiredInvitation();
        }

        if (invitation.getStatus() != CustomerInvitationStatus.PENDING) {
            throw new BusinessException(
                    ApiErrorCode.INVALID_CUSTOMER_INVITATION_TOKEN,
                    "La invitación ya no está disponible."
            );
        }

        if (invitation.isExpired(Instant.now())) {
            throw expiredInvitation();
        }

        return invitation;
    }

    private void validateTargetCanBeInvited(Long customerId, String email) {
        Optional<User> targetUser = userRepository.findByEmail(email);
        if (targetUser.isEmpty()) {
            return;
        }

        User user = targetUser.get();
        if (user.getAccountType() != AccountType.CUSTOMER) {
            throw new BusinessException(
                    ApiErrorCode.DATA_CONFLICT,
                    "El correo pertenece a una cuenta interna y no puede añadirse como miembro cliente."
            );
        }

        membershipRepository.findByCustomer_IdAndUser_Id(customerId, user.getId())
                .filter(membership -> membership.getStatus() == CustomerMembershipStatus.ACTIVE)
                .ifPresent(membership -> {
                    throw new BusinessException(
                            ApiErrorCode.DATA_CONFLICT,
                            "El usuario ya es miembro activo de la empresa."
                    );
                });
    }

    private void expirePreviousInvitationIfNecessary(Long customerId, String email, Instant now) {
        Optional<CustomerInvitation> pending = invitationRepository.findByCustomer_IdAndEmailAndStatus(
                customerId,
                email,
                CustomerInvitationStatus.PENDING
        );

        if (pending.isEmpty()) {
            return;
        }

        CustomerInvitation existing = pending.get();
        if (!existing.isExpired(now)) {
            throw new BusinessException(
                    ApiErrorCode.DATA_CONFLICT,
                    "Ya existe una invitación pendiente para ese correo en esta empresa."
            );
        }

        existing.markExpired();
        invitationRepository.saveAndFlush(existing);
    }

    private CustomerMembership activateMembership(
            CustomerInvitation invitation,
            User user,
            Instant acceptedAt
    ) {
        Optional<CustomerMembership> existing = membershipRepository.findByCustomer_IdAndUser_Id(
                invitation.getCustomer().getId(),
                user.getId()
        );

        if (existing.isPresent()) {
            CustomerMembership membership = existing.get();
            if (membership.getStatus() == CustomerMembershipStatus.ACTIVE) {
                throw new BusinessException(
                        ApiErrorCode.DATA_CONFLICT,
                        "El usuario ya es miembro activo de la empresa."
                );
            }

            membership.activateFromInvitation(
                    invitation.getRole(),
                    invitation.getInvitedByUser(),
                    acceptedAt
            );
            return membershipRepository.save(membership);
        }

        CustomerMembership membership = CustomerMembership.acceptedInvitation(
                invitation.getCustomer(),
                user,
                invitation.getRole(),
                invitation.getInvitedByUser(),
                acceptedAt
        );
        return membershipRepository.save(membership);
    }

    private CustomerMembership requireActiveAdmin(Long userId, Long customerId) {
        CustomerMembership membership = membershipRepository.findByCustomer_IdAndUser_IdAndStatus(
                        customerId,
                        userId,
                        CustomerMembershipStatus.ACTIVE
                )
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.ACCESS_DENIED,
                        "No tienes acceso a esta empresa."
                ));

        if (membership.getRole() != CustomerMembershipRole.ADMIN) {
            throw new BusinessException(
                    ApiErrorCode.ACCESS_DENIED,
                    "Solo un administrador de la empresa puede invitar miembros."
            );
        }

        return membership;
    }

    private BusinessException expiredInvitation() {
        return new BusinessException(
                ApiErrorCode.CUSTOMER_INVITATION_EXPIRED,
                "La invitación ha expirado."
        );
    }

    private BusinessException existingAccountForInvitation() {
        return new BusinessException(
                ApiErrorCode.DATA_CONFLICT,
                "Ya existe una cuenta asociada a este correo. Inicia sesión para aceptar la invitación."
        );
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
