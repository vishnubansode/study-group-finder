package com.groupgenius.groupgenius_backend.controller;

import com.groupgenius.groupgenius_backend.dto.HelpChatInteractionRequest;
import com.groupgenius.groupgenius_backend.entity.HelpChatInteraction;
import com.groupgenius.groupgenius_backend.service.HelpChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/help-chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class HelpChatController {

    private final HelpChatService helpChatService;

    @PostMapping("/interactions")
    public ResponseEntity<?> saveInteraction(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.User principal,
            @RequestBody HelpChatInteractionRequest request) {

        HelpChatInteraction interaction = request.toEntity();
        HelpChatInteraction saved = helpChatService.saveInteraction(interaction, principal.getUsername());

        Map<String, Object> response = Map.of(
                "message", "Interaction saved successfully",
                "id", saved.getId(),
                "response", saved.getResponse(),
                "timestamp", saved.getTimestamp()
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/interactions/analytics")
    public ResponseEntity<?> getAnalytics(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.User principal) {

        Map<String, Object> analytics = helpChatService.getChatAnalytics();
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/common-questions")
    public ResponseEntity<?> getCommonQuestions() {
        List<Map<String, Object>> commonQuestions = helpChatService.getCommonQuestions();
        return ResponseEntity.ok(commonQuestions);
    }

    @GetMapping("/quick-responses")
    public ResponseEntity<?> getQuickResponses() {
        return ResponseEntity.ok(Map.of(
                "message", "Quick responses available",
                "count", helpChatService.getCommonQuestions().size()
        ));
    }
}