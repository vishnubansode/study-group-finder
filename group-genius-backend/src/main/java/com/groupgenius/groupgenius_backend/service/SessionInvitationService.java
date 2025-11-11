package com.groupgenius.groupgenius_backend.service;

import com.groupgenius.groupgenius_backend.dto.SessionInvitationResponse;
import com.groupgenius.groupgenius_backend.entity.*;
import com.groupgenius.groupgenius_backend.exception.ResourceNotFoundException;
import com.groupgenius.groupgenius_backend.exception.UnauthorizedActionException;
import com.groupgenius.groupgenius_backend.mapper.SessionInvitationMapper;
import com.groupgenius.groupgenius_backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class SessionInvitationService {

    private final SessionInvitationRepository invitationRepository;
    private final SessionParticipantRepository participantRepository;
    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final NotificationRepository notificationRepository;

    /**
     * Create invitations for a session
     */
    public void createInvitations(Session session, List<Long> invitedUserIds) {
        if (invitedUserIds == null || invitedUserIds.isEmpty()) {
            log.info("No users to invite for session {}", session.getId());
            return;
        }

        for (Long userId : invitedUserIds) {
            try {
                User user = userRepository.findById(userId)
                        .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

                // Verify user is a member of the group
                GroupMember membership = groupMemberRepository.findByUserAndGroup(user, session.getGroup())
                        .orElseThrow(() -> new UnauthorizedActionException(
                                "User " + userId + " is not a member of group " + session.getGroup().getId()));

                if (membership.getStatus() != GroupMember.Status.APPROVED) {
                    log.warn("Skipping invitation for user {} - not an approved member", userId);
                    continue;
                }

                // Check if invitation already exists
                if (invitationRepository.findBySessionAndUser(session, user).isPresent()) {
                    log.info("Invitation already exists for user {} and session {}", userId, session.getId());
                    continue;
                }

                // Create invitation
                SessionInvitation invitation = SessionInvitation.builder()
                        .session(session)
                        .user(user)
                        .status(SessionInvitation.Status.PENDING)
                        .build();

                invitationRepository.save(invitation);

                // Create notification
                String message = String.format("You've been invited to join '%s' in '%s' by %s %s",
                        session.getTitle(),
                        session.getGroup().getGroupName(),
                        session.getCreatedBy().getFirstName(),
                        session.getCreatedBy().getLastName());

                Notification notification = Notification.builder()
                        .recipient(user)
                        .session(session)
                        .type(Notification.NotificationType.INVITATION)
                        .message(message)
                        .read(false)
                        .build();

                notificationRepository.save(notification);

                log.info("✉️ Invitation sent to user {} for session {}", userId, session.getId());

            } catch (ResourceNotFoundException e) {
                log.error("Failed to create invitation for user {}: {}", userId, e.getMessage());
            } catch (UnauthorizedActionException e) {
                log.warn("User {} cannot be invited: {}", userId, e.getMessage());
            }
        }
    }

    /**
     * Get pending invitations for a user in a specific group
     */
    @Transactional(readOnly = true)
    public List<SessionInvitationResponse> getPendingInvitationsForUserInGroup(Long userId, Long groupId) {
        // Verify user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        return invitationRepository.findByGroupIdAndUserId(groupId, userId).stream()
                .filter(inv -> inv.getStatus() == SessionInvitation.Status.PENDING)
                .map(SessionInvitationMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all pending invitations for a user
     */
    @Transactional(readOnly = true)
    public List<SessionInvitationResponse> getPendingInvitationsForUser(Long userId) {
        // Verify user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        return invitationRepository.findPendingInvitationsByUserId(userId).stream()
                .map(SessionInvitationMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Accept an invitation
     */
    public SessionInvitationResponse acceptInvitation(Long invitationId, Long userId) {
        SessionInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found with ID: " + invitationId));

        // Verify the invitation belongs to the user
        if (!invitation.getUser().getId().equals(userId)) {
            throw new UnauthorizedActionException("You are not authorized to accept this invitation");
        }

        if (invitation.getStatus() != SessionInvitation.Status.PENDING) {
            throw new IllegalStateException("Invitation has already been responded to");
        }

        // Update invitation status
        invitation.setStatus(SessionInvitation.Status.ACCEPTED);
        invitation.setRespondedAt(LocalDateTime.now());
        invitationRepository.save(invitation);

        // Add user as participant
        if (!participantRepository.existsBySessionAndUser(invitation.getSession(), invitation.getUser())) {
            SessionParticipant participant = SessionParticipant.builder()
                    .session(invitation.getSession())
                    .user(invitation.getUser())
                    .build();
            participantRepository.save(participant);
        }

        // Notify session creator
        String message = String.format("%s %s has accepted your invitation to '%s'",
                invitation.getUser().getFirstName(),
                invitation.getUser().getLastName(),
                invitation.getSession().getTitle());

        Notification notification = Notification.builder()
                .recipient(invitation.getSession().getCreatedBy())
                .session(invitation.getSession())
                .type(Notification.NotificationType.ACCEPTED)
                .message(message)
                .read(false)
                .build();

        notificationRepository.save(notification);

        log.info("✅ User {} accepted invitation {} for session {}", userId, invitationId,
                invitation.getSession().getId());

        return SessionInvitationMapper.toDTO(invitation);
    }

    /**
     * Decline an invitation
     */
    public SessionInvitationResponse declineInvitation(Long invitationId, Long userId) {
        SessionInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found with ID: " + invitationId));

        // Verify the invitation belongs to the user
        if (!invitation.getUser().getId().equals(userId)) {
            throw new UnauthorizedActionException("You are not authorized to decline this invitation");
        }

        if (invitation.getStatus() != SessionInvitation.Status.PENDING) {
            throw new IllegalStateException("Invitation has already been responded to");
        }

        // Update invitation status
        invitation.setStatus(SessionInvitation.Status.DECLINED);
        invitation.setRespondedAt(LocalDateTime.now());
        invitationRepository.save(invitation);

        // Notify session creator
        String message = String.format("%s %s has declined your invitation to '%s'",
                invitation.getUser().getFirstName(),
                invitation.getUser().getLastName(),
                invitation.getSession().getTitle());

        Notification notification = Notification.builder()
                .recipient(invitation.getSession().getCreatedBy())
                .session(invitation.getSession())
                .type(Notification.NotificationType.DECLINED)
                .message(message)
                .read(false)
                .build();

        notificationRepository.save(notification);

        log.info("❌ User {} declined invitation {} for session {}", userId, invitationId,
                invitation.getSession().getId());

        return SessionInvitationMapper.toDTO(invitation);
    }

    /**
     * Get invitations for a specific session
     */
    @Transactional(readOnly = true)
    public List<SessionInvitationResponse> getInvitationsForSession(Long sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with ID: " + sessionId));

        return invitationRepository.findBySession(session).stream()
                .map(SessionInvitationMapper::toDTO)
                .collect(Collectors.toList());
    }
}
