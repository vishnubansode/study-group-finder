package com.groupgenius.groupgenius_backend.service;

import com.groupgenius.groupgenius_backend.dto.SessionParticipantResponse;
import com.groupgenius.groupgenius_backend.entity.Session;
import com.groupgenius.groupgenius_backend.entity.SessionParticipant;
import com.groupgenius.groupgenius_backend.exception.ResourceNotFoundException;
import com.groupgenius.groupgenius_backend.mapper.SessionParticipantMapper;
import com.groupgenius.groupgenius_backend.repository.SessionParticipantRepository;
import com.groupgenius.groupgenius_backend.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import com.groupgenius.groupgenius_backend.repository.UserRepository;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class SessionParticipantService {

    private final SessionParticipantRepository participantRepository;
    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final com.groupgenius.groupgenius_backend.repository.GroupMemberRepository groupMemberRepository;

    /**
     * Get all participants for a session
     */
    @Transactional(readOnly = true)
    public List<SessionParticipantResponse> getParticipantsForSession(Long sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with ID: " + sessionId));

        return participantRepository.findBySession(session).stream()
                .map(SessionParticipantMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get participant count for a session
     */
    @Transactional(readOnly = true)
    public long getParticipantCount(Long sessionId) {
        return participantRepository.countBySessionId(sessionId);
    }

    /**
     * Check if user is a participant of a session
     */
    @Transactional(readOnly = true)
    public boolean isParticipant(Long sessionId, Long userId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with ID: " + sessionId));

        return participantRepository.findBySession(session).stream()
                .anyMatch(p -> p.getUser().getId().equals(userId));
    }

    /**
     * Add a user as participant to a session (idempotent)
     */
    public SessionParticipant addParticipant(Long sessionId, Long userId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with ID: " + sessionId));

        com.groupgenius.groupgenius_backend.entity.User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        // Ensure the user is an approved member of the session's group before allowing
        // them to join
        if (session.getGroup() != null) {
            com.groupgenius.groupgenius_backend.entity.Group group = session.getGroup();
            com.groupgenius.groupgenius_backend.entity.GroupMember membership = groupMemberRepository
                    .findByUserAndGroup(user, group)
                    .orElse(null);
            if (membership == null || membership
                    .getStatus() != com.groupgenius.groupgenius_backend.entity.GroupMember.Status.APPROVED) {
                throw new com.groupgenius.groupgenius_backend.exception.UnauthorizedActionException(
                        "Only approved group members can join this session");
            }
        }

        // If already a participant, return existing
        Optional<SessionParticipant> existing = participantRepository.findBySessionAndUser(session, user);
        if (existing.isPresent())
            return existing.get();

        SessionParticipant participant = SessionParticipant.builder()
                .session(session)
                .user(user)
                .build();

        SessionParticipant saved = participantRepository.save(participant);
        log.info("User {} added as participant to session {}", userId, sessionId);
        return saved;
    }

    /**
     * Remove a participant from a session (leave)
     */
    public void removeParticipant(Long sessionId, Long userId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with ID: " + sessionId));

        // Find the participant entry and delete it if present
        List<SessionParticipant> participants = participantRepository.findBySession(session);
        for (SessionParticipant p : participants) {
            if (p.getUser().getId().equals(userId)) {
                participantRepository.delete(p);
                log.info("User {} removed from session {}", userId, sessionId);
                return;
            }
        }

        // If not found, nothing to do
        log.debug("User {} was not a participant of session {}", userId, sessionId);
    }
}
