package com.groupgenius.groupgenius_backend.service;

import com.groupgenius.groupgenius_backend.dto.SessionParticipantResponse;
import com.groupgenius.groupgenius_backend.entity.Session;
import com.groupgenius.groupgenius_backend.entity.SessionParticipant;
import com.groupgenius.groupgenius_backend.exception.ResourceNotFoundException;
import com.groupgenius.groupgenius_backend.mapper.SessionParticipantMapper;
import com.groupgenius.groupgenius_backend.repository.SessionParticipantRepository;
import com.groupgenius.groupgenius_backend.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
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
}
