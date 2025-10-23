package com.groupgenius.groupgenius_backend.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

/**
 * ChatService handles message saving, retrieval, and broadcasting logic.
 */
@Service
public class ChatService {

    // In-memory message persistence (replace with DB later if needed)
    private final List<Map<String, Object>> messages = new ArrayList<>();

    /**
     * Saves a message with sender and timestamp.
     *
     * @param sender  - user who sends the message
     * @param message - content of the message
     * @return saved message with metadata
     */
    public Map<String, Object> saveMessage(String sender, String message) {
        Map<String, Object> msgData = new HashMap<>();
        msgData.put("sender", sender);
        msgData.put("message", message);
        msgData.put("timestamp", LocalDateTime.now());

        messages.add(msgData);
        return msgData;
    }

    /**
     * Returns all messages.
     *
     * @return list of all stored messages
     */
    public List<Map<String, Object>> getMessages() {
        return new ArrayList<>(messages);
    }

    /**
     * Broadcasts a message (for now prints to console).
     *
     * @param sender  - sender of the message
     * @param message - message content
     */
    public void broadcastMessage(String sender, String message) {
        Map<String, Object> broadcastMsg = saveMessage(sender, message);
        System.out.println("Broadcasting message: " + broadcastMsg);
    }
}
