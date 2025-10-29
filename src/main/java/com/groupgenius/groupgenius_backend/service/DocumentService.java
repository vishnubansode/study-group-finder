package com.groupgenius.groupgenius_backend.service;

import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

@Service
public class DocumentService {

    // In-memory storage for documents: docId -> content
    private final ConcurrentHashMap<String, Document> documentStore = new ConcurrentHashMap<>();

    // Simple Document model
    static class Document {
        private String id;
        private String content;
        private LocalDateTime lastUpdated;

        public Document(String id, String content, LocalDateTime lastUpdated) {
            this.id = id;
            this.content = content;
            this.lastUpdated = lastUpdated;
        }

        public String getId() {
            return id;
        }

        public String getContent() {
            return content;
        }

        public LocalDateTime getLastUpdated() {
            return lastUpdated;
        }

        public void setContent(String content) {
            this.content = content;
            this.lastUpdated = LocalDateTime.now();
        }
    }

    // ✅ Update document content
    public Document updateDocument(String docId, String newContent) {
        Document doc = documentStore.get(docId);
        if (doc == null) {
            doc = new Document(docId, newContent, LocalDateTime.now());
            documentStore.put(docId, doc);
        } else {
            doc.setContent(newContent);
        }
        return doc;
    }

    // ✅ Fetch document
    public Document getDocument(String docId) {
        return documentStore.get(docId);
    }
}
