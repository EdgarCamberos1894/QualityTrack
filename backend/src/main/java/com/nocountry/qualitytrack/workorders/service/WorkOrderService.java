package com.nocountry.qualitytrack.workorders.service;

import com.nocountry.qualitytrack.quotations.entity.Quotation;
import com.nocountry.qualitytrack.quotations.enums.QuotationStatus;
import com.nocountry.qualitytrack.quotations.repository.QuotationRepository;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.workorders.dto.response.WorkOrderDetailResponse;
import com.nocountry.qualitytrack.workorders.dto.response.WorkOrderResponse;
import com.nocountry.qualitytrack.workorders.entity.WorkOrder;
import com.nocountry.qualitytrack.workorders.repository.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkOrderService {

    private final WorkOrderRepository workOrderRepository;
    private final QuotationRepository quotationRepository;
    private final WorkOrderAccessPolicy accessPolicy;
    private final WorkOrderSourceService sourceService;

    @Transactional(readOnly = true)
    public List<WorkOrderResponse> list(Long currentUserId) {
        accessPolicy.requireInternalReader(currentUserId);
        return workOrderRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(WorkOrderResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public WorkOrderDetailResponse get(Long currentUserId, Long workOrderId) {
        accessPolicy.requireInternalReader(currentUserId);

        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.RESOURCE_NOT_FOUND,
                        "No se encontró la orden de trabajo."
                ));

        Quotation approvedQuotation = requireApprovedQuotation(workOrder.getJobCase().getId());

        return WorkOrderDetailResponse.from(
                workOrder,
                approvedQuotation,
                sourceService.get(currentUserId, workOrder)
        );
    }

    private Quotation requireApprovedQuotation(Long caseId) {
        return quotationRepository.findByJobCase_IdAndStatus(caseId, QuotationStatus.APPROVED)
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.DATA_CONFLICT,
                        "La orden de trabajo no tiene una cotización aprobada asociada al expediente."
                ));
    }
}
