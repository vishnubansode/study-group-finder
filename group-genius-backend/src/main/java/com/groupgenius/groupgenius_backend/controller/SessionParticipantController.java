package com.groupgenius.groupgenius_backend.controller;

import com.groupgenius.groupgenius_backend.dto.SessionParticipantResponse;
import com.groupgenius.groupgenius_backend.service.SessionParticipantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sessions/participants")
@RequiredArgsConstructor
public class SessionParticipantController {

    private final SessionParticipantService participantService;

    /**
     * Get all participants for a session
     * GET /api/sessions/participants/{sessionId}
     */
    @GetMapping("/{sessionId}")
    public ResponseEntity<List<SessionParticipantResponse>> getParticipants(@PathVariable Long sessionId) {
        List<SessionParticipantResponse> participants = participantService.getParticipantsForSession(sessionId);
        return ResponseEntity.ok(participants);
    }

    /**
     * Get participant count for a session
     * GET /api/sessions/participants/{sessionId}/count
     */
    @GetMapping("/{sessionId}/count")
    public ResponseEntity<Map<String, Long>> getParticipantCount(@PathVariable Long sessionId) {
        long count = participantService.getParticipantCount(sessionId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * Check if user is a participant
     * GET /api/sessions/participants/{sessionId}/user/{userId}/is-participant
     */
    @GetMapping("/{sessionId}/user/{userId}/is-participant")
    public ResponseEntity<Map<String, Boolean>> isParticipant(
            @PathVariable Long sessionId,
            @PathVariable Long userId) {

        boolean isParticipant = participantService.isParticipant(sessionId, userId);
        return ResponseEntity.ok(Map.of("isParticipant", isParticipant));
    }
}
