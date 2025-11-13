package com.groupgenius.groupgenius_backend.service;

import com.groupgenius.groupgenius_backend.dto.SessionInvitationResponse;
import com.groupgenius.groupgenius_backend.entity.*;
import com.groupgenius.groupgenius_backend.exception.ResourceNotFoundException;
import com.groupgenius.groupgenius_backend.exception.UnauthorizedActionException;
import com.groupgenius.groupgenius_backend.mapper.SessionInvitationMapper;
import com.groupgenius.groupgenius_backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.jdbc.core.JdbcTemplate;

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
        private final JdbcTemplate jdbcTemplate;
        private final EmailService emailService;

        @Value("${app.frontend.url}")
        private String frontendUrl;

        /**
         * Add creator as a participant (no invitation needed)
         */
        public void addCreatorAsParticipant(Session session, User creator) {
                if (!participantRepository.existsBySessionAndUser(session, creator)) {
                        SessionParticipant participant = SessionParticipant.builder()
                                        .session(session)
                                        .user(creator)
                                        .build();
                        participantRepository.save(participant);
                        log.info("✅ Creator {} automatically added as participant to session {}",
                                        creator.getId(), session.getId());
                }
        }

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
                                                .orElseThrow(() -> new ResourceNotFoundException(
                                                                "User not found with ID: " + userId));

                                // Verify user is a member of the group
                                GroupMember membership = groupMemberRepository
                                                .findByUserAndGroup(user, session.getGroup())
                                                .orElseThrow(() -> new UnauthorizedActionException(
                                                                "User " + userId + " is not a member of group "
                                                                                + session.getGroup().getId()));

                                if (membership.getStatus() != GroupMember.Status.APPROVED) {
                                        log.warn("Skipping invitation for user {} - not an approved member", userId);
                                        continue;
                                }

                                // Check if invitation already exists
                                if (invitationRepository.findBySessionAndUser(session, user).isPresent()) {
                                        log.info("Invitation already exists for user {} and session {}", userId,
                                                        session.getId());
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

                                // Send email invitation with Accept/Decline buttons
                                try {
                                        String formattedStartTime = session.getStartTime() != null
                                                        ? session.getStartTime().toString().replace("T", " at ")
                                                        : "TBD";

                                        emailService.sendInvitationEmail(
                                                        user.getEmail(),
                                                        invitation.getId(),
                                                        session.getGroup().getId(),
                                                        message,
                                                        session.getTitle(),
                                                        session.getGroup().getGroupName(),
                                                        formattedStartTime,
                                                        null, // location not available in Session entity
                                                        session.getDescription());
                                        log.info("📧 Invitation email with Accept/Decline buttons sent to {}",
                                                        user.getEmail());
                                } catch (Exception e) {
                                        log.error("Failed to send invitation email to {}: {}", user.getEmail(),
                                                        e.getMessage());
                                }

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
         * Get declined invitations for a user so they can rejoin later
         */
        @Transactional(readOnly = true)
        public List<SessionInvitationResponse> getDeclinedInvitationsForUser(Long userId) {
                com.groupgenius.groupgenius_backend.entity.User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

                return invitationRepository.findByUserAndStatus(user, SessionInvitation.Status.DECLINED).stream()
                                .map(SessionInvitationMapper::toDTO)
                                .collect(Collectors.toList());
        }

        /**
         * Accept an invitation
         */
        public SessionInvitationResponse acceptInvitation(Long invitationId, Long userId) {
                SessionInvitation invitation = invitationRepository.findById(invitationId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Invitation not found with ID: " + invitationId));

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
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Invitation not found with ID: " + invitationId));

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
         * Allow a user who previously declined to rejoin the session.
         */
        public SessionInvitationResponse rejoinDeclinedInvitation(Long invitationId, Long userId) {
                SessionInvitation invitation = invitationRepository.findById(invitationId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Invitation not found with ID: " + invitationId));

                if (!invitation.getUser().getId().equals(userId)) {
                        throw new UnauthorizedActionException("You are not authorized to rejoin this invitation");
                }

                if (invitation.getStatus() != SessionInvitation.Status.DECLINED) {
                        throw new IllegalStateException("Only declined invitations can be rejoined");
                }

                invitation.setStatus(SessionInvitation.Status.ACCEPTED);
                invitation.setRespondedAt(LocalDateTime.now());
                invitationRepository.save(invitation);

                if (!participantRepository.existsBySessionAndUser(invitation.getSession(), invitation.getUser())) {
                        SessionParticipant participant = SessionParticipant.builder()
                                        .session(invitation.getSession())
                                        .user(invitation.getUser())
                                        .build();
                        participantRepository.save(participant);
                }

                String message = String.format("%s %s is joining '%s' after previously declining",
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

                log.info("✅ User {} rejoined session {} via invitation {}", userId,
                                invitation.getSession().getId(), invitationId);

                return SessionInvitationMapper.toDTO(invitation);
        }

        /**
         * Get invitations for a specific session
         */
        @Transactional(readOnly = true)
        public List<SessionInvitationResponse> getInvitationsForSession(Long sessionId) {
                Session session = sessionRepository.findById(sessionId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Session not found with ID: " + sessionId));

                return invitationRepository.findBySession(session).stream()
                                .map(SessionInvitationMapper::toDTO)
                                .collect(Collectors.toList());
        }

        /**
         * Attempt to delete rows from a legacy `invitations` table if it exists.
         * This covers cases where the database has an older table name and a FK
         * pointing to sessions that prevents deletion.
         */
        public void deleteLegacyInvitationsBySessionId(Long sessionId) {
                try {
                        // Check whether a legacy 'invitations' table exists in the current schema
                        Integer tableCount = jdbcTemplate.queryForObject(
                                        "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name = 'invitations'",
                                        Integer.class);

                        if (tableCount == null || tableCount == 0) {
                                log.debug("No legacy `invitations` table present in DB (skipping legacy cleanup)");
                                return;
                        }

                        // Fetch column names for the table so we can find the right session column
                        java.util.List<String> columns = jdbcTemplate.queryForList(
                                        "SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name = 'invitations'",
                                        String.class);

                        // Preferred candidate names (in order)
                        String[] candidates = new String[] { "session_id", "sessionId", "sessionid", "sessions_id",
                                        "sessionsid" };
                        String sessionCol = null;
                        for (String c : candidates) {
                                if (columns.contains(c)) {
                                        sessionCol = c;
                                        break;
                                }
                        }

                        // Fallback: try any column containing 'session'
                        if (sessionCol == null) {
                                for (String c : columns) {
                                        if (c.toLowerCase().contains("session")) {
                                                sessionCol = c;
                                                break;
                                        }
                                }
                        }

                        if (sessionCol == null) {
                                log.debug("Found legacy `invitations` table but could not identify a session column. Columns: {}",
                                                columns);
                                return;
                        }

                        String sql = String.format("DELETE FROM invitations WHERE %s = ?", sessionCol);
                        int deleted = jdbcTemplate.update(sql, sessionId);
                        log.info("🗑️ Deleted {} rows from legacy `invitations` (column {}) for session {}", deleted,
                                        sessionCol, sessionId);

                } catch (Exception ex) {
                        // Table might not exist, permission issues, or other SQL errors; ignore but log
                        // debug
                        log.debug("Error during legacy `invitations` cleanup: {}", ex.getMessage());
                }
        }

        /**
         * Delete all invitations for a session (used when deleting a session)
         */
        public void deleteInvitationsBySession(Session session) {
                List<SessionInvitation> invitations = invitationRepository.findBySession(session);
                if (!invitations.isEmpty()) {
                        invitationRepository.deleteAll(invitations);
                        log.info("🗑️ Deleted {} invitations for session {}", invitations.size(), session.getId());
                }
        }

        /**
         * Delete all participants for a session (used when deleting a session)
         */
        public void deleteParticipantsBySession(Session session) {
                List<SessionParticipant> participants = participantRepository.findBySession(session);
                if (!participants.isEmpty()) {
                        participantRepository.deleteAll(participants);
                        log.info("🗑️ Deleted {} participants for session {}", participants.size(), session.getId());
                }
        }

        /**
         * Delete all notifications for a session (used when deleting a session)
         */
        public void deleteNotificationsBySession(Session session) {
                List<Notification> notifications = notificationRepository.findBySession(session);
                if (!notifications.isEmpty()) {
                        notificationRepository.deleteAll(notifications);
                        log.info("🗑️ Deleted {} notifications for session {}", notifications.size(), session.getId());
                }
        }
}
