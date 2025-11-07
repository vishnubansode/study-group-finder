package com.groupgenius.groupgenius_backend.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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
    
    // DateTime formatter for consistent timestamp display
    private static final DateTimeFormatter TIMESTAMP_FORMATTER = 
        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    // Enhanced Message model with additional fields
    static class Message {
        private String sender;
        private String content;
        private LocalDateTime timestamp;
        private String messageId;
        private boolean isSystemMessage;

        public Message(String sender, String content, LocalDateTime timestamp) {
            this(sender, content, timestamp, false);
        }

        public Message(String sender, String content, LocalDateTime timestamp, boolean isSystemMessage) {
            this.sender = sender;
            this.content = content;
            this.timestamp = timestamp;
            this.messageId = generateMessageId();
            this.isSystemMessage = isSystemMessage;
        }

        private String generateMessageId() {
            return "msg_" + System.currentTimeMillis() + "_" + Math.random();
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

        public String getMessageId() {
            return messageId;
        }

        public boolean isSystemMessage() {
            return isSystemMessage;
        }

        public String getFormattedTimestamp() {
            return timestamp.format(TIMESTAMP_FORMATTER);
        }

        public String toFormattedString() {
            if (isSystemMessage) {
                return "[" + getFormattedTimestamp() + "] SYSTEM: " + content;
            } else {
                return "[" + getFormattedTimestamp() + "] " + sender + ": " + content;
            }
        }
    }

    // ✅ Save + timestamp message with enhanced validation
    public Message saveMessage(String roomId, String sender, String content) {
        return saveMessage(roomId, sender, content, false);
    }

    // ✅ Save system message
    public Message saveSystemMessage(String roomId, String content) {
        return saveMessage(roomId, "SYSTEM", content, true);
    }

    private Message saveMessage(String roomId, String sender, String content, boolean isSystemMessage) {
        if (roomId == null || roomId.trim().isEmpty()) {
            throw new IllegalArgumentException("Room ID cannot be null or empty");
        }
        if (sender == null || sender.trim().isEmpty()) {
            throw new IllegalArgumentException("Sender cannot be null or empty");
        }
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("Content cannot be null or empty");
        }

        Message msg = new Message(sender.trim(), content.trim(), LocalDateTime.now(), isSystemMessage);
        chatHistory.computeIfAbsent(roomId, k -> new ArrayList<>()).add(msg);
        
        // Auto-cleanup: Keep only last 1000 messages per room to prevent memory issues
        List<Message> roomMessages = chatHistory.get(roomId);
        if (roomMessages.size() > 1000) {
            roomMessages = roomMessages.subList(roomMessages.size() - 500, roomMessages.size());
            chatHistory.put(roomId, new ArrayList<>(roomMessages));
        }
        
        return msg;
    }

    // ✅ Fetch + sort chat history (latest first by default)
    public List<Message> getMessages(String roomId) {
        return getMessages(roomId, true);
    }

    // ✅ Fetch chat history with sorting option
    public List<Message> getMessages(String roomId, boolean latestFirst) {
        if (roomId == null || roomId.trim().isEmpty()) {
            throw new IllegalArgumentException("Room ID cannot be null or empty");
        }

        List<Message> messages = chatHistory.getOrDefault(roomId, new ArrayList<>());
        
        if (latestFirst) {
            // Sort by timestamp descending (latest first)
            messages.sort(Comparator.comparing(Message::getTimestamp).reversed());
        } else {
            // Sort by timestamp ascending (oldest first)
            messages.sort(Comparator.comparing(Message::getTimestamp));
        }
        
        return new ArrayList<>(messages); // Return copy to prevent modification
    }

    // ✅ Fetch messages within time range
    public List<Message> getMessagesInRange(String roomId, LocalDateTime startTime, LocalDateTime endTime) {
        List<Message> allMessages = getMessages(roomId, false); // Get in chronological order
        List<Message> filteredMessages = new ArrayList<>();
        
        for (Message message : allMessages) {
            LocalDateTime messageTime = message.getTimestamp();
            if (!messageTime.isBefore(startTime) && !messageTime.isAfter(endTime)) {
                filteredMessages.add(message);
            }
        }
        
        return filteredMessages;
    }

    // ✅ Enhanced broadcast message with timestamp + sender tagging
    public String broadcastMessage(String roomId, String sender, String content) {
        Message msg = saveMessage(roomId, sender, content);
        
        // In a real application, you would use WebSocket or message broker to push to clients
        // This returns the formatted message that would be broadcasted
        String formattedMessage = msg.toFormattedString();
        
        // Simulate broadcasting to all clients in the room
        System.out.println("Broadcasting to room " + roomId + ": " + formattedMessage);
        
        return formattedMessage;
    }

    // ✅ Broadcast system message
    public String broadcastSystemMessage(String roomId, String content) {
        Message msg = saveSystemMessage(roomId, content);
        String formattedMessage = msg.toFormattedString();
        
        System.out.println("Broadcasting system message to room " + roomId + ": " + formattedMessage);
        
        return formattedMessage;
    }

    // ✅ Get message count for a room
    public int getMessageCount(String roomId) {
        return chatHistory.getOrDefault(roomId, new ArrayList<>()).size();
    }

    // ✅ Check if room exists
    public boolean roomExists(String roomId) {
        return chatHistory.containsKey(roomId);
    }

    // ✅ Get all active rooms
    public List<String> getActiveRooms() {
        return new ArrayList<>(chatHistory.keySet());
    }

    // ✅ Clear chat history for a room
    public void clearChatHistory(String roomId) {
        if (roomId != null) {
            chatHistory.remove(roomId);
        }
    }
}