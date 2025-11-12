package com.groupgenius.groupgenius_backend.controller;

import com.groupgenius.groupgenius_backend.dto.SessionRequestDTO;
import com.groupgenius.groupgenius_backend.dto.SessionResponseDTO;
import com.groupgenius.groupgenius_backend.service.SessionService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
            @RequestParam(defaultValue = "10") int size) {
        Page<SessionResponseDTO> sessions = sessionService.getSessionsByGroup(groupId, page, size);
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SessionResponseDTO> getSessionById(@PathVariable Long id) {
        SessionResponseDTO session = sessionService.getSessionById(id);
        return ResponseEntity.ok(session);
    }

    @GetMapping("/creator/{creatorId}")
    public ResponseEntity<List<SessionResponseDTO>> getSessionsByCreator(@PathVariable Long creatorId) {
        List<SessionResponseDTO> sessions = sessionService.getSessionsByCreator(creatorId);
        return ResponseEntity.ok(sessions);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable Long id) {
        sessionService.deleteSession(id);
        return ResponseEntity.noContent().build();
    }
}
