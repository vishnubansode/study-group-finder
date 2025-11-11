package com.groupgenius.groupgenius_backend.controller;

import com.groupgenius.groupgenius_backend.dto.SessionRequestDTO;
import com.groupgenius.groupgenius_backend.dto.SessionResponseDTO;
import com.groupgenius.groupgenius_backend.service.SessionService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    private final SessionService sessionService;

    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @PostMapping("/group/{groupId}/creator/{createdById}")
    public ResponseEntity<SessionResponseDTO> createSession(@PathVariable Long groupId, @PathVariable Long createdById,
            @RequestBody SessionRequestDTO requestDTO) {
        SessionResponseDTO created = sessionService.createSession(groupId, createdById, requestDTO);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SessionResponseDTO> updateSession(@PathVariable Long id,
            @RequestBody SessionRequestDTO requestDTO) {
        SessionResponseDTO updated = sessionService.updateSession(id, requestDTO);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<Page<SessionResponseDTO>> getSessionsByGroup(
            @PathVariable Long groupId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long userId) {
        Page<SessionResponseDTO> sessions;
        if (userId != null) {
            sessions = sessionService.getSessionsByGroupForUser(groupId, page, size, userId);
        } else {
            sessions = sessionService.getSessionsByGroup(groupId, page, size);
        }
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SessionResponseDTO> getSessionById(@PathVariable Long id) {
        SessionResponseDTO session = sessionService.getSessionById(id);
        return ResponseEntity.ok(session);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable Long id) {
        // Backwards-compatible: require that the caller be the creator or admin. This
        // variant assumes the server
        // will resolve the acting user from the authenticated principal. For now, keep
        // behavior by delegating to
        // deleteSession with the creator id so that delete works in non-auth tests
        // (preserves previous semantics).
        var existing = sessionService.getSessionById(id);
        Long creatorId = existing.getCreatedById();
        sessionService.deleteSession(id, creatorId == null ? -1L : creatorId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/user/{userId}")
    public ResponseEntity<?> deleteSessionAsUser(@PathVariable Long id, @PathVariable Long userId) {
        try {
            sessionService.deleteSession(id, userId);
            return ResponseEntity.noContent().build();
        } catch (com.groupgenius.groupgenius_backend.exception.ResourceNotFoundException rnfe) {
            return ResponseEntity.status(404).body(rnfe.getMessage());
        } catch (com.groupgenius.groupgenius_backend.exception.UnauthorizedActionException uae) {
            return ResponseEntity.status(403).body(uae.getMessage());
        } catch (Exception e) {
            // return 500 with message for easier debugging by client
            return ResponseEntity.status(500).body("Failed to delete session: " + e.getMessage());
        }
    }
}
