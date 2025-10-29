package com.groupgenius.groupgenius_backend.chat;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Slf4j
public class ChatRestController {

    private final ChatService chatService;

    @GetMapping("/history/{groupId}")
    public List<ChatMessage> getChatHistory(@PathVariable Long groupId) {
        return chatService.getHistory(groupId);
    }

    @PostMapping(value = "/{groupId}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadAttachment(@PathVariable Long groupId,
                                              @RequestParam("file") MultipartFile file,
                                              @RequestParam("senderId") Long senderId,
                                              @RequestParam(value = "caption", required = false) String caption,
                                              @RequestParam(value = "clientMessageId", required = false) String clientMessageId) {
        try {
            ChatMessage saved = chatService.createAttachmentMessage(groupId, senderId, caption, file, clientMessageId);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (IOException ex) {
            log.error("Failed to store attachment for group {}", groupId, ex);
            return ResponseEntity.internalServerError().body("Unable to store attachment: " + ex.getMessage());
        } catch (Exception ex) {
            log.error("Unexpected error while uploading attachment for group {}", groupId, ex);
            return ResponseEntity.internalServerError().body("Attachment upload failed: " + ex.getMessage());
        }
    }
}
