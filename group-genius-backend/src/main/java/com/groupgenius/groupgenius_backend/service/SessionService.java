package com.groupgenius.groupgenius_backend.service;

import com.groupgenius.groupgenius_backend.dto.SessionCreateWithInvitationsRequest;
import com.groupgenius.groupgenius_backend.dto.SessionRequestDTO;
import com.groupgenius.groupgenius_backend.dto.SessionResponseDTO;
import com.groupgenius.groupgenius_backend.entity.Group;
import com.groupgenius.groupgenius_backend.entity.GroupMember;
import com.groupgenius.groupgenius_backend.entity.Session;
import com.groupgenius.groupgenius_backend.entity.User;
import com.groupgenius.groupgenius_backend.exception.ResourceNotFoundException;
import com.groupgenius.groupgenius_backend.exception.TimeSlotConflictException;
import com.groupgenius.groupgenius_backend.mapper.SessionMapper;
import com.groupgenius.groupgenius_backend.repository.GroupMemberRepository;
import com.groupgenius.groupgenius_backend.repository.GroupRepository;
import com.groupgenius.groupgenius_backend.repository.SessionRepository;
import com.groupgenius.groupgenius_backend.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
public class SessionService {

        private final SessionRepository sessionRepository;
        private final GroupRepository groupRepository;
        private final UserRepository userRepository;
        private final GroupMemberRepository groupMemberRepository;
        private final NotificationService notificationService;
        private final SessionInvitationService invitationService;

        public SessionService(SessionRepository sessionRepository, GroupRepository groupRepository,
                        UserRepository userRepository, GroupMemberRepository groupMemberRepository,
                        NotificationService notificationService, SessionInvitationService invitationService) {
                this.sessionRepository = sessionRepository;
                this.groupRepository = groupRepository;
                this.userRepository = userRepository;
                this.groupMemberRepository = groupMemberRepository;
                this.notificationService = notificationService;
                this.invitationService = invitationService;
        }

        /**
         * Parse an incoming ISO datetime string which may include a timezone offset
         * (e.g. +05:30).
         * If an offset is present we normalize to the server default zone and return a
         * LocalDateTime.
         * If no offset is present we parse as LocalDateTime directly.
         */
        private LocalDateTime parseIncomingToLocalDateTime(String incoming) {
                if (incoming == null)
                        return null;
                try {
                        // Try parsing as OffsetDateTime first (handles offset like +05:30 or Z)
                        OffsetDateTime odt = OffsetDateTime.parse(incoming, DateTimeFormatter.ISO_DATE_TIME);
                        Instant instant = odt.toInstant();
                        return LocalDateTime.ofInstant(instant, ZoneId.systemDefault());
                } catch (DateTimeParseException ex) {
                        // Fallback: try parsing as LocalDateTime
                        try {
                                return LocalDateTime.parse(incoming, DateTimeFormatter.ISO_DATE_TIME);
                        } catch (DateTimeParseException ex2) {
                                throw new IllegalArgumentException("Invalid datetime format: " + incoming);
                        }
                }
        }

        /**
         * Prefer a local wall-clock string when provided (format YYYY-MM-DDTHH:mm or
         * ISO_LOCAL_DATE_TIME),
         * otherwise parse the offset-aware/incoming value.
         */
        private LocalDateTime resolveStartTime(String startTimeLocal, String incoming) {
                if (startTimeLocal != null && !startTimeLocal.trim().isEmpty()) {
                        try {
                                return LocalDateTime.parse(startTimeLocal, DateTimeFormatter.ISO_DATE_TIME);
                        } catch (DateTimeParseException ex) {
                                // Try without seconds (YYYY-MM-DDTHH:mm)
                                try {
                                        return LocalDateTime.parse(startTimeLocal + ":00",
                                                        DateTimeFormatter.ISO_DATE_TIME);
                                } catch (DateTimeParseException ex2) {
                                        throw new IllegalArgumentException(
                                                        "Invalid local datetime format: " + startTimeLocal);
                                }
                        }
                }
                return parseIncomingToLocalDateTime(incoming);
        }

        public SessionResponseDTO createSession(Long groupId, Long createdById, SessionRequestDTO requestDTO) {
                Group group = groupRepository.findById(groupId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Group not found with ID: " + groupId));

                User creator = userRepository.findById(createdById)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "User not found with ID: " + createdById));

                // Resolve start time: prefer local wall-clock if provided by frontend, else
                // parse offset-aware string
                LocalDateTime start = resolveStartTime(requestDTO.getStartTimeLocal(), requestDTO.getStartTime());
                // Validate overlap (compute end time from durationDays)
                LocalDateTime computedEnd = start
                                .plusDays(requestDTO.getDurationDays() == null ? 1 : requestDTO.getDurationDays());
                List<Session> conflicts = sessionRepository.findOverlappingSessions(
                                group.getId(), start, computedEnd);
                if (!conflicts.isEmpty()) {
                        throw new TimeSlotConflictException("Session time overlaps with another existing session");
                }

                Session session = Session.builder()
                                .group(group)
                                .title(requestDTO.getTitle())
                                .description(requestDTO.getDescription())
                                .startTime(start)
                                .durationDays(requestDTO.getDurationDays() == null ? 1 : requestDTO.getDurationDays())
                                .meetingLink(requestDTO.getMeetingLink())
                                .createdBy(creator)
                                .build();

                Session saved = sessionRepository.save(session);
                log.info("📅 Session created: {} in group {}", saved.getTitle(), group.getGroupName());

                // Automatically add creator as a participant (they don't need an invitation)
                invitationService.addCreatorAsParticipant(saved, creator);

                // Get all group members except the creator and send invitations
                List<GroupMember> groupMembers = groupMemberRepository.findByGroup(group);
                List<Long> memberIds = groupMembers.stream()
                                .map(gm -> gm.getUser().getId())
                                .filter(userId -> !userId.equals(createdById)) // Exclude creator
                                .collect(Collectors.toList());

                if (!memberIds.isEmpty()) {
                        invitationService.createInvitations(saved, memberIds);
                        log.info("📨 Sent {} invitations for session: {}", memberIds.size(), saved.getTitle());
                } else {
                        log.info("ℹ️ No other members in group to invite for session: {}", saved.getTitle());
                }

                return SessionMapper.toDTO(saved);
        }

        public SessionResponseDTO updateSession(Long id, SessionRequestDTO requestDTO) {
                Session existing = sessionRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Session not found with ID: " + id));

                LocalDateTime start = resolveStartTime(requestDTO.getStartTimeLocal(), requestDTO.getStartTime());
                LocalDateTime updatedEnd = start
                                .plusDays(requestDTO.getDurationDays() == null ? 1 : requestDTO.getDurationDays());
                List<Session> conflicts = sessionRepository.findOverlappingSessions(
                                existing.getGroup().getId(),
                                start,
                                updatedEnd);

                if (!conflicts.isEmpty() && conflicts.stream().anyMatch(s -> !s.getId().equals(id))) {
                        throw new TimeSlotConflictException("Session time overlaps with another session");
                }

                existing.setTitle(requestDTO.getTitle());
                existing.setDescription(requestDTO.getDescription());
                existing.setStartTime(start);
                existing.setDurationDays(requestDTO.getDurationDays() == null ? 1 : requestDTO.getDurationDays());
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

                // Return only active (non-archived) sessions by default
                return sessionRepository.findByGroupAndArchivedFalse(group, PageRequest.of(page, size))
                                .map(SessionMapper::toDTO);
        }

        public SessionResponseDTO getSessionById(Long id) {
                Session session = sessionRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Session not found with ID: " + id));
                return SessionMapper.toDTO(session);
        }

        public void deleteSession(Long id) {
                if (!sessionRepository.existsById(id)) {
                        throw new ResourceNotFoundException("Session not found with ID: " + id);
                }
                // Defensive deletion: remove any legacy rows in an older `invitations` table
                // then remove invitation/participant/notification rows managed by repositories.
                // This protects against mismatched DB schemas where an `invitations` table
                // exists (FK prevents session deletion).
                try {
                        invitationService.deleteLegacyInvitationsBySessionId(id);
                } catch (Exception ex) {
                        log.debug("No legacy invitation cleanup needed: {}", ex.getMessage());
                }

                Session session = sessionRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Session not found with ID: " + id));

                // remove session-related entities that JPA/Hibernate should also cascade,
                // but we explicitly delete to be safe against schema drift
                try {
                        invitationService.deleteInvitationsBySession(session);
                } catch (Exception ex) {
                        log.debug("Failed to delete session invitations explicitly: {}", ex.getMessage());
                }
                try {
                        invitationService.deleteParticipantsBySession(session);
                } catch (Exception ex) {
                        log.debug("Failed to delete session participants explicitly: {}", ex.getMessage());
                }
                try {
                        invitationService.deleteNotificationsBySession(session);
                } catch (Exception ex) {
                        log.debug("Failed to delete session notifications explicitly: {}", ex.getMessage());
                }

                // Finally delete the session (JPA cascade will handle anything remaining)
                sessionRepository.delete(session);
                log.info("🗑️ Session with ID {} deleted successfully.", id);
        }

        /**
         * Get all sessions created by a specific user across all groups
         */
        public List<SessionResponseDTO> getSessionsByCreator(Long creatorId) {
                User creator = userRepository.findById(creatorId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "User not found with ID: " + creatorId));

                // Return only active (non-archived) sessions by default
                List<Session> sessions = sessionRepository.findByCreatedByAndArchivedFalse(creator);
                log.info("📋 Found {} sessions created by user: {}", sessions.size(), creator.getEmail());

                return sessions.stream()
                                .map(SessionMapper::toDTO)
                                .collect(Collectors.toList());
        }

        /**
         * Create a session with invitations to selected group members
         */
        public SessionResponseDTO createSessionWithInvitations(Long createdById,
                        SessionCreateWithInvitationsRequest request) {
                Group group = groupRepository.findById(request.getGroupId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Group not found with ID: " + request.getGroupId()));

                User creator = userRepository.findById(createdById)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "User not found with ID: " + createdById));

                // Resolve datetime: prefer startTimeLocal when present, else parse offset-aware
                // string
                LocalDateTime startTime = resolveStartTime(request.getStartTimeLocal(), request.getStartTime());
                Integer duration = request.getDurationDays() == null ? 1 : request.getDurationDays();
                LocalDateTime endTime = startTime.plusDays(duration);

                // Validate overlap
                List<Session> conflicts = sessionRepository.findOverlappingSessions(group.getId(), startTime, endTime);
                if (!conflicts.isEmpty()) {
                        throw new TimeSlotConflictException("Session time overlaps with another existing session");
                }

                // Create session
                Session session = Session.builder()
                                .group(group)
                                .title(request.getTitle())
                                .description(request.getDescription())
                                .startTime(startTime)
                                .durationDays(duration)
                                .meetingLink(request.getMeetingLink())
                                .createdBy(creator)
                                .build();

                Session saved = sessionRepository.save(session);
                log.info("📅 Session created: {} in group {}", saved.getTitle(), group.getGroupName());

                // Automatically add creator as a participant (they don't need an invitation)
                invitationService.addCreatorAsParticipant(saved, creator);

                // Create invitations for selected members
                if (request.getInvitedUserIds() != null && !request.getInvitedUserIds().isEmpty()) {
                        invitationService.createInvitations(saved, request.getInvitedUserIds());
                } else {
                        // If no specific users invited, notify all group members (old behavior)
                        notificationService.notifyGroupMembersOnSessionEvent(saved,
                                        "New session \"" + saved.getTitle() + "\" has been scheduled in your group \""
                                                        + saved.getGroup().getGroupName() + "\".");
                }

                return SessionMapper.toDTO(saved);
        }
}