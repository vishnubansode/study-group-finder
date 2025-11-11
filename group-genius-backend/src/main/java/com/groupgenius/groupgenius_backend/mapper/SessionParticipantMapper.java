package com.groupgenius.groupgenius_backend.mapper;

import com.groupgenius.groupgenius_backend.dto.SessionParticipantResponse;
import com.groupgenius.groupgenius_backend.entity.SessionParticipant;

public final class SessionParticipantMapper {

    private SessionParticipantMapper() {
    }

    public static SessionParticipantResponse toDTO(SessionParticipant participant) {
        return SessionParticipantResponse.builder()
                .id(participant.getId())
                .sessionId(participant.getSession().getId())
                .userId(participant.getUser().getId())
                .userName(participant.getUser().getFirstName() + " " + participant.getUser().getLastName())
                .userEmail(participant.getUser().getEmail())
                .joinedAt(participant.getJoinedAt())
                .build();
    }
}
