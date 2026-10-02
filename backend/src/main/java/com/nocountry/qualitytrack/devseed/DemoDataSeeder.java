package com.nocountry.qualitytrack.devseed;

import com.nocountry.qualitytrack.customers.dto.request.CreateCustomerRequest;
import com.nocountry.qualitytrack.customers.dto.response.CustomerResponse;
import com.nocountry.qualitytrack.customers.entity.Customer;
import com.nocountry.qualitytrack.customers.entity.CustomerMembership;
import com.nocountry.qualitytrack.customers.enums.CustomerMembershipRole;
import com.nocountry.qualitytrack.customers.repository.CustomerMembershipRepository;
import com.nocountry.qualitytrack.customers.repository.CustomerRepository;
import com.nocountry.qualitytrack.customers.service.CustomerService;
import com.nocountry.qualitytrack.deliveries.dto.request.CompleteDeliveryRequest;
import com.nocountry.qualitytrack.deliveries.dto.request.CreateDeliveryRequest;
import com.nocountry.qualitytrack.deliveries.dto.request.DispatchDeliveryRequest;
import com.nocountry.qualitytrack.deliveries.dto.response.DeliveryResponse;
import com.nocountry.qualitytrack.deliveries.service.DeliveryService;
import com.nocountry.qualitytrack.documents.dto.request.CreateDocumentRequest;
import com.nocountry.qualitytrack.documents.dto.response.DocumentResponse;
import com.nocountry.qualitytrack.documents.service.DocumentService;
import com.nocountry.qualitytrack.production.dto.request.CompleteOperationExecutionRequest;
import com.nocountry.qualitytrack.production.dto.request.StartOperationExecutionRequest;
import com.nocountry.qualitytrack.production.dto.response.OperationExecutionResponse;
import com.nocountry.qualitytrack.production.service.ProductionWorkflowService;
import com.nocountry.qualitytrack.quality.dto.request.SaveQualityCheckRequest;
import com.nocountry.qualitytrack.quality.dto.request.StartQualityInspectionRequest;
import com.nocountry.qualitytrack.quality.dto.response.QualityInspectionResponse;
import com.nocountry.qualitytrack.quality.enums.QualityCheckResult;
import com.nocountry.qualitytrack.quality.enums.QualityCheckType;
import com.nocountry.qualitytrack.quality.service.QualityWorkflowService;
import com.nocountry.qualitytrack.quotations.dto.request.QuotationItemRequest;
import com.nocountry.qualitytrack.quotations.dto.request.UpdateQuotationRequest;
import com.nocountry.qualitytrack.quotations.dto.response.QuotationDetailResponse;
import com.nocountry.qualitytrack.quotations.repository.QuotationRepository;
import com.nocountry.qualitytrack.quotations.service.QuotationWorkflowService;
import com.nocountry.qualitytrack.requests.dto.request.CreateCaseInformationRequest;
import com.nocountry.qualitytrack.requests.dto.request.DefineCaseMaterialSpecificationRequest;
import com.nocountry.qualitytrack.requests.dto.request.SubmitCustomerRequest;
import com.nocountry.qualitytrack.requests.dto.response.CustomerRequestResponse;
import com.nocountry.qualitytrack.requests.enums.MaterialRequirementType;
import com.nocountry.qualitytrack.requests.enums.RequestDeliveryMode;
import com.nocountry.qualitytrack.requests.repository.JobCaseRepository;
import com.nocountry.qualitytrack.requests.service.CustomerRequestService;
import com.nocountry.qualitytrack.requests.service.JobCaseWorkflowService;
import com.nocountry.qualitytrack.routing.dto.request.CreateRoutingOperationRequest;
import com.nocountry.qualitytrack.routing.dto.response.RoutingOperationResponse;
import com.nocountry.qualitytrack.routing.dto.response.RoutingSheetResponse;
import com.nocountry.qualitytrack.routing.service.RoutingService;
import com.nocountry.qualitytrack.routing.service.RoutingWorkflowService;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.users.entity.UserSystemRole;
import com.nocountry.qualitytrack.users.enums.SystemRole;
import com.nocountry.qualitytrack.users.repository.UserRepository;
import com.nocountry.qualitytrack.users.repository.UserSystemRoleRepository;
import com.nocountry.qualitytrack.workorders.dto.request.CreateWorkOrderRequest;
import com.nocountry.qualitytrack.workorders.dto.response.WorkOrderDetailResponse;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderPriority;
import com.nocountry.qualitytrack.workorders.repository.WorkOrderRepository;
import com.nocountry.qualitytrack.workorders.service.WorkOrderDocumentService;
import com.nocountry.qualitytrack.workorders.service.WorkOrderWorkflowService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

@Component
@Profile("seed-demo")
@RequiredArgsConstructor
@Slf4j
public class DemoDataSeeder {

    private static final String SEED_MARKER_EMAIL = "auditor.demo@qualitytrack.test";

    private final UserRepository userRepository;
    private final UserSystemRoleRepository userSystemRoleRepository;
    private final CustomerRepository customerRepository;
    private final CustomerMembershipRepository customerMembershipRepository;
    private final JobCaseRepository jobCaseRepository;
    private final QuotationRepository quotationRepository;
    private final WorkOrderRepository workOrderRepository;
    private final PasswordEncoder passwordEncoder;

    private final CustomerService customerService;
    private final CustomerRequestService customerRequestService;
    private final JobCaseWorkflowService jobCaseWorkflowService;
    private final QuotationWorkflowService quotationWorkflowService;
    private final WorkOrderWorkflowService workOrderWorkflowService;
    private final DocumentService documentService;
    private final WorkOrderDocumentService workOrderDocumentService;
    private final RoutingService routingService;
    private final RoutingWorkflowService routingWorkflowService;
    private final ProductionWorkflowService productionWorkflowService;
    private final QualityWorkflowService qualityWorkflowService;
    private final DeliveryService deliveryService;

    @Value("${app.demo-seed.password}")
    private String demoPassword;

    @Value("${app.demo-seed.admin-email}")
    private String adminEmail;

    @EventListener(ApplicationReadyEvent.class)
    @Order(Ordered.LOWEST_PRECEDENCE)
    public void seedAfterStartup() {
        if (userRepository.existsByEmail(SEED_MARKER_EMAIL)) {
            log.info("Demo seed already present. Skipping.");
            return;
        }

        User admin = userRepository.findByEmailIgnoreCase(adminEmail)
                .orElseThrow(() -> new IllegalStateException(
                        "seed-demo requires the bootstrap admin to exist first: " + adminEmail
                ));

        requireCleanDatabase();

        log.info("Creating deterministic QualityTrack demo data...");
        InternalActors actors = createInternalActors(admin);

        DemoCustomer maquinados = createCustomer(
                "María", "López", "maria.lopez@maquinados.test",
                "Maquinados del Pacífico", "MDP260101AA1",
                "311-100-1100", "administracion@maquinados.test",
                "Tepic", "Nayarit", "https://maquinados.example"
        );
        addCustomerRequester(
                maquinados,
                "Daniel", "Ramos", "compras@maquinados.test"
        );

        DemoCustomer motores = createCustomer(
                "Juan", "Mendoza", "juan.mendoza@motores.test",
                "Motores del Norte", "MDN260101BB2",
                "614-200-2200", "compras@motores.test",
                "Chihuahua", "Chihuahua", "https://motores.example"
        );
        DemoCustomer atlas = createCustomer(
                "Laura", "García", "laura.garcia@atlas.test",
                "Grupo Atlas Industrial", "GAI260101CC3",
                "33-3000-3300", "operaciones@atlas.test",
                "Guadalajara", "Jalisco", "https://atlas.example"
        );
        DemoCustomer hidraulica = createCustomer(
                "Roberto", "Silva", "roberto.silva@hidraulica.test",
                "Hidráulica MX", "HMX260101DD4",
                "81-4000-4400", "contacto@hidraulica.test",
                "Monterrey", "Nuevo León", "https://hidraulica.example"
        );

        seedReviewScenarios(actors, maquinados);
        seedQuotationScenarios(actors, maquinados, motores);
        seedWorkOrderScenarios(actors, motores, atlas);
        seedQualityAndDeliveryScenarios(actors, atlas, hidraulica);

        createInternalUser(
                "Elena",
                "Vega",
                SEED_MARKER_EMAIL,
                SystemRole.AUDITOR,
                admin
        );

        log.info("QualityTrack demo seed completed.");
        log.info("Demo accounts use the password configured in DEMO_SEED_PASSWORD.");
    }

    private void requireCleanDatabase() {
        boolean hasDomainData = customerRepository.count() > 0
                || jobCaseRepository.count() > 0
                || quotationRepository.count() > 0
                || workOrderRepository.count() > 0;

        if (hasDomainData || userRepository.count() > 1) {
            throw new IllegalStateException(
                    "seed-demo only runs on a clean database containing only the bootstrap admin. "
                            + "Run scripts/dev/reset-and-seed.ps1 first."
            );
        }
    }

    private InternalActors createInternalActors(User admin) {
        return new InternalActors(
                createInternalUser(
                        "Ana", "López", "ana.comercial@qualitytrack.test",
                        SystemRole.COMMERCIAL, admin
                ),
                createInternalUser(
                        "Diego", "Ruiz", "diego.ingenieria@qualitytrack.test",
                        SystemRole.ENGINEERING, admin
                ),
                createInternalUser(
                        "Carlos", "Medina", "carlos.produccion@qualitytrack.test",
                        SystemRole.PRODUCTION, admin
                ),
                createInternalUser(
                        "Sofía", "Torres", "sofia.calidad@qualitytrack.test",
                        SystemRole.QUALITY, admin
                ),
                createInternalUser(
                        "Luis", "Navarro", "luis.logistica@qualitytrack.test",
                        SystemRole.LOGISTICS, admin
                ),
                admin
        );
    }

    private User createInternalUser(
            String firstName,
            String lastName,
            String email,
            SystemRole role,
            User assignedBy
    ) {
        User user = User.createActiveInternal(
                firstName,
                lastName,
                normalizeEmail(email),
                passwordEncoder.encode(demoPassword)
        );
        user = userRepository.saveAndFlush(user);
        userSystemRoleRepository.saveAndFlush(
                new UserSystemRole(user, role, assignedBy)
        );
        return user;
    }

    private User createActiveCustomerUser(
            String firstName,
            String lastName,
            String email
    ) {
        User user = User.registerCustomer(
                firstName,
                lastName,
                normalizeEmail(email),
                passwordEncoder.encode(demoPassword)
        );
        user.verifyEmail(Instant.now());
        return userRepository.saveAndFlush(user);
    }

    private DemoCustomer createCustomer(
            String firstName,
            String lastName,
            String ownerEmail,
            String companyName,
            String rfc,
            String phone,
            String administrativeEmail,
            String city,
            String state,
            String website
    ) {
        User owner = createActiveCustomerUser(firstName, lastName, ownerEmail);
        CustomerResponse response = customerService.createCustomer(
                owner.getId(),
                new CreateCustomerRequest(
                        companyName,
                        rfc,
                        phone,
                        administrativeEmail,
                        city,
                        state,
                        website
                )
        );
        Customer customer = customerRepository.findById(response.id())
                .orElseThrow();
        return new DemoCustomer(owner, customer);
    }

    private void addCustomerRequester(
            DemoCustomer demoCustomer,
            String firstName,
            String lastName,
            String email
    ) {
        User requester = createActiveCustomerUser(firstName, lastName, email);
        customerMembershipRepository.saveAndFlush(
                CustomerMembership.acceptedInvitation(
                        demoCustomer.customer(),
                        requester,
                        CustomerMembershipRole.REQUESTER,
                        demoCustomer.owner(),
                        Instant.now()
                )
        );
    }

    private void seedReviewScenarios(
            InternalActors actors,
            DemoCustomer customer
    ) {
        createRequest(
                customer,
                "MP-2026-001",
                "Fabricación de ejes para transmisión",
                20,
                MaterialRequirementType.SPECIFIED,
                "Acero inoxidable AISI 304"
        );

        DemoRequest underReview = createRequest(
                customer,
                "MP-2026-002",
                "Carcasa de aluminio CNC",
                12,
                MaterialRequirementType.SPECIFIED,
                "Aluminio 6061-T6"
        );
        take(actors, underReview);

        DemoRequest waiting = createRequest(
                customer,
                "MP-2026-003",
                "Eje principal para reductor",
                8,
                MaterialRequirementType.SPECIFIED,
                "Acero AISI 4140"
        );
        take(actors, waiting);
        jobCaseWorkflowService.requestInformation(
                actors.commercial().getId(),
                waiting.caseId(),
                new CreateCaseInformationRequest(
                        "¿Pueden confirmar la tolerancia final del diámetro de ajuste?"
                )
        );

        DemoRequest ready = createRequest(
                customer,
                "MP-2026-004",
                "Mecanizado de brida industrial",
                16,
                MaterialRequirementType.ASSISTANCE_REQUIRED,
                "Requerimos recomendación de material según carga y ambiente."
        );
        take(actors, ready);
        jobCaseWorkflowService.defineMaterialSpecification(
                actors.engineering().getId(),
                ready.caseId(),
                new DefineCaseMaterialSpecificationRequest(
                        "Acero al carbón",
                        "ASTM A36",
                        "Adecuado para la carga indicada y posterior protección superficial."
                )
        );
        jobCaseWorkflowService.completeReview(
                actors.commercial().getId(),
                ready.caseId()
        );
    }

    private void seedQuotationScenarios(
            InternalActors actors,
            DemoCustomer maquinados,
            DemoCustomer motores
    ) {
        DemoRequest draftRequest = readyRequest(
                actors,
                maquinados,
                "MP-2026-005",
                "Engrane helicoidal",
                24,
                "Acero AISI 8620"
        );
        createQuotationDraft(actors, draftRequest, "1850.00");

        DemoRequest sentRequest = readyRequest(
                actors,
                motores,
                "MN-2026-001",
                "Soporte de motor serie M",
                10,
                "Aluminio 6061-T6"
        );
        sendQuotation(
                actors,
                sentRequest,
                createQuotationDraft(actors, sentRequest, "2450.00")
        );

        DemoRequest approvedRequest = readyRequest(
                actors,
                motores,
                "MN-2026-002",
                "Polea dentada de precisión",
                18,
                "Acero AISI 1045"
        );
        approveQuotation(
                actors,
                approvedRequest,
                createQuotationDraft(actors, approvedRequest, "1320.00")
        );
    }

    private void seedWorkOrderScenarios(
            InternalActors actors,
            DemoCustomer motores,
            DemoCustomer atlas
    ) {
        createApprovedWorkOrder(
                actors,
                motores,
                "MN-2026-003",
                "Componente de acoplamiento",
                14,
                "Acero AISI 4140",
                WorkOrderPriority.NORMAL,
                "1780.00"
        );

        DemoWorkOrder readyForProduction = createApprovedWorkOrder(
                actors,
                motores,
                "MN-2026-004",
                "Placa base industrial",
                6,
                "Acero ASTM A36",
                WorkOrderPriority.HIGH,
                "5600.00"
        );
        prepareAndReleaseRouting(actors, readyForProduction);

        DemoWorkOrder inProduction = createApprovedWorkOrder(
                actors,
                atlas,
                "GA-2026-001",
                "Cuerpo de válvula",
                20,
                "Acero inoxidable AISI 316",
                WorkOrderPriority.URGENT,
                "3250.00"
        );
        RoutingSheetResponse inProductionRouting =
                prepareAndReleaseRouting(actors, inProduction);
        RoutingOperationResponse firstOperation =
                inProductionRouting.operations().get(0);
        productionWorkflowService.start(
                actors.production().getId(),
                firstOperation.id(),
                new StartOperationExecutionRequest(
                        null,
                        null,
                        "Inicio de producción del escenario demo."
                )
        );
    }

    private void seedQualityAndDeliveryScenarios(
            InternalActors actors,
            DemoCustomer atlas,
            DemoCustomer hidraulica
    ) {
        DemoWorkOrder qualityPending = createApprovedWorkOrder(
                actors,
                atlas,
                "GA-2026-002",
                "Brida de sellado",
                30,
                "Acero inoxidable AISI 304",
                WorkOrderPriority.HIGH,
                "980.00"
        );
        completeProduction(actors, qualityPending);
        qualityWorkflowService.handoff(
                actors.production().getId(),
                qualityPending.workOrderId()
        );

        DemoWorkOrder qualityHold = createApprovedWorkOrder(
                actors,
                atlas,
                "GA-2026-003",
                "Eje secundario",
                9,
                "Acero AISI 4140",
                WorkOrderPriority.URGENT,
                "2880.00"
        );
        QualityInspectionResponse failedInspection =
                handoffToQuality(actors, qualityHold);
        startInspection(actors, failedInspection);
        qualityWorkflowService.addCheck(
                actors.quality().getId(),
                failedInspection.id(),
                passFailCheck(
                        "Inspección dimensional final",
                        QualityCheckResult.FAIL,
                        "El diámetro de ajuste quedó fuera de tolerancia."
                )
        );
        qualityWorkflowService.complete(
                actors.quality().getId(),
                failedInspection.id()
        );

        DemoWorkOrder readyForDelivery = createApprovedWorkOrder(
                actors,
                hidraulica,
                "HM-2026-001",
                "Adaptador hidráulico",
                12,
                "Acero inoxidable AISI 316",
                WorkOrderPriority.NORMAL,
                "2150.00"
        );
        approveQuality(actors, readyForDelivery);

        DemoWorkOrder preparedDelivery = createApprovedWorkOrder(
                actors,
                hidraulica,
                "HM-2026-002",
                "Bloque distribuidor hidráulico",
                5,
                "Acero AISI 1045",
                WorkOrderPriority.HIGH,
                "6400.00"
        );
        approveQuality(actors, preparedDelivery);
        createDelivery(actors, preparedDelivery);

        DemoWorkOrder dispatchedDelivery = createApprovedWorkOrder(
                actors,
                hidraulica,
                "HM-2026-003",
                "Manifold hidráulico",
                7,
                "Aluminio 7075-T6",
                WorkOrderPriority.HIGH,
                "4900.00"
        );
        approveQuality(actors, dispatchedDelivery);
        DeliveryResponse dispatched = createDelivery(actors, dispatchedDelivery);
        deliveryService.dispatch(
                actors.logistics().getId(),
                dispatched.id(),
                new DispatchDeliveryRequest(
                        "QualityTrack Demo Logistics",
                        "QT-DEMO-" + dispatched.id()
                )
        );

        DemoWorkOrder delivered = createApprovedWorkOrder(
                actors,
                hidraulica,
                "HM-2026-004",
                "Soporte de bomba",
                4,
                "Acero ASTM A36",
                WorkOrderPriority.NORMAL,
                "3750.00"
        );
        approveQuality(actors, delivered);
        DeliveryResponse completed = createDelivery(actors, delivered);
        deliveryService.dispatch(
                actors.logistics().getId(),
                completed.id(),
                new DispatchDeliveryRequest(
                        "QualityTrack Demo Logistics",
                        "QT-DEMO-" + completed.id()
                )
        );
        deliveryService.deliver(
                actors.logistics().getId(),
                completed.id(),
                new CompleteDeliveryRequest(
                        "Recepción de almacén",
                        Instant.now(),
                        null
                )
        );
    }

    private DemoRequest readyRequest(
            InternalActors actors,
            DemoCustomer customer,
            String customerReference,
            String title,
            int quantity,
            String material
    ) {
        DemoRequest request = createRequest(
                customer,
                customerReference,
                title,
                quantity,
                MaterialRequirementType.SPECIFIED,
                material
        );
        take(actors, request);
        jobCaseWorkflowService.completeReview(
                actors.commercial().getId(),
                request.caseId()
        );
        return request;
    }

    private DemoRequest createRequest(
            DemoCustomer customer,
            String customerReference,
            String title,
            int quantity,
            MaterialRequirementType materialType,
            String material
    ) {
        CustomerRequestResponse response = customerRequestService.submit(
                customer.owner().getId(),
                customer.customer().getId(),
                new SubmitCustomerRequest(
                        customerReference,
                        title,
                        "Solicitud demo determinística para validar el flujo completo de QualityTrack.",
                        quantity,
                        materialType,
                        material,
                        LocalDate.now().plusDays(60),
                        RequestDeliveryMode.CUSTOM_ADDRESS,
                        null,
                        "Planta principal",
                        "Av. Industrial 1250",
                        customer.customer().getCity(),
                        customer.customer().getState(),
                        "63000",
                        "México",
                        "Recepción de materiales",
                        "311-555-0100",
                        "Entregar de lunes a viernes de 09:00 a 16:00."
                )
        );

        return new DemoRequest(
                customer,
                response.id(),
                response.jobCase().id(),
                title,
                quantity
        );
    }

    private void take(InternalActors actors, DemoRequest request) {
        jobCaseWorkflowService.take(
                actors.commercial().getId(),
                request.caseId()
        );
    }

    private QuotationDetailResponse createQuotationDraft(
            InternalActors actors,
            DemoRequest request,
            String unitPrice
    ) {
        QuotationDetailResponse quotation = quotationWorkflowService.create(
                actors.commercial().getId(),
                request.caseId()
        );

        return quotationWorkflowService.update(
                actors.commercial().getId(),
                quotation.id(),
                new UpdateQuotationRequest(
                        "MXN",
                        new BigDecimal("16.0000"),
                        LocalDate.now().plusDays(21),
                        LocalDate.now().plusDays(45),
                        List.of(
                                new QuotationItemRequest(
                                        null,
                                        request.title(),
                                        BigDecimal.valueOf(request.quantity()),
                                        new BigDecimal(unitPrice)
                                )
                        )
                )
        );
    }

    private QuotationDetailResponse sendQuotation(
            InternalActors actors,
            DemoRequest request,
            QuotationDetailResponse quotation
    ) {
        return quotationWorkflowService.send(
                actors.commercial().getId(),
                quotation.id(),
                null
        );
    }

    private void approveQuotation(
            InternalActors actors,
            DemoRequest request,
            QuotationDetailResponse quotation
    ) {
        QuotationDetailResponse sent = sendQuotation(actors, request, quotation);
        quotationWorkflowService.approve(
                request.customer().owner().getId(),
                request.customer().customer().getId(),
                sent.id()
        );
    }

    private DemoWorkOrder createApprovedWorkOrder(
            InternalActors actors,
            DemoCustomer customer,
            String customerReference,
            String title,
            int quantity,
            String material,
            WorkOrderPriority priority,
            String unitPrice
    ) {
        DemoRequest request = readyRequest(
                actors,
                customer,
                customerReference,
                title,
                quantity,
                material
        );
        QuotationDetailResponse quotation =
                createQuotationDraft(actors, request, unitPrice);
        approveQuotation(actors, request, quotation);

        WorkOrderDetailResponse workOrder = workOrderWorkflowService.create(
                actors.commercial().getId(),
                request.caseId(),
                new CreateWorkOrderRequest(
                        priority,
                        LocalDate.now().plusDays(2),
                        LocalDate.now().plusDays(20)
                )
        );

        return new DemoWorkOrder(
                request,
                workOrder.id(),
                quantity
        );
    }

    private RoutingSheetResponse prepareAndReleaseRouting(
            InternalActors actors,
            DemoWorkOrder workOrder
    ) {
        byte[] drawingContents = (
                "QualityTrack demo drawing\n"
                        + "Case: " + workOrder.request().caseId() + "\n"
                        + "Work order: " + workOrder.workOrderId() + "\n"
                        + "This file is generated only for local demo data.\n"
        ).getBytes(StandardCharsets.UTF_8);

        DocumentResponse drawing = documentService.create(
                actors.admin().getId(),
                new CreateDocumentRequest(
                        workOrder.request().caseId(),
                        "DRAWING",
                        "Plano de fabricación · " + workOrder.request().title(),
                        "Documento de prueba generado por el perfil seed-demo."
                ),
                new DemoMultipartFile(
                        "file",
                        "plano-demo-" + workOrder.workOrderId() + ".txt",
                        "text/plain",
                        drawingContents
                )
        );

        workOrderDocumentService.pin(
                actors.admin().getId(),
                workOrder.workOrderId(),
                drawing.id(),
                drawing.currentVersion().id()
        );

        RoutingSheetResponse routing = routingService.createProductionRouting(
                actors.engineering().getId(),
                workOrder.workOrderId()
        );
        routing = routingService.addOperation(
                actors.engineering().getId(),
                routing.id(),
                new CreateRoutingOperationRequest(
                        10,
                        "PREP-010",
                        "Preparación y montaje",
                        "Preparar material, fijación y referencias de trabajo.",
                        45
                )
        );
        routing = routingService.addOperation(
                actors.engineering().getId(),
                routing.id(),
                new CreateRoutingOperationRequest(
                        20,
                        "MEC-020",
                        "Mecanizado principal",
                        "Ejecutar mecanizado y verificar dimensiones críticas.",
                        120
                )
        );

        routingWorkflowService.approve(
                actors.engineering().getId(),
                routing.id()
        );
        return routingWorkflowService.release(
                actors.engineering().getId(),
                routing.id()
        );
    }

    private RoutingSheetResponse completeProduction(
            InternalActors actors,
            DemoWorkOrder workOrder
    ) {
        RoutingSheetResponse routing =
                prepareAndReleaseRouting(actors, workOrder);

        for (RoutingOperationResponse operation : routing.operations()) {
            OperationExecutionResponse execution =
                    productionWorkflowService.start(
                            actors.production().getId(),
                            operation.id(),
                            new StartOperationExecutionRequest(
                                    null,
                                    null,
                                    "Ejecución demo para " + operation.name() + "."
                            )
                    );

            productionWorkflowService.complete(
                    actors.production().getId(),
                    execution.id(),
                    new CompleteOperationExecutionRequest(
                            workOrder.quantity(),
                            workOrder.quantity(),
                            0,
                            "Operación terminada sin rechazos."
                    )
            );
        }

        return routing;
    }

    private QualityInspectionResponse handoffToQuality(
            InternalActors actors,
            DemoWorkOrder workOrder
    ) {
        completeProduction(actors, workOrder);
        return qualityWorkflowService.handoff(
                actors.production().getId(),
                workOrder.workOrderId()
        );
    }

    private void startInspection(
            InternalActors actors,
            QualityInspectionResponse inspection
    ) {
        qualityWorkflowService.start(
                actors.quality().getId(),
                inspection.id(),
                new StartQualityInspectionRequest(null)
        );
    }

    private void approveQuality(
            InternalActors actors,
            DemoWorkOrder workOrder
    ) {
        QualityInspectionResponse inspection =
                handoffToQuality(actors, workOrder);
        startInspection(actors, inspection);

        qualityWorkflowService.addCheck(
                actors.quality().getId(),
                inspection.id(),
                passFailCheck(
                        "Inspección final",
                        QualityCheckResult.PASS,
                        "Dimensiones y condición visual dentro de especificación."
                )
        );
        qualityWorkflowService.complete(
                actors.quality().getId(),
                inspection.id()
        );
    }

    private SaveQualityCheckRequest passFailCheck(
            String name,
            QualityCheckResult result,
            String notes
    ) {
        return new SaveQualityCheckRequest(
                QualityCheckType.PASS_FAIL,
                name,
                null,
                null,
                null,
                null,
                null,
                result,
                notes
        );
    }

    private DeliveryResponse createDelivery(
            InternalActors actors,
            DemoWorkOrder workOrder
    ) {
        return deliveryService.create(
                actors.logistics().getId(),
                workOrder.workOrderId(),
                new CreateDeliveryRequest(
                        workOrder.quantity(),
                        "Planta principal",
                        "Recepción de almacén",
                        "Av. Industrial 1250",
                        workOrder.request().customer().customer().getCity(),
                        workOrder.request().customer().customer().getState(),
                        "63000",
                        "México",
                        "Entregar en acceso de proveedores.",
                        "LOCAL_DELIVERY"
                )
        );
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private record InternalActors(
            User commercial,
            User engineering,
            User production,
            User quality,
            User logistics,
            User admin
    ) {
    }

    private record DemoCustomer(
            User owner,
            Customer customer
    ) {
    }

    private record DemoRequest(
            DemoCustomer customer,
            Long requestId,
            Long caseId,
            String title,
            int quantity
    ) {
    }

    private record DemoWorkOrder(
            DemoRequest request,
            Long workOrderId,
            int quantity
    ) {
    }
}
