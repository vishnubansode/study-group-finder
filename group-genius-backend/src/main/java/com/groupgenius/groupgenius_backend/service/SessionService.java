package com.groupgenius.groupgenius_backend.service;

import com.groupgenius.groupgenius_backend.dto.SessionRequestDTO;
import com.groupgenius.groupgenius_backend.dto.SessionResponseDTO;
import com.groupgenius.groupgenius_backend.entity.Group;
import com.groupgenius.groupgenius_backend.entity.Session;
import com.groupgenius.groupgenius_backend.entity.User;
import com.groupgenius.groupgenius_backend.exception.ResourceNotFoundException;
import com.groupgenius.groupgenius_backend.exception.TimeSlotConflictException;
import com.groupgenius.groupgenius_backend.mapper.SessionMapper;
import com.groupgenius.groupgenius_backend.repository.GroupRepository;
import com.groupgenius.groupgenius_backend.repository.SessionRepository;
import com.groupgenius.groupgenius_backend.repository.InvitationRepository;
import com.groupgenius.groupgenius_backend.repository.SessionParticipantRepository;
import com.groupgenius.groupgenius_backend.repository.GroupMemberRepository;
import com.groupgenius.groupgenius_backend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import java.time.LocalDateTime;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Service
@Transactional
@Slf4j
public class SessionService {

        private final SessionRepository sessionRepository;
        private final GroupRepository groupRepository;
        private final UserRepository userRepository;
        private final NotificationService notificationService;
        private final InvitationRepository invitationRepository;
        private final SessionParticipantRepository sessionParticipantRepository;
        private final GroupMemberRepository groupMemberRepository;
        private final InvitationService invitationService;
        private final com.groupgenius.groupgenius_backend.repository.NotificationRepository notificationRepository;

        public SessionService(SessionRepository sessionRepository,
                        GroupRepository groupRepository,
                        UserRepository userRepository,
                        NotificationService notificationService,
                        InvitationRepository invitationRepository,
                        SessionParticipantRepository sessionParticipantRepository,
                        GroupMemberRepository groupMemberRepository,
                        InvitationService invitationService,
                        com.groupgenius.groupgenius_backend.repository.NotificationRepository notificationRepository) {
                this.sessionRepository = sessionRepository;
                this.groupRepository = groupRepository;
                this.userRepository = userRepository;
                this.notificationService = notificationService;
                this.invitationRepository = invitationRepository;
                this.sessionParticipantRepository = sessionParticipantRepository;
                this.groupMemberRepository = groupMemberRepository;
                this.invitationService = invitationService;
                this.notificationRepository = notificationRepository;
        }

        public SessionResponseDTO createSession(Long groupId, Long createdById, SessionRequestDTO requestDTO) {
                Group group = groupRepository.findById(groupId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Group not found with ID: " + groupId));

                User creator = userRepository.findById(createdById)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "User not found with ID: " + createdById));

                // Validate overlap
                List<Session> conflicts = sessionRepository.findOverlappingSessions(
                                group, requestDTO.getStartTime(), requestDTO.getEndTime());
                if (!conflicts.isEmpty()) {
                        throw new TimeSlotConflictException("Session time overlaps with another existing session");
                }

                Session session = Session.builder()
                                .group(group)
                                .title(requestDTO.getTitle())
                                .description(requestDTO.getDescription())
                                .startTime(requestDTO.getStartTime())
                                .endTime(requestDTO.getEndTime())
                                .meetingLink(requestDTO.getMeetingLink())
                                .createdBy(creator)
                                .build();

                Session saved = sessionRepository.save(session);

                // After creating the session, create invitations for approved group members
                // (excluding creator).
                try {
                        var members = groupMemberRepository.findByGroup(group);
                        java.util.List<Long> recipientIds = members.stream()
                                        .filter(m -> m.getStatus() == com.groupgenius.groupgenius_backend.entity.GroupMember.Status.APPROVED)
                                        .map(m -> m.getUser().getId())
                                        .filter(id -> !id.equals(createdById))
                                        .toList();

                        log.debug("Found {} approved group members for session invite: {}", recipientIds.size(),
                                        recipientIds);

                        if (!recipientIds.isEmpty()) {
                                String message = "You are invited to join session: " + saved.getTitle();
                                invitationService.createInvitationsForSession(saved.getId(), createdById, recipientIds,
                                                message);
                        } else {
                                log.debug("No recipient ids to invite for session {}", saved.getId());
                        }
                } catch (Exception ex) {
                        // Log and continue; invitations are best-effort
                        log.warn("Failed to create invitations for session {}: {}", saved.getId(), ex.getMessage());
                }

                return SessionMapper.toDTO(saved);
        }

        public SessionResponseDTO updateSession(Long id, SessionRequestDTO requestDTO) {
                Session existing = sessionRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Session not found with ID: " + id));

                List<Session> conflicts = sessionRepository.findOverlappingSessions(
                                existing.getGroup(),
                                requestDTO.getStartTime(),
                                requestDTO.getEndTime());

                if (!conflicts.isEmpty() && conflicts.stream().anyMatch(s -> !s.getId().equals(id))) {
                        throw new TimeSlotConflictException("Session time overlaps with another session");
                }

                existing.setTitle(requestDTO.getTitle());
                existing.setDescription(requestDTO.getDescription());
                existing.setStartTime(requestDTO.getStartTime());
                existing.setEndTime(requestDTO.getEndTime());
                existing.setMeetingLink(requestDTO.getMeetingLink());

                Session updated = sessionRepository.save(existing);

                // Notify all group members (except creator)
                notificationService.notifyGroupMembersOnSessionEvent(updated,
                                "Session \"" + updated.getTitle() + "\" has been updated in group \""
                                                + updated.getGroup().getGroupName() + "\".");
                return SessionMapper.toDTO(updated);
        }

        public Page<SessionResponseDTO> getSessionsByGroup(Long groupId, int page, int size) {
                Group group = groupRepository.findById(groupId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Group not found with ID: " + groupId));

                // Exclude sessions that have already ended: return sessions where endTime >=
                // now
                LocalDateTime now = LocalDateTime.now();

                return sessionRepository
                                .findAll((root, query, cb) -> cb.and(
                                                cb.equal(root.get("group"), group),
                                                cb.greaterThanOrEqualTo(root.get("endTime"), now)),
                                                PageRequest.of(page, size))
                                .map(SessionMapper::toDTO);
        }

        /**
         * Return sessions for a group filtered to those visible to a specific user.
         * Visible = session endTime >= now AND (createdBy == user OR user is a
         * participant)
         * This implementation fetches the candidate sessions and post-filters them.
         */
        public Page<SessionResponseDTO> getSessionsByGroupForUser(Long groupId, int page, int size, Long userId) {
                Group group = groupRepository.findById(groupId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Group not found with ID: " + groupId));

                // ensure user exists (authorization validation plus clearer error)
                userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

                LocalDateTime now = LocalDateTime.now();
                Page<Session> pageResult = sessionRepository.findVisibleSessionsForUser(group, userId, now,
                                PageRequest.of(page, size));
                return pageResult.map(SessionMapper::toDTO);
        }

        public SessionResponseDTO getSessionById(Long id) {
                Session session = sessionRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Session not found with ID: " + id));
                return SessionMapper.toDTO(session);
        }

        /**
         * Delete a session with permission checks. Only the session creator or a group
         * ADMIN may delete.
         * Notifies affected users (invitees and participants) about cancellation.
         */
        public void deleteSession(Long sessionId, Long actingUserId) {
                Session session = sessionRepository.findById(sessionId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Session not found with ID: " + sessionId));

                // Validate acting user exists
                User actor = userRepository.findById(actingUserId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "User not found with ID: " + actingUserId));

                boolean allowed = false;
                // Creator can delete (null-safe)
                try {
                        if (session.getCreatedBy() != null && session.getCreatedBy().getId() != null
                                        && session.getCreatedBy().getId().equals(actingUserId)) {
                                allowed = true;
                        }
                } catch (Exception e) {
                        log.warn("Error checking session creator during delete: {}", e.getMessage());
                }

                // Group ADMIN can delete
                if (!allowed) {
                        var gmOpt = groupMemberRepository.findByUserAndGroup(actor, session.getGroup());
                        if (gmOpt.isPresent() && gmOpt.get()
                                        .getRole() == com.groupgenius.groupgenius_backend.entity.GroupMember.Role.ADMIN) {
                                allowed = true;
                        }
                }

                if (!allowed) {
                        throw new com.groupgenius.groupgenius_backend.exception.UnauthorizedActionException(
                                        "User not authorized to delete this session");
                }

                // Collect affected users (invitees + participants) with diagnostics
                var invitations = invitationRepository.findBySession(session);
                var participants = sessionParticipantRepository.findBySession(session);
                log.debug("Deleting session id={} invitations={} participants={}", sessionId, invitations.size(),
                                participants.size());

                java.util.Set<Long> affected = new java.util.HashSet<>();
                for (var inv : invitations) {
                        if (inv != null && inv.getRecipient() != null && inv.getRecipient().getId() != null)
                                affected.add(inv.getRecipient().getId());
                }
                for (var sp : participants) {
                        if (sp != null && sp.getUser() != null && sp.getUser().getId() != null)
                                affected.add(sp.getUser().getId());
                }

                // do not notify the actor
                affected.remove(actingUserId);

                // Delete all notifications referencing this session to prevent FK constraint
                // violations. Use a JPQL bulk delete for a single DB operation which avoids
                // loading entities into the persistence context and prevents transient
                // instance / FK ordering issues.
                try {
                        int deleted = notificationRepository.deleteBySessionId(sessionId);
                        // flush so the delete is applied immediately and any DB-level
                        // constraint issues surface before we attempt to delete children
                        sessionRepository.flush();
                        log.debug("Deleted {} notifications referencing session {}", deleted, sessionId);
                } catch (Exception e) {
                        log.warn("Failed deleting notifications by session id {}: {}", sessionId,
                                        e.getMessage());
                        // Re-throw here so we do not proceed to delete the session when
                        // we couldn't clear referencing notifications — that would just
                        // produce an FK exception later. The caller (controller) will
                        // see the failure and we get a clearer log.
                        throw new RuntimeException("Failed clearing notifications for session " + sessionId + ": "
                                        + e.getMessage(), e);
                }

                // Delete child rows explicitly in JPA to avoid Hibernate transient instance
                // issues when relying solely on DB-level ON DELETE CASCADE.
                try {
                        sessionParticipantRepository.deleteAll(participants);
                        invitationRepository.deleteAll(invitations);
                        sessionRepository.flush();
                } catch (Exception e) {
                        log.warn("Failed deleting child rows prior to session delete: {}", e.getMessage());
                }

                // Notify affected users with standalone notifications BEFORE deleting the
                // session so notifications do not reference a deleted session and to avoid
                // transient/persistence-context ordering issues.
                final String cancelledTitle = session.getTitle();
                for (Long uid : affected) {
                        try {
                                notificationService.triggerStandaloneNotification(uid,
                                                "Session \"" + cancelledTitle + "\" has been cancelled.");
                        } catch (Exception e) {
                                log.warn("Failed notifying user {} about session cancel: {}", uid, e.getMessage());
                        }
                }

                // Delete the session (cascades will remove remaining records per schema)
                try {
                        sessionRepository.delete(session);
                        // flush to surface any constraint issues immediately
                        sessionRepository.flush();
                        log.debug("Session id={} deleted. Post-delete remaining invitations? participants? (cascade should remove them)",
                                        sessionId);
                } catch (Exception e) {
                        log.error("Failed to delete session id={}: {}", session.getId(), e.getMessage());
                        throw new RuntimeException("Failed to delete session: " + e.getMessage());
                }
        }
}
