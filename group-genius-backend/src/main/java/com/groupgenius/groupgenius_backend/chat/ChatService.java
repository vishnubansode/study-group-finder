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
        
        // Persist server-side
        ChatMessage saved = chatMessageRepository.save(message);
        
        // Echo to subscribers with enriched metadata
        messagingTemplate.convertAndSend("/ws/group/" + saved.getGroupId(), message);
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
}
