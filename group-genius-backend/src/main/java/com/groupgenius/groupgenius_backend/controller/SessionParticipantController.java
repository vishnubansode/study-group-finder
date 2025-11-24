package com.groupgenius.groupgenius_backend.controller;

import com.groupgenius.groupgenius_backend.dto.SessionParticipantResponse;
import com.groupgenius.groupgenius_backend.dto.SessionParticipationStatusRequest;
import com.groupgenius.groupgenius_backend.service.SessionParticipantService;
import com.groupgenius.groupgenius_backend.mapper.SessionParticipantMapper;
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

    /**
     * Add (or join) a participant to a session
     * POST /api/sessions/participants/{sessionId}/user/{userId}
     */
    @PostMapping("/{sessionId}/user/{userId}")
    public ResponseEntity<?> addParticipant(@PathVariable Long sessionId, @PathVariable Long userId) {
        SessionParticipantResponse dto = null;
        try {
            var p = participantService.addParticipant(sessionId, userId);
            dto = SessionParticipantMapper.toDTO(p);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
        return ResponseEntity.ok(dto);
    }

    /**
     * Bulk participation status for user across provided sessions
     */
    @PostMapping("/user/{userId}/status")
    public ResponseEntity<Map<Long, Boolean>> getParticipationStatus(
            @PathVariable Long userId,
            @RequestBody SessionParticipationStatusRequest request) {
        Map<Long, Boolean> statusMap = participantService.getParticipationStatusForSessions(userId,
                request.getSessionIds());
        return ResponseEntity.ok(statusMap);
    }

    /**
     * Remove (leave) a participant from a session
     * DELETE /api/sessions/participants/{sessionId}/user/{userId}
     */
    @DeleteMapping("/{sessionId}/user/{userId}")
    public ResponseEntity<?> removeParticipant(@PathVariable Long sessionId, @PathVariable Long userId) {
        try {
            participantService.removeParticipant(sessionId, userId);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
        return ResponseEntity.noContent().build();
    }
}
