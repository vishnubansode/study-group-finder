package com.groupgenius.groupgenius_backend.controller;

import com.groupgenius.groupgenius_backend.dto.SessionCreateWithInvitationsRequest;
import com.groupgenius.groupgenius_backend.dto.SessionInvitationResponse;
import com.groupgenius.groupgenius_backend.dto.SessionResponseDTO;
import com.groupgenius.groupgenius_backend.service.SessionInvitationService;
import com.groupgenius.groupgenius_backend.service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions/invitations")
@RequiredArgsConstructor
public class SessionInvitationController {

    private final SessionInvitationService invitationService;
    private final SessionService sessionService;

    /**
     * Create a session with invitations
     * POST /api/sessions/invitations/create
     */
    @PostMapping("/create")
    public ResponseEntity<SessionResponseDTO> createSessionWithInvitations(
            @RequestParam Long createdById,
            @RequestBody SessionCreateWithInvitationsRequest request) {

        SessionResponseDTO response = sessionService.createSessionWithInvitations(createdById, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get pending invitations for a user
     * GET /api/sessions/invitations/user/{userId}/pending
     */
    @GetMapping("/user/{userId}/pending")
    public ResponseEntity<List<SessionInvitationResponse>> getPendingInvitations(@PathVariable Long userId) {
        List<SessionInvitationResponse> invitations = invitationService.getPendingInvitationsForUser(userId);
        return ResponseEntity.ok(invitations);
    }

    /**
     * Get declined invitations for a user
     * GET /api/sessions/invitations/user/{userId}/declined
     */
    @GetMapping("/user/{userId}/declined")
    public ResponseEntity<List<SessionInvitationResponse>> getDeclinedInvitations(@PathVariable Long userId) {
        List<SessionInvitationResponse> invitations = invitationService.getDeclinedInvitationsForUser(userId);
        return ResponseEntity.ok(invitations);
    }

    /**
     * Get pending invitations for a user in a specific group
     * GET /api/sessions/invitations/groups/{groupId}/user/{userId}/pending
     */
    @GetMapping("/groups/{groupId}/user/{userId}/pending")
    public ResponseEntity<List<SessionInvitationResponse>> getPendingInvitationsInGroup(
            @PathVariable Long groupId,
            @PathVariable Long userId) {

        List<SessionInvitationResponse> invitations = invitationService.getPendingInvitationsForUserInGroup(userId,
                groupId);
        return ResponseEntity.ok(invitations);
    }

    /**
     * Accept an invitation
     * POST /api/sessions/invitations/{invitationId}/accept
     */
    @PostMapping("/{invitationId}/accept")
    public ResponseEntity<SessionInvitationResponse> acceptInvitation(
            @PathVariable Long invitationId,
            @RequestParam Long userId) {

        SessionInvitationResponse response = invitationService.acceptInvitation(invitationId, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Decline an invitation
     * POST /api/sessions/invitations/{invitationId}/decline
     */
    @PostMapping("/{invitationId}/decline")
    public ResponseEntity<SessionInvitationResponse> declineInvitation(
            @PathVariable Long invitationId,
            @RequestParam Long userId) {

        SessionInvitationResponse response = invitationService.declineInvitation(invitationId, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Rejoin a previously-declined invitation
     * POST /api/sessions/invitations/{invitationId}/rejoin
     */
    @PostMapping("/{invitationId}/rejoin")
    public ResponseEntity<SessionInvitationResponse> rejoinDeclinedInvitation(
            @PathVariable Long invitationId,
            @RequestParam Long userId) {

        SessionInvitationResponse response = invitationService.rejoinDeclinedInvitation(invitationId, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all invitations for a session
     * GET /api/sessions/invitations/session/{sessionId}
     */
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<SessionInvitationResponse>> getInvitationsForSession(@PathVariable Long sessionId) {
        List<SessionInvitationResponse> invitations = invitationService.getInvitationsForSession(sessionId);
        return ResponseEntity.ok(invitations);
    }
}
