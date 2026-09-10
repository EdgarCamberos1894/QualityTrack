package com.nocountry.qualitytrack.customers.service;

import com.nocountry.qualitytrack.customers.dto.request.CreateCustomerRequest;
import com.nocountry.qualitytrack.customers.dto.response.CustomerMemberResponse;
import com.nocountry.qualitytrack.customers.dto.response.CustomerResponse;
import com.nocountry.qualitytrack.customers.entity.Customer;
import com.nocountry.qualitytrack.customers.entity.CustomerMembership;
import com.nocountry.qualitytrack.customers.enums.CustomerMembershipStatus;
import com.nocountry.qualitytrack.customers.repository.CustomerMembershipRepository;
import com.nocountry.qualitytrack.customers.repository.CustomerRepository;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.users.enums.AccountType;
import com.nocountry.qualitytrack.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerMembershipRepository membershipRepository;
    private final UserRepository userRepository;

    @Transactional
    public CustomerResponse createCustomer(Long currentUserId, CreateCustomerRequest request) {
        User creator = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.RESOURCE_NOT_FOUND,
                        "No se encontró el usuario autenticado."
                ));

        if (creator.getAccountType() != AccountType.CUSTOMER) {
            throw new BusinessException(
                    ApiErrorCode.ACCESS_DENIED,
                    "Solo una cuenta de cliente puede crear una empresa."
            );
        }

        Customer customer = Customer.create(
                request.name().trim(),
                normalizeNullable(request.rfc()),
                normalizeNullable(request.phone()),
                normalizeNullable(request.administrativeEmail()),
                normalizeNullable(request.city()),
                normalizeNullable(request.state()),
                normalizeNullable(request.website()),
                creator
        );

        customer = customerRepository.saveAndFlush(customer);

        CustomerMembership initialMembership = CustomerMembership.initialAdmin(
                customer,
                creator,
                Instant.now()
        );
        membershipRepository.save(initialMembership);

        return CustomerResponse.from(customer);
    }

    @Transactional(readOnly = true)
    public List<CustomerMemberResponse> listMembers(Long currentUserId, Long customerId) {
        boolean activeMember = membershipRepository.existsByCustomer_IdAndUser_IdAndStatus(
                customerId,
                currentUserId,
                CustomerMembershipStatus.ACTIVE
        );

        if (!activeMember) {
            throw new BusinessException(
                    ApiErrorCode.ACCESS_DENIED,
                    "No tienes acceso a los miembros de esta empresa."
            );
        }

        return membershipRepository.findAllByCustomer_IdOrderByCreatedAtAsc(customerId)
                .stream()
                .map(CustomerMemberResponse::from)
                .toList();
    }

    private String normalizeNullable(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}
