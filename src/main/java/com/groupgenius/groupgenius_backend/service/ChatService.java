package com.groupgenius.groupgenius_backend.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

@Service
public class ChatService {

    // In-memory message storage: roomId -> list of messages
    private final Map<String, List<Message>> chatHistory = new ConcurrentHashMap<>();

    // Simple message model
    static class Message {
        private String sender;
        private String content;
        private LocalDateTime timestamp;

        public Message(String sender, String content, LocalDateTime timestamp) {
            this.sender = sender;
            this.content = content;
            this.timestamp = timestamp;
        }

        public String getSender() {
            return sender;
        }

        public String getContent() {
            return content;
        }

        public LocalDateTime getTimestamp() {
            return timestamp;
        }
    }

    // ✅ Save + timestamp message
    public Message saveMessage(String roomId, String sender, String content) {
        Message msg = new Message(sender, content, LocalDateTime.now());
        chatHistory.computeIfAbsent(roomId, k -> new ArrayList<>()).add(msg);
        return msg;
    }

    // ✅ Fetch + sort chat history (latest first)
    public List<Message> getMessages(String roomId) {
        List<Message> messages = chatHistory.getOrDefault(roomId, new ArrayList<>());
        messages.sort(Comparator.comparing(Message::getTimestamp));
        return messages;
    }

    // ✅ Broadcast a message with timestamp + sender tagging
    public String broadcastMessage(String roomId, String sender, String content) {
        Message msg = saveMessage(roomId, sender, content);
        // Normally you'd use WebSocket or message broker to push it to clients.
        return "[" + msg.getTimestamp() + "] " + msg.getSender() + ": " + msg.getContent();
    }
}
