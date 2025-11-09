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
import com.groupgenius.groupgenius_backend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class SessionService {

    private final SessionRepository sessionRepository;
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;


    public SessionService(SessionRepository sessionRepository, GroupRepository groupRepository, UserRepository userRepository, NotificationService notificationService) {
        this.sessionRepository = sessionRepository;
        this.groupRepository = groupRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }


    public SessionResponseDTO createSession(Long groupId, Long createdById, SessionRequestDTO requestDTO) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found with ID: " + groupId));

        User creator = userRepository.findById(createdById)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + createdById));

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
        // Notify all group members (except creator)
        notificationService.notifyGroupMembersOnSessionEvent(saved,
                "New session \"" + saved.getTitle() + "\" has been scheduled in your group \""
                        + saved.getGroup().getGroupName() + "\".");
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
                .orElseThrow(() -> new ResourceNotFoundException("Group not found with ID: " + groupId));

        return sessionRepository.findAll((root, query, cb) ->
                        cb.equal(root.get("group"), group), PageRequest.of(page, size))
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
        sessionRepository.deleteById(id);
    }
}
