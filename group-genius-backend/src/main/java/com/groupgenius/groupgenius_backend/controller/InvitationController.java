package com.groupgenius.groupgenius_backend.controller;

import com.groupgenius.groupgenius_backend.entity.Invitation;
import com.groupgenius.groupgenius_backend.service.InvitationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class InvitationController {

    private final InvitationService invitationService;

    public InvitationController(InvitationService invitationService) {
        this.invitationService = invitationService;
    }

    // Create invitations for a session. Sender ID is provided in path (matches
    // SessionController pattern)
    @PostMapping("/sessions/{sessionId}/invitations/sender/{senderId}")
    public ResponseEntity<List<Invitation>> createInvitations(@PathVariable Long sessionId,
            @PathVariable Long senderId,
            @RequestBody Map<String, Object> body) {
        // Expecting { "recipientIds": [1,2,3], "message": "optional" }
        Object recipientsObj = body.get("recipientIds");
        List<Long> recipientIds = List.of();
        if (recipientsObj instanceof List<?> rawList) {
            recipientIds = rawList.stream()
                    .filter(x -> x != null)
                    .map(x -> {
                        if (x instanceof Number n)
                            return n.longValue();
                        try {
                            return Long.parseLong(x.toString());
                        } catch (Exception e) {
                            return null;
                        }
                    })
                    .filter(x -> x != null)
                    .toList();
        }
        String message = body.containsKey("message") ? String.valueOf(body.get("message")) : null;

        List<Invitation> created = invitationService.createInvitationsForSession(sessionId, senderId, recipientIds,
                message);
        return ResponseEntity.ok(created);
    }

    // Respond to invitation (accept/decline)
    @PostMapping("/invitations/{invitationId}/respond/user/{userId}")
    public ResponseEntity<Invitation> respond(@PathVariable Long invitationId,
            @PathVariable Long userId,
            @RequestBody Map<String, String> body) {
        String action = body.getOrDefault("action", "");
        Invitation updated = invitationService.respondToInvitation(invitationId, userId, action);
        return ResponseEntity.ok(updated);
    }
}
