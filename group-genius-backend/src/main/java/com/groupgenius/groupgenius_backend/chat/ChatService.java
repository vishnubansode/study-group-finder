package com.groupgenius.groupgenius_backend.chat;

import com.groupgenius.groupgenius_backend.entity.User;
import com.groupgenius.groupgenius_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final ChatMessageRepository chatMessageRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;

    public void processMessage(ChatMessage message) {
        if (message.getTimestamp() == null) {
            message.setTimestamp(LocalDateTime.now());
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
}
