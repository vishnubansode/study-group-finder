package com.groupgenius.groupgenius_backend.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

/**
 * DocumentService handles updating and tracking documents.
 */
@Service
public class DocumentService {

    // In-memory storage for documents (use database later if needed)
    private final Map<String, String> documents = new HashMap<>();

    /**
     * Updates the content of a document.
     *
     * @param docId   - ID of the document
     * @param content - new content to save
     * @return response map with status and timestamp
     */
    public Map<String, Object> updateDocument(String docId, String content) {
        documents.put(docId, content);

        Map<String, Object> response = new HashMap<>();
        response.put("docId", docId);
        response.put("status", "updated");
        response.put("timestamp", LocalDateTime.now());

        return response;
    }
}
