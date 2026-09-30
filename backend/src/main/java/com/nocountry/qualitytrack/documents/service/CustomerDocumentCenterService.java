package com.nocountry.qualitytrack.documents.service;

import com.nocountry.qualitytrack.deliveries.entity.Delivery;
import com.nocountry.qualitytrack.deliveries.repository.DeliveryRepository;
import com.nocountry.qualitytrack.documents.dto.response.CustomerDocumentCenterResponse;
import com.nocountry.qualitytrack.documents.entity.Document;
import com.nocountry.qualitytrack.documents.entity.DocumentVersion;
import com.nocountry.qualitytrack.documents.enums.DocumentStatus;
import com.nocountry.qualitytrack.documents.repository.DocumentRepository;
import com.nocountry.qualitytrack.documents.repository.DocumentVersionRepository;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.users.enums.AccountType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerDocumentCenterService {

    private static final String DELIVERY_EVIDENCE_TYPE = "DELIVERY_EVIDENCE";

    private final DocumentRepository documentRepository;
    private final DocumentVersionRepository documentVersionRepository;
    private final DeliveryRepository deliveryRepository;
    private final DocumentAccessService accessService;

    @Transactional(readOnly = true)
    public List<CustomerDocumentCenterResponse> list(
            Long currentUserId,
            Long customerId
    ) {
        accessService.requireCustomerReader(currentUserId, customerId);

        List<Document> documents = documentRepository.searchActiveForCenter(
                DocumentStatus.ACTIVE,
                null,
                customerId,
                null,
                null,
                null,
                null
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

        Map<Long, List<Delivery>> deliveryReferences =
                deliveryRepository.findAllByEvidenceDocumentIds(documentIds)
                        .stream()
                        .collect(Collectors.groupingBy(
                                delivery -> delivery.getEvidenceDocumentVersion()
                                        .getDocument()
                                        .getId(),
                                LinkedHashMap::new,
                                Collectors.toList()
                        ));

        return documents.stream()
                .filter(document -> isCustomerVisible(
                        document,
                        deliveryReferences.getOrDefault(document.getId(), List.of())
                ))
                .map(document -> CustomerDocumentCenterResponse.from(
                        document,
                        requireLatestVersion(document, latestVersions),
                        customerId
                ))
                .toList();
    }

    private boolean isCustomerVisible(
            Document document,
            List<Delivery> deliveryReferences
    ) {
        if (document.getCreatedBy().getAccountType() == AccountType.CUSTOMER) {
            return true;
        }

        return DELIVERY_EVIDENCE_TYPE.equals(document.getDocumentType())
                && deliveryReferences.stream().anyMatch(accessService::isCustomerVisibleDelivery);
    }

    private DocumentVersion requireLatestVersion(
            Document document,
            Map<Long, DocumentVersion> latestVersions
    ) {
        DocumentVersion version = latestVersions.get(document.getId());
        if (version == null) {
            throw new BusinessException(
                    ApiErrorCode.DATA_CONFLICT,
                    "El documento no tiene una versión disponible."
            );
        }

        return version;
    }
}
