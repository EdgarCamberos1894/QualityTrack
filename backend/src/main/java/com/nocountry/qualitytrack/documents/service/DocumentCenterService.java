package com.nocountry.qualitytrack.documents.service;

import com.nocountry.qualitytrack.deliveries.repository.DeliveryRepository;
import com.nocountry.qualitytrack.documents.dto.response.DocumentCenterResponse;
import com.nocountry.qualitytrack.documents.entity.Document;
import com.nocountry.qualitytrack.documents.entity.DocumentVersion;
import com.nocountry.qualitytrack.documents.enums.DocumentContext;
import com.nocountry.qualitytrack.documents.enums.DocumentStatus;
import com.nocountry.qualitytrack.documents.repository.DocumentRepository;
import com.nocountry.qualitytrack.documents.repository.DocumentVersionRepository;
import com.nocountry.qualitytrack.materials.repository.MaterialLotRepository;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.workorders.repository.WorkOrderDocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentCenterService {

    private final DocumentRepository documentRepository;
    private final DocumentVersionRepository documentVersionRepository;
    private final WorkOrderDocumentRepository workOrderDocumentRepository;
    private final MaterialLotRepository materialLotRepository;
    private final DeliveryRepository deliveryRepository;
    private final DocumentAccessService accessService;

    @Transactional(readOnly = true)
    public List<DocumentCenterResponse> search(
            Long currentUserId,
            Long customerId,
            Long caseId,
            Long workOrderId,
            Long materialLotId,
            Long deliveryId,
            String documentType,
            DocumentContext context
    ) {
        accessService.requireInternalReader(currentUserId);

        List<Document> documents = documentRepository.searchActiveForCenter(
                DocumentStatus.ACTIVE,
                caseId,
                customerId,
                normalizeType(documentType),
                workOrderId,
                materialLotId,
                deliveryId
        );

        if (documents.isEmpty()) {
            return List.of();
        }

        List<Long> documentIds = documents.stream()
                .map(Document::getId)
                .toList();

        Map<Long, DocumentVersion> latestVersions = documentVersionRepository
                .findLatestByDocumentIds(documentIds)
                .stream()
                .collect(Collectors.toMap(
                        version -> version.getDocument().getId(),
                        Function.identity()
                ));

        List<DocumentCenterResponse> response = new ArrayList<>();

        for (Document document : documents) {
            List<Long> workOrderIds = workOrderDocumentRepository
                    .findWorkOrderIdsByDocumentId(document.getId());
            List<Long> materialLotIds = materialLotRepository
                    .findIdsByCertificateDocumentId(document.getId());
            List<Long> deliveryIds = deliveryRepository
                    .findIdsByEvidenceDocumentId(document.getId());

            LinkedHashSet<DocumentContext> contexts = contexts(
                    workOrderIds,
                    materialLotIds,
                    deliveryIds
            );

            if (context != null && !contexts.contains(context)) {
                continue;
            }

            DocumentVersion latestVersion = latestVersions.get(document.getId());
            if (latestVersion == null) {
                throw new BusinessException(
                        ApiErrorCode.DATA_CONFLICT,
                        "El documento no tiene una versión disponible."
                );
            }

            response.add(DocumentCenterResponse.from(
                    document,
                    latestVersion,
                    contexts,
                    workOrderIds,
                    materialLotIds,
                    deliveryIds
            ));
        }

        return response;
    }

    private LinkedHashSet<DocumentContext> contexts(
            List<Long> workOrderIds,
            List<Long> materialLotIds,
            List<Long> deliveryIds
    ) {
        LinkedHashSet<DocumentContext> contexts = new LinkedHashSet<>();

        if (!workOrderIds.isEmpty()) {
            contexts.add(DocumentContext.WORK_ORDER);
        }
        if (!materialLotIds.isEmpty()) {
            contexts.add(DocumentContext.MATERIAL);
        }
        if (!deliveryIds.isEmpty()) {
            contexts.add(DocumentContext.DELIVERY);
        }
        if (contexts.isEmpty()) {
            contexts.add(DocumentContext.CASE);
        }

        return contexts;
    }

    private String normalizeType(String documentType) {
        if (documentType == null || documentType.isBlank()) {
            return null;
        }
        return documentType.trim().toUpperCase(Locale.ROOT);
    }
}
