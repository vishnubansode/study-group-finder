package com.groupgenius.groupgenius_backend.mapper;

import com.groupgenius.groupgenius_backend.dto.SessionInvitationResponse;
import com.groupgenius.groupgenius_backend.entity.SessionInvitation;

public final class SessionInvitationMapper {

    private SessionInvitationMapper() {
    }

    public static SessionInvitationResponse toDTO(SessionInvitation invitation) {
        // Combine date + time to create LocalDateTime for the response
        var session = invitation.getSession();
        var sessionStartDateTime = session.getSessionDate() != null && session.getStartTime() != null
                ? session.getSessionDate().atTime(session.getStartTime())
                : null;
        var sessionEndDateTime = session.getComputedEndTime(); // This already returns LocalDateTime

        return SessionInvitationResponse.builder()
                .id(invitation.getId())
                .sessionId(session.getId())
                .sessionTitle(session.getTitle())
                .sessionDescription(session.getDescription())
                .sessionStartTime(sessionStartDateTime)
                .sessionEndTime(sessionEndDateTime)
                .groupId(session.getGroup().getId())
                .groupName(session.getGroup().getGroupName())
                .sessionDurationDays(session.getDurationDays())
                .invitedBy(session.getCreatedBy().getId())
                .invitedByName(session.getCreatedBy().getFirstName() + " " +
                        session.getCreatedBy().getLastName())
                .userId(invitation.getUser().getId())
                .status(invitation.getStatus().name())
                .invitedAt(invitation.getInvitedAt())
                .respondedAt(invitation.getRespondedAt())
                .build();
    }
}
