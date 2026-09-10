package com.nocountry.qualitytrack.documents.storage;

import org.springframework.core.io.Resource;

import java.io.InputStream;

public interface DocumentStorage {

    StoredDocumentFile store(
            Long caseId,
            Integer version,
            InputStream inputStream
    );

    Resource load(String storageKey);

    void deleteQuietly(String storageKey);
}
