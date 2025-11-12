package com.groupgenius.groupgenius_backend.mapper;

import com.groupgenius.groupgenius_backend.dto.SessionResponseDTO;
import com.groupgenius.groupgenius_backend.entity.Session;

public class SessionMapper {

    private SessionMapper() {
    }

    public static SessionResponseDTO toDTO(Session session) {
        return SessionResponseDTO.builder()
                .id(session.getId())
                .groupId(session.getGroup().getId())
                .title(session.getTitle())
                .description(session.getDescription())
                .startTime(session.getStartTime())
                .durationDays(session.getDurationDays())
                .meetingLink(session.getMeetingLink())
                .createdById(session.getCreatedBy().getId())
                .createdByName(session.getCreatedBy().getFirstName())
                .createdAt(session.getCreatedAt())
                .build();
    }
}
