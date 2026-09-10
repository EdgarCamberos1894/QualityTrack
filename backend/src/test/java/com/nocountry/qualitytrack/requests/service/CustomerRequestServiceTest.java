package com.nocountry.qualitytrack.requests.service;

import com.nocountry.qualitytrack.customers.entity.Customer;
import com.nocountry.qualitytrack.customers.entity.CustomerMembership;
import com.nocountry.qualitytrack.customers.enums.CustomerMembershipRole;
import com.nocountry.qualitytrack.customers.enums.CustomerMembershipStatus;
import com.nocountry.qualitytrack.customers.enums.CustomerStatus;
import com.nocountry.qualitytrack.customers.repository.CustomerMembershipRepository;
import com.nocountry.qualitytrack.requests.dto.request.SubmitCustomerRequest;
import com.nocountry.qualitytrack.requests.dto.response.CustomerRequestResponse;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.requests.enums.JobCaseStatus;
import com.nocountry.qualitytrack.requests.enums.MaterialRequirementType;
import com.nocountry.qualitytrack.requests.repository.CustomerRequestRepository;
import com.nocountry.qualitytrack.requests.repository.JobCaseRepository;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.users.entity.UserSystemRole;
import com.nocountry.qualitytrack.users.enums.AccountType;
import com.nocountry.qualitytrack.users.enums.SystemRole;
import com.nocountry.qualitytrack.users.repository.UserRepository;
import com.nocountry.qualitytrack.users.repository.UserSystemRoleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomerRequestServiceTest {

    @Mock
    private CustomerRequestRepository customerRequestRepository;

    @Mock
    private JobCaseRepository jobCaseRepository;

    @Mock
    private CustomerMembershipRepository membershipRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserSystemRoleRepository userSystemRoleRepository;

    @Mock
    private RequestReferenceGenerator referenceGenerator;

    @Mock
    private CustomerMembership membership;

    @Mock
    private Customer customer;

    @Mock
    private User user;

    @Mock
    private UserSystemRole systemRole;

    private CustomerRequestService service;

    @BeforeEach
    void setUp() {
        service = new CustomerRequestService(
                customerRequestRepository,
                jobCaseRepository,
                membershipRepository,
                userRepository,
                userSystemRoleRepository,
                referenceGenerator
        );
    }

    @Test
    void submitsRequestAndCreatesSubmittedJobCase() {
        SubmitCustomerRequest input = new SubmitCustomerRequest(
                " OC-4587 ",
                " Eje de transmisión ",
                " Fabricar conforme al plano proporcionado. ",
                25,
                MaterialRequirementType.SPECIFIED,
                " AISI 4140 ",
                LocalDate.now().plusDays(30)
        );

        when(membershipRepository.findByCustomer_IdAndUser_IdAndStatus(
                20L,
                10L,
                CustomerMembershipStatus.ACTIVE
        )).thenReturn(Optional.of(membership));
        when(membership.getRole()).thenReturn(CustomerMembershipRole.REQUESTER);
        when(membership.getCustomer()).thenReturn(customer);
        when(membership.getUser()).thenReturn(user);
        when(customer.getStatus()).thenReturn(CustomerStatus.ACTIVE);
        when(customer.getId()).thenReturn(20L);
        when(user.getId()).thenReturn(10L);
        when(user.getFirstName()).thenReturn("Ana");
        when(user.getLastName()).thenReturn("López");
        when(referenceGenerator.nextCustomerRequestNumber()).thenReturn("REQ-00000001");
        when(referenceGenerator.nextJobCaseNumber()).thenReturn("CASE-00000001");
        when(customerRequestRepository.saveAndFlush(any(com.nocountry.qualitytrack.requests.entity.CustomerRequest.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(jobCaseRepository.saveAndFlush(any(JobCase.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        CustomerRequestResponse response = service.submit(10L, 20L, input);

        assertEquals("REQ-00000001", response.requestNumber());
        assertEquals("OC-4587", response.customerReference());
        assertEquals("Eje de transmisión", response.title());
        assertEquals("AISI 4140", response.materialRequirement());
        assertEquals("CASE-00000001", response.jobCase().caseNumber());
        assertEquals(JobCaseStatus.SUBMITTED, response.jobCase().status());
        verify(customerRequestRepository).saveAndFlush(any(com.nocountry.qualitytrack.requests.entity.CustomerRequest.class));
        verify(jobCaseRepository).saveAndFlush(any(JobCase.class));
    }

    @Test
    void rejectsViewerSubmittingRequest() {
        SubmitCustomerRequest input = validInput();

        when(membershipRepository.findByCustomer_IdAndUser_IdAndStatus(
                20L,
                10L,
                CustomerMembershipStatus.ACTIVE
        )).thenReturn(Optional.of(membership));
        when(membership.getRole()).thenReturn(CustomerMembershipRole.VIEWER);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.submit(10L, 20L, input)
        );

        assertEquals(ApiErrorCode.ACCESS_DENIED, exception.getCode());
        verify(customerRequestRepository, never()).saveAndFlush(any());
        verify(jobCaseRepository, never()).saveAndFlush(any());
    }

    @Test
    void rejectsSubmissionForSuspendedCustomer() {
        SubmitCustomerRequest input = validInput();

        when(membershipRepository.findByCustomer_IdAndUser_IdAndStatus(
                20L,
                10L,
                CustomerMembershipStatus.ACTIVE
        )).thenReturn(Optional.of(membership));
        when(membership.getRole()).thenReturn(CustomerMembershipRole.ADMIN);
        when(membership.getCustomer()).thenReturn(customer);
        when(customer.getStatus()).thenReturn(CustomerStatus.SUSPENDED);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.submit(10L, 20L, input)
        );

        assertEquals(ApiErrorCode.ACCESS_DENIED, exception.getCode());
        verify(customerRequestRepository, never()).saveAndFlush(any());
    }

    @Test
    void allowsActiveViewerToListCompanyRequests() {
        when(membershipRepository.findByCustomer_IdAndUser_IdAndStatus(
                20L,
                10L,
                CustomerMembershipStatus.ACTIVE
        )).thenReturn(Optional.of(membership));
        when(jobCaseRepository.findAllByCustomerRequest_Customer_IdOrderByOpenedAtDesc(20L))
                .thenReturn(List.of());

        List<CustomerRequestResponse> response = service.listForCustomer(10L, 20L);

        assertEquals(0, response.size());
    }

    @Test
    void rejectsCustomerAccountFromInternalJobCaseList() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(user));
        when(user.getAccountType()).thenReturn(AccountType.CUSTOMER);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.listJobCases(10L)
        );

        assertEquals(ApiErrorCode.ACCESS_DENIED, exception.getCode());
        verify(userSystemRoleRepository, never()).findAllByIdUserId(10L);
        verify(jobCaseRepository, never()).findAllByOrderByOpenedAtDesc();
    }

    @Test
    void allowsCommercialToListJobCases() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(user));
        when(user.getAccountType()).thenReturn(AccountType.INTERNAL);
        when(userSystemRoleRepository.findAllByIdUserId(10L)).thenReturn(List.of(systemRole));
        when(systemRole.getRole()).thenReturn(SystemRole.COMMERCIAL);
        when(jobCaseRepository.findAllByOrderByOpenedAtDesc()).thenReturn(List.of());

        assertEquals(0, service.listJobCases(10L).size());
    }

    @Test
    void rejectsInternalRoleWithoutCaseVisibility() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(user));
        when(user.getAccountType()).thenReturn(AccountType.INTERNAL);
        when(userSystemRoleRepository.findAllByIdUserId(10L)).thenReturn(List.of(systemRole));
        when(systemRole.getRole()).thenReturn(SystemRole.PRODUCTION);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.listJobCases(10L)
        );

        assertEquals(ApiErrorCode.ACCESS_DENIED, exception.getCode());
        verify(jobCaseRepository, never()).findAllByOrderByOpenedAtDesc();
    }

    @Test
    void returnsNotFoundWhenRequestDoesNotBelongToCustomer() {
        when(membershipRepository.findByCustomer_IdAndUser_IdAndStatus(
                20L,
                10L,
                CustomerMembershipStatus.ACTIVE
        )).thenReturn(Optional.of(membership));
        when(jobCaseRepository.findByCustomerRequest_IdAndCustomerRequest_Customer_Id(31L, 20L))
                .thenReturn(Optional.empty());

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.getForCustomer(10L, 20L, 31L)
        );

        assertEquals(ApiErrorCode.RESOURCE_NOT_FOUND, exception.getCode());
    }

    private SubmitCustomerRequest validInput() {
        return new SubmitCustomerRequest(
                null,
                "Eje de transmisión",
                "Fabricar conforme al plano proporcionado.",
                25,
                MaterialRequirementType.SPECIFIED,
                "AISI 4140",
                LocalDate.now().plusDays(30)
        );
    }
}
