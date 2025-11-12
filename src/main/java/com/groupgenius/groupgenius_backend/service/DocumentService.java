package com.groupgenius.groupgenius_backend.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

@Service
public class DocumentService {

    // In-memory storage for documents: docId -> Document object
    private final ConcurrentHashMap<String, Document> documentStore = new ConcurrentHashMap<>();
    
    // DateTime formatter for consistent timestamp display
    private static final DateTimeFormatter TIMESTAMP_FORMATTER = 
        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    // Enhanced Document model with versioning
    static class Document {
        private String id;
        private String content;
        private LocalDateTime createdAt;
        private LocalDateTime lastUpdated;
        private String lastUpdatedBy;
        private int version;
        private String title;

        public Document(String id, String content, String lastUpdatedBy, String title) {
            this.id = id;
            this.content = content;
            this.lastUpdatedBy = lastUpdatedBy;
            this.title = title;
            this.createdAt = LocalDateTime.now();
            this.lastUpdated = LocalDateTime.now();
            this.version = 1;
        }

        public String getId() {
            return id;
        }

        public String getContent() {
            return content;
        }

        public LocalDateTime getCreatedAt() {
            return createdAt;
        }

        public LocalDateTime getLastUpdated() {
            return lastUpdated;
        }

        public String getLastUpdatedBy() {
            return lastUpdatedBy;
        }

        public int getVersion() {
            return version;
        }

        public String getTitle() {
            return title;
        }

        public void setContent(String content, String updatedBy) {
            this.content = content;
            this.lastUpdated = LocalDateTime.now();
            this.lastUpdatedBy = updatedBy;
            this.version++;
        }

        public void setTitle(String title, String updatedBy) {
            this.title = title;
            this.lastUpdated = LocalDateTime.now();
            this.lastUpdatedBy = updatedBy;
        }

        public String getFormattedCreatedAt() {
            return createdAt.format(TIMESTAMP_FORMATTER);
        }

        public String getFormattedLastUpdated() {
            return lastUpdated.format(TIMESTAMP_FORMATTER);
        }

        public DocumentSnapshot createSnapshot() {
            return new DocumentSnapshot(this.id, this.content, this.title, this.version, 
                                      this.lastUpdatedBy, this.lastUpdated);
        }
    }

    // Snapshot class for document state
    static class DocumentSnapshot {
        private final String id;
        private final String content;
        private final String title;
        private final int version;
        private final String lastUpdatedBy;
        private final LocalDateTime lastUpdated;

        public DocumentSnapshot(String id, String content, String title, int version, 
                               String lastUpdatedBy, LocalDateTime lastUpdated) {
            this.id = id;
            this.content = content;
            this.title = title;
            this.version = version;
            this.lastUpdatedBy = lastUpdatedBy;
            this.lastUpdated = lastUpdated;
        }

        // Getters
        public String getId() { return id; }
        public String getContent() { return content; }
        public String getTitle() { return title; }
        public int getVersion() { return version; }
        public String getLastUpdatedBy() { return lastUpdatedBy; }
        public LocalDateTime getLastUpdated() { return lastUpdated; }
        public String getFormattedLastUpdated() { 
            return lastUpdated.format(TIMESTAMP_FORMATTER); 
        }
    }

    // ✅ Update document content with enhanced logic
    public Document updateDocument(String docId, String newContent, String updatedBy) {
        return updateDocument(docId, newContent, updatedBy, null);
    }

    // ✅ Update document with title change
    public Document updateDocument(String docId, String newContent, String updatedBy, String newTitle) {
        if (docId == null || docId.trim().isEmpty()) {
            throw new IllegalArgumentException("Document ID cannot be null or empty");
        }
        if (updatedBy == null || updatedBy.trim().isEmpty()) {
            throw new IllegalArgumentException("UpdatedBy cannot be null or empty");
        }

        Document doc = documentStore.get(docId);
        if (doc == null) {
            // Create new document if it doesn't exist
            String title = (newTitle != null) ? newTitle : "Untitled Document";
            doc = new Document(docId, newContent != null ? newContent : "", updatedBy, title);
            documentStore.put(docId, doc);
            System.out.println("Created new document: " + docId + " by " + updatedBy);
        } else {
            // Update existing document
            if (newContent != null) {
                doc.setContent(newContent, updatedBy);
            }
            if (newTitle != null) {
                doc.setTitle(newTitle, updatedBy);
            }
            System.out.println("Updated document: " + docId + " by " + updatedBy + " (v" + doc.getVersion() + ")");
        }
        return doc;
    }

    // ✅ Update document title only
    public Document updateDocumentTitle(String docId, String newTitle, String updatedBy) {
        Document doc = getDocument(docId);
        if (doc == null) {
            throw new IllegalArgumentException("Document not found: " + docId);
        }
        doc.setTitle(newTitle, updatedBy);
        return doc;
    }

    // ✅ Fetch document with enhanced error handling
    public Document getDocument(String docId) {
        if (docId == null || docId.trim().isEmpty()) {
            throw new IllegalArgumentException("Document ID cannot be null or empty");
        }
        
        Document doc = documentStore.get(docId);
        if (doc == null) {
            System.out.println("Document not found: " + docId);
        }
        return doc;
    }

    // ✅ Get document snapshot (immutable state)
    public DocumentSnapshot getDocumentSnapshot(String docId) {
        Document doc = getDocument(docId);
        return doc != null ? doc.createSnapshot() : null;
    }

    // ✅ Check if document exists
    public boolean documentExists(String docId) {
        return documentStore.containsKey(docId);
    }

    // ✅ Get all document IDs
    public java.util.Set<String> getAllDocumentIds() {
        return documentStore.keySet();
    }

    // ✅ Get document count
    public int getDocumentCount() {
        return documentStore.size();
    }

    // ✅ Delete document
    public boolean deleteDocument(String docId) {
        if (docId == null) {
            return false;
        }
        Document removed = documentStore.remove(docId);
        if (removed != null) {
            System.out.println("Deleted document: " + docId);
            return true;
        }
        return false;
    }

    // ✅ Create new document
    public Document createDocument(String docId, String initialContent, String createdBy, String title) {
        if (documentExists(docId)) {
            throw new IllegalArgumentException("Document already exists: " + docId);
        }
        return updateDocument(docId, initialContent, createdBy, title);
    }

    // ✅ Search documents by content (basic implementation)
    public java.util.List<DocumentSnapshot> searchDocuments(String keyword) {
        java.util.List<DocumentSnapshot> results = new java.util.ArrayList<>();
        String lowerKeyword = keyword.toLowerCase();
        
        for (Document doc : documentStore.values()) {
            if (doc.getContent().toLowerCase().contains(lowerKeyword) || 
                doc.getTitle().toLowerCase().contains(lowerKeyword)) {
                results.add(doc.createSnapshot());
            }
        }
        
        return results;
    }
}