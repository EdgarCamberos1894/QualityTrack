package com.nocountry.qualitytrack.documents.documentation;

final class DocumentApiExamples {

    static final String DOCUMENT_CREATED = """
            {
              "success": true,
              "code": "DOCUMENT_CREATED",
              "message": "Documento creado correctamente.",
              "data": {
                "id": 7,
                "caseId": 12,
                "documentType": "DRAWING",
                "name": "Plano de eje",
                "description": "Plano recibido del cliente.",
                "createdByUserId": 42,
                "createdByName": "Ana López",
                "createdAt": "2026-09-10T23:40:00Z",
                "currentVersion": {
                  "id": 21,
                  "version": 1,
                  "fileName": "plano-eje.pdf",
                  "mimeType": "application/pdf",
                  "fileSize": 245812,
                  "checksum": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
                  "uploadedByUserId": 42,
                  "uploadedByName": "Ana López",
                  "uploadedAt": "2026-09-10T23:40:00Z"
                }
              }
            }
            """;

    static final String DOCUMENTS_RETRIEVED = """
            {
              "success": true,
              "code": "DOCUMENTS_RETRIEVED",
              "message": "Documentos del expediente consultados correctamente.",
              "data": [
                {
                  "id": 7,
                  "caseId": 12,
                  "documentType": "DRAWING",
                  "name": "Plano de eje",
                  "description": "Plano recibido del cliente.",
                  "createdByUserId": 42,
                  "createdByName": "Ana López",
                  "createdAt": "2026-09-10T23:40:00Z"
                }
              ]
            }
            """;

    static final String DOCUMENT_VERSION_CREATED = """
            {
              "success": true,
              "code": "DOCUMENT_VERSION_CREATED",
              "message": "Nueva versión del documento creada correctamente.",
              "data": {
                "id": 22,
                "version": 2,
                "fileName": "plano-eje-rev-b.pdf",
                "mimeType": "application/pdf",
                "fileSize": 251304,
                "checksum": "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789",
                "uploadedByUserId": 42,
                "uploadedByName": "Ana López",
                "uploadedAt": "2026-09-10T23:55:00Z"
              }
            }
            """;

    static final String DOCUMENT_VERSIONS_RETRIEVED = """
            {
              "success": true,
              "code": "DOCUMENT_VERSIONS_RETRIEVED",
              "message": "Versiones del documento consultadas correctamente.",
              "data": [
                {
                  "id": 21,
                  "version": 1,
                  "fileName": "plano-eje.pdf",
                  "mimeType": "application/pdf",
                  "fileSize": 245812,
                  "checksum": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
                  "uploadedByUserId": 42,
                  "uploadedByName": "Ana López",
                  "uploadedAt": "2026-09-10T23:40:00Z"
                },
                {
                  "id": 22,
                  "version": 2,
                  "fileName": "plano-eje-rev-b.pdf",
                  "mimeType": "application/pdf",
                  "fileSize": 251304,
                  "checksum": "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789",
                  "uploadedByUserId": 42,
                  "uploadedByName": "Ana López",
                  "uploadedAt": "2026-09-10T23:55:00Z"
                }
              ]
            }
            """;

    private DocumentApiExamples() {
    }
}
