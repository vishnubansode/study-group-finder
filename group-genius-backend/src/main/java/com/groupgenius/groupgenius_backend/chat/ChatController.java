package com.groupgenius.groupgenius_backend.chat;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @MessageMapping("/chat/{groupId}")
    public void sendMessage(@DestinationVariable Long groupId, ChatMessage message) {
        message.setGroupId(groupId);
        chatService.processMessage(message);
    }

    @MessageMapping("/chat/{groupId}/edit")
    public void editMessage(@DestinationVariable Long groupId, @Payload Map<String, Object> payload) {
        Long messageId = ((Number) payload.get("messageId")).longValue();
        String content = (String) payload.get("content");
        chatService.editMessage(messageId, content, groupId);
    }

    @MessageMapping("/chat/{groupId}/delete")
    public void deleteMessage(@DestinationVariable Long groupId, @Payload Map<String, Object> payload) {
        Long messageId = ((Number) payload.get("messageId")).longValue();
        chatService.deleteMessage(messageId, groupId);
    }

    @MessageMapping("/chat/{groupId}/typing")
    public void userTyping(@DestinationVariable Long groupId, @Payload Map<String, Object> payload) {
        chatService.broadcastTypingIndicator(groupId, payload);
    }
}
