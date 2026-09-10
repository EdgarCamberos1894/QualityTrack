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
import com.nocountry.qualitytrack.users.enums.UserStatus;
import com.nocountry.qualitytrack.users.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomerInvitationServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private CustomerMembershipRepository membershipRepository;

    @Mock
    private CustomerInvitationRepository invitationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private OpaqueTokenService opaqueTokenService;

    @Mock
    private EmailService emailService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private Customer customer;

    @Mock
    private User inviter;

    @Mock
    private User invitedUser;

    @Mock
    private CustomerMembership adminMembership;

    private CustomerInvitationService service;

    @BeforeEach
    void setUp() {
        service = new CustomerInvitationService(
                customerRepository,
                membershipRepository,
                invitationRepository,
                userRepository,
                opaqueTokenService,
                emailService,
                passwordEncoder,
                Duration.ofHours(72)
        );
    }

    @Test
    void createsInvitationOnlyAfterAdminAuthorization() {
        CreateCustomerInvitationRequest request = new CreateCustomerInvitationRequest(
                " MEMBER@Example.com ",
                CustomerMembershipRole.REQUESTER
        );

        when(customerRepository.findByIdForUpdate(20L)).thenReturn(Optional.of(customer));
        when(membershipRepository.findByCustomer_IdAndUser_IdAndStatus(
                20L,
                10L,
                CustomerMembershipStatus.ACTIVE
        )).thenReturn(Optional.of(adminMembership));
        when(adminMembership.getRole()).thenReturn(CustomerMembershipRole.ADMIN);
        when(adminMembership.getUser()).thenReturn(inviter);
        when(customer.getId()).thenReturn(20L);
        when(customer.getName()).thenReturn("Taller Norte");
        when(userRepository.findByEmail("member@example.com")).thenReturn(Optional.empty());
        when(invitationRepository.findByCustomer_IdAndEmailAndStatus(
                20L,
                "member@example.com",
                CustomerInvitationStatus.PENDING
        )).thenReturn(Optional.empty());
        when(opaqueTokenService.generate()).thenReturn(
                new OpaqueTokenService.GeneratedOpaqueToken("raw-token", "token-hash")
        );
        when(invitationRepository.saveAndFlush(any(CustomerInvitation.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        CustomerInvitationResponse response = service.createInvitation(10L, 20L, request);

        assertEquals("member@example.com", response.email());
        assertEquals(CustomerMembershipRole.REQUESTER, response.role());
        assertEquals(CustomerInvitationStatus.PENDING, response.status());
        assertNotNull(response.expiresAt());

        ArgumentCaptor<CustomerInvitation> invitationCaptor = ArgumentCaptor.forClass(CustomerInvitation.class);
        verify(invitationRepository).saveAndFlush(invitationCaptor.capture());
        assertEquals("token-hash", invitationCaptor.getValue().getTokenHash());
        assertEquals(inviter, invitationCaptor.getValue().getInvitedByUser());

        verify(emailService).sendCustomerInvitationEmail(
                "member@example.com",
                "raw-token",
                "Taller Norte",
                "REQUESTER"
        );
    }

    @Test
    void rejectsInvitationFromNonAdminMember() {
        CreateCustomerInvitationRequest request = new CreateCustomerInvitationRequest(
                "member@example.com",
                CustomerMembershipRole.VIEWER
        );

        when(customerRepository.findByIdForUpdate(20L)).thenReturn(Optional.of(customer));
        when(membershipRepository.findByCustomer_IdAndUser_IdAndStatus(
                20L,
                10L,
                CustomerMembershipStatus.ACTIVE
        )).thenReturn(Optional.of(adminMembership));
        when(adminMembership.getRole()).thenReturn(CustomerMembershipRole.REQUESTER);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.createInvitation(10L, 20L, request)
        );

        assertEquals(ApiErrorCode.ACCESS_DENIED, exception.getCode());
        verify(opaqueTokenService, never()).generate();
        verify(emailService, never()).sendCustomerInvitationEmail(any(), any(), any(), any());
    }

    @Test
    void rejectsInvitationForExistingActiveMember() {
        CreateCustomerInvitationRequest request = new CreateCustomerInvitationRequest(
                "member@example.com",
                CustomerMembershipRole.VIEWER
        );

        when(customerRepository.findByIdForUpdate(20L)).thenReturn(Optional.of(customer));
        when(membershipRepository.findByCustomer_IdAndUser_IdAndStatus(
                20L,
                10L,
                CustomerMembershipStatus.ACTIVE
        )).thenReturn(Optional.of(adminMembership));
        when(adminMembership.getRole()).thenReturn(CustomerMembershipRole.ADMIN);
        when(adminMembership.getUser()).thenReturn(inviter);
        when(userRepository.findByEmail("member@example.com")).thenReturn(Optional.of(invitedUser));
        when(invitedUser.getAccountType()).thenReturn(AccountType.CUSTOMER);
        when(invitedUser.getId()).thenReturn(30L);

        CustomerMembership existingMembership = CustomerMembership.acceptedInvitation(
                customer,
                invitedUser,
                CustomerMembershipRole.VIEWER,
                inviter,
                Instant.now()
        );
        when(membershipRepository.findByCustomer_IdAndUser_Id(20L, 30L))
                .thenReturn(Optional.of(existingMembership));

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.createInvitation(10L, 20L, request)
        );

        assertEquals(ApiErrorCode.DATA_CONFLICT, exception.getCode());
        verify(opaqueTokenService, never()).generate();
    }

    @Test
    void acceptsInvitationAndCreatesMembership() {
        when(userRepository.findById(30L)).thenReturn(Optional.of(invitedUser));
        when(invitedUser.getAccountType()).thenReturn(AccountType.CUSTOMER);
        when(invitedUser.getEmail()).thenReturn("member@example.com");
        when(invitedUser.getId()).thenReturn(30L);
        when(customer.getId()).thenReturn(20L);
        when(opaqueTokenService.hash("raw-token")).thenReturn("token-hash");

        CustomerInvitation invitation = CustomerInvitation.create(
                customer,
                "member@example.com",
                CustomerMembershipRole.REQUESTER,
                "token-hash",
                Instant.now().plus(Duration.ofHours(1)),
                inviter
        );
        when(invitationRepository.findByTokenHash("token-hash")).thenReturn(Optional.of(invitation));
        when(membershipRepository.findByCustomer_IdAndUser_Id(20L, 30L)).thenReturn(Optional.empty());
        when(membershipRepository.save(any(CustomerMembership.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        CustomerMemberResponse response = service.acceptInvitation(
                30L,
                new AcceptCustomerInvitationRequest(" raw-token ")
        );

        assertEquals(CustomerMembershipRole.REQUESTER, response.role());
        assertEquals(CustomerMembershipStatus.ACTIVE, response.status());
        assertNotNull(response.joinedAt());
        assertEquals(CustomerInvitationStatus.ACCEPTED, invitation.getStatus());
        assertEquals(invitedUser, invitation.getAcceptedByUser());
        assertNotNull(invitation.getAcceptedAt());
        verify(invitationRepository).save(invitation);
    }

    @Test
    void completesRegistrationAndAcceptsInvitationForNewUser() {
        when(opaqueTokenService.hash("raw-token")).thenReturn("token-hash");
        when(customer.getId()).thenReturn(20L);

        CustomerInvitation invitation = CustomerInvitation.create(
                customer,
                "member@example.com",
                CustomerMembershipRole.REQUESTER,
                "token-hash",
                Instant.now().plus(Duration.ofHours(1)),
                inviter
        );
        when(invitationRepository.findByTokenHash("token-hash")).thenReturn(Optional.of(invitation));
        when(userRepository.existsByEmail("member@example.com")).thenReturn(false);
        when(passwordEncoder.encode("StrongPass123")).thenReturn("encoded-password");
        when(userRepository.saveAndFlush(any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(membershipRepository.findByCustomer_IdAndUser_Id(20L, null)).thenReturn(Optional.empty());
        when(membershipRepository.save(any(CustomerMembership.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        CustomerMemberResponse response = service.completeRegistration(
                new CompleteCustomerInvitationRegistrationRequest(
                        " raw-token ",
                        " Juan ",
                        " Pérez ",
                        "StrongPass123"
                )
        );

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).saveAndFlush(userCaptor.capture());
        User createdUser = userCaptor.getValue();

        assertEquals("Juan", createdUser.getFirstName());
        assertEquals("Pérez", createdUser.getLastName());
        assertEquals("member@example.com", createdUser.getEmail());
        assertEquals("encoded-password", createdUser.getPasswordHash());
        assertEquals(AccountType.CUSTOMER, createdUser.getAccountType());
        assertEquals(UserStatus.ACTIVE, createdUser.getStatus());
        assertNotNull(createdUser.getEmailVerifiedAt());
        assertEquals(CustomerMembershipRole.REQUESTER, response.role());
        assertEquals(CustomerMembershipStatus.ACTIVE, response.status());
        assertEquals(CustomerInvitationStatus.ACCEPTED, invitation.getStatus());
        assertEquals(createdUser, invitation.getAcceptedByUser());
    }

    @Test
    void rejectsInvitationRegistrationWhenAccountAlreadyExists() {
        when(opaqueTokenService.hash("raw-token")).thenReturn("token-hash");

        CustomerInvitation invitation = CustomerInvitation.create(
                customer,
                "member@example.com",
                CustomerMembershipRole.VIEWER,
                "token-hash",
                Instant.now().plus(Duration.ofHours(1)),
                inviter
        );
        when(invitationRepository.findByTokenHash("token-hash")).thenReturn(Optional.of(invitation));
        when(userRepository.existsByEmail("member@example.com")).thenReturn(true);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.completeRegistration(
                        new CompleteCustomerInvitationRegistrationRequest(
                                "raw-token",
                                "Juan",
                                "Pérez",
                                "StrongPass123"
                        )
                )
        );

        assertEquals(ApiErrorCode.DATA_CONFLICT, exception.getCode());
        verify(passwordEncoder, never()).encode(any());
        verify(userRepository, never()).saveAndFlush(any(User.class));
    }

    @Test
    void rejectsInvitationWhenAuthenticatedEmailDoesNotMatch() {
        when(userRepository.findById(30L)).thenReturn(Optional.of(invitedUser));
        when(invitedUser.getAccountType()).thenReturn(AccountType.CUSTOMER);
        when(invitedUser.getEmail()).thenReturn("other@example.com");
        when(opaqueTokenService.hash("raw-token")).thenReturn("token-hash");

        CustomerInvitation invitation = CustomerInvitation.create(
                customer,
                "member@example.com",
                CustomerMembershipRole.VIEWER,
                "token-hash",
                Instant.now().plus(Duration.ofHours(1)),
                inviter
        );
        when(invitationRepository.findByTokenHash("token-hash")).thenReturn(Optional.of(invitation));

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.acceptInvitation(30L, new AcceptCustomerInvitationRequest("raw-token"))
        );

        assertEquals(ApiErrorCode.ACCESS_DENIED, exception.getCode());
        verify(membershipRepository, never()).save(any(CustomerMembership.class));
    }

    @Test
    void rejectsExpiredInvitation() {
        when(userRepository.findById(30L)).thenReturn(Optional.of(invitedUser));
        when(invitedUser.getAccountType()).thenReturn(AccountType.CUSTOMER);
        when(opaqueTokenService.hash("raw-token")).thenReturn("token-hash");

        CustomerInvitation invitation = CustomerInvitation.create(
                customer,
                "member@example.com",
                CustomerMembershipRole.VIEWER,
                "token-hash",
                Instant.now().minusSeconds(1),
                inviter
        );
        when(invitationRepository.findByTokenHash("token-hash")).thenReturn(Optional.of(invitation));

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.acceptInvitation(30L, new AcceptCustomerInvitationRequest("raw-token"))
        );

        assertEquals(ApiErrorCode.CUSTOMER_INVITATION_EXPIRED, exception.getCode());
        verify(membershipRepository, never()).save(any(CustomerMembership.class));
    }

    @Test
    void reactivatesRemovedMembershipOnAcceptance() {
        when(userRepository.findById(30L)).thenReturn(Optional.of(invitedUser));
        when(invitedUser.getAccountType()).thenReturn(AccountType.CUSTOMER);
        when(invitedUser.getEmail()).thenReturn("member@example.com");
        when(invitedUser.getId()).thenReturn(30L);
        when(customer.getId()).thenReturn(20L);
        when(opaqueTokenService.hash("raw-token")).thenReturn("token-hash");

        CustomerInvitation invitation = CustomerInvitation.create(
                customer,
                "member@example.com",
                CustomerMembershipRole.ADMIN,
                "token-hash",
                Instant.now().plus(Duration.ofHours(1)),
                inviter
        );
        when(invitationRepository.findByTokenHash("token-hash")).thenReturn(Optional.of(invitation));

        CustomerMembership membership = CustomerMembership.acceptedInvitation(
                customer,
                invitedUser,
                CustomerMembershipRole.VIEWER,
                inviter,
                Instant.now().minus(Duration.ofDays(10))
        );
        membership.remove(inviter, Instant.now().minus(Duration.ofDays(2)));

        when(membershipRepository.findByCustomer_IdAndUser_Id(20L, 30L))
                .thenReturn(Optional.of(membership));
        when(membershipRepository.save(membership)).thenReturn(membership);

        service.acceptInvitation(30L, new AcceptCustomerInvitationRequest("raw-token"));

        assertEquals(CustomerMembershipStatus.ACTIVE, membership.getStatus());
        assertEquals(CustomerMembershipRole.ADMIN, membership.getRole());
        assertNull(membership.getRemovedByUser());
        assertNull(membership.getRemovedAt());
        assertNotNull(membership.getJoinedAt());
    }
}
