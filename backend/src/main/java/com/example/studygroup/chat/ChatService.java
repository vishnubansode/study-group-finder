package com.example.studygroup.chat;

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

    public void processMessage(ChatMessage message) {
        message.setTimestamp(LocalDateTime.now());
        chatMessageRepository.save(message);
        messagingTemplate.convertAndSend("/ws/group/" + message.getGroupId(), message);
    }

    public List<ChatMessage> getHistory(Long groupId) {
        return chatMessageRepository.findByGroupIdOrderByTimestampAsc(groupId);
    }
}
