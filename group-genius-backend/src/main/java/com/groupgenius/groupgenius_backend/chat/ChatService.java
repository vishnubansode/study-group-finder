package com.groupgenius.groupgenius_backend.chat;

import com.groupgenius.groupgenius_backend.repository.UserRepository;
import com.groupgenius.groupgenius_backend.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final ChatMessageRepository chatMessageRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public void processMessage(ChatMessage message) {
        if (message.getTimestamp() == null) {
            // Store timestamp in UTC
            message.setTimestamp(Instant.now());
        }

        if (message.getMessageType() == null || message.getMessageType().isBlank()) {
            message.setMessageType("TEXT");
        }

        // Enrich message with sender metadata from User entity
        if (message.getSenderId() != null) {
            userRepository.findById(message.getSenderId()).ifPresent(user -> {
                message.setSender(user.getFirstName() + " " + user.getLastName());
                message.setSenderPhone(user.getEmail()); // Using email as phone placeholder
                message.setSenderProfileImageUrl(user.getProfileImageUrl());
            });
        }

        // Persist server-side and obtain entity with generated identifier
        ChatMessage saved = chatMessageRepository.save(message);

        // Preserve client reference id for optimistic UI reconciliation
        saved.setClientMessageId(message.getClientMessageId());

        // Echo to subscribers with enriched metadata (including generated id)
        messagingTemplate.convertAndSend("/ws/group/" + saved.getGroupId(), saved);
    }

    public List<ChatMessage> getHistory(Long groupId) {
        List<ChatMessage> history = chatMessageRepository.findByGroupIdOrderByTimestampAsc(groupId);

        // Enrich each historical message with sender metadata
        history.forEach(msg -> {
            if (msg.getSenderId() != null) {
                userRepository.findById(msg.getSenderId()).ifPresent(user -> {
                    msg.setSender(user.getFirstName() + " " + user.getLastName());
                    msg.setSenderPhone(user.getEmail()); // Using email as phone placeholder
                    msg.setSenderProfileImageUrl(user.getProfileImageUrl());
                });
            }
        });

        return history;
    }

    public ChatMessage createAttachmentMessage(Long groupId,
            Long senderId,
            String caption,
            MultipartFile file,
            String clientMessageId) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File must not be empty");
        }

        if (senderId == null) {
            throw new IllegalArgumentException("Sender is required");
        }

        ChatMessage message = new ChatMessage();
        message.setGroupId(groupId);
        message.setSenderId(senderId);
        // Store timestamp in UTC
        message.setTimestamp(Instant.now());
        message.setEdited(false);
        message.setClientMessageId(clientMessageId);

        String storedPath = fileStorageService.storeFile(file);
        message.setAttachmentUrl(storedPath);
        message.setAttachmentName(file.getOriginalFilename());
        message.setAttachmentSize(file.getSize());

        String attachmentType = determineAttachmentType(file);
        message.setAttachmentType(attachmentType);
        message.setMessageType(attachmentType);

        if (caption != null && !caption.isBlank()) {
            message.setContent(caption);
        } else {
            message.setContent(file.getOriginalFilename());
        }

        if (message.getSenderId() != null) {
            userRepository.findById(message.getSenderId()).ifPresent(user -> {
                message.setSender(user.getFirstName() + " " + user.getLastName());
                message.setSenderPhone(user.getEmail());
                message.setSenderProfileImageUrl(user.getProfileImageUrl());
            });
        }

        ChatMessage saved = chatMessageRepository.save(message);
        saved.setSender(message.getSender());
        saved.setSenderPhone(message.getSenderPhone());
        saved.setSenderProfileImageUrl(message.getSenderProfileImageUrl());
        saved.setAttachmentUrl(message.getAttachmentUrl());
        saved.setAttachmentName(message.getAttachmentName());
        saved.setAttachmentType(message.getAttachmentType());
        saved.setAttachmentSize(message.getAttachmentSize());
        saved.setClientMessageId(clientMessageId);

        // Broadcast attachment message to subscribers
        messagingTemplate.convertAndSend("/ws/group/" + groupId, saved);

        return saved;
    }

    private String determineAttachmentType(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType != null) {
            if (contentType.startsWith("image/")) {
                return "IMAGE";
            }
            if (contentType.startsWith("video/")) {
                return "VIDEO";
            }
            if (contentType.startsWith("audio/")) {
                return "AUDIO";
            }
        }

        String filename = file.getOriginalFilename();
        if (filename != null) {
            String lower = filename.toLowerCase();
            if (lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png") || lower.endsWith(".gif")
                    || lower.endsWith(".webp")) {
                return "IMAGE";
            }
            if (lower.endsWith(".mp4") || lower.endsWith(".mov") || lower.endsWith(".avi") || lower.endsWith(".mkv")
                    || lower.endsWith(".webm")) {
                return "VIDEO";
            }
            if (lower.endsWith(".mp3") || lower.endsWith(".wav") || lower.endsWith(".aac")) {
                return "AUDIO";
            }
        }

        return "DOCUMENT";
    }

    public void editMessage(Long messageId, String newContent, Long groupId) {
        chatMessageRepository.findById(messageId).ifPresent(message -> {
            message.setContent(newContent);
            message.setEdited(true);

            // Enrich with sender metadata and persist changes
            if (message.getSenderId() != null) {
                userRepository.findById(message.getSenderId()).ifPresent(user -> {
                    message.setSender(user.getFirstName() + " " + user.getLastName());
                    message.setSenderPhone(user.getEmail());
                    message.setSenderProfileImageUrl(user.getProfileImageUrl());
                });
            }

            ChatMessage updated = chatMessageRepository.save(message);

            // Broadcast updated message
            messagingTemplate.convertAndSend("/ws/group/" + groupId, updated);
        });
    }

    public void deleteMessage(Long messageId, Long groupId) {
        chatMessageRepository.findById(messageId).ifPresent(message -> {
            chatMessageRepository.deleteById(messageId);

            // Broadcast delete event
            ChatMessage deleteEvent = new ChatMessage();
            deleteEvent.setId(messageId);
            deleteEvent.setGroupId(groupId);
            deleteEvent.setContent("[DELETED]");
            messagingTemplate.convertAndSend("/ws/group/" + groupId + "/delete", deleteEvent);
        });
    }

    public void broadcastTypingIndicator(Long groupId, java.util.Map<String, Object> payload) {
        // Broadcast typing indicator to all subscribers of the group
        // Payload should contain: { userId, username, isTyping }
        messagingTemplate.convertAndSend("/ws/group/" + groupId + "/typing", payload);
    }
}
