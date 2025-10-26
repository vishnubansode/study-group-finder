package com.groupgenius.groupgenius_backend.chat;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @MessageMapping("/chat/{groupId}")
    public void sendMessage(@DestinationVariable Long groupId, ChatMessage message) {
        message.setGroupId(groupId);
        chatService.processMessage(message);
    }
}
