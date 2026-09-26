package com.nocountry.qualitytrack.workorders.service;

import com.nocountry.qualitytrack.workorders.dto.response.WorkOrderDocumentResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkOrderDocumentService {

    public List<WorkOrderDocumentResponse> listPinned(Long workOrderId) {
        return List.of();
    }
}
