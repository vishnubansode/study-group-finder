package com.groupgenius.groupgenius_backend.mapper;

import com.groupgenius.groupgenius_backend.dto.SessionInvitationResponse;
import com.groupgenius.groupgenius_backend.entity.SessionInvitation;

public final class SessionInvitationMapper {

    private SessionInvitationMapper() {
    }

    public static SessionInvitationResponse toDTO(SessionInvitation invitation) {
        return SessionInvitationResponse.builder()
                .id(invitation.getId())
                .sessionId(invitation.getSession().getId())
                .sessionTitle(invitation.getSession().getTitle())
                .sessionDescription(invitation.getSession().getDescription())
                .sessionStartTime(invitation.getSession().getStartTime())
                .sessionEndTime(invitation.getSession().getComputedEndTime())
                .groupId(invitation.getSession().getGroup().getId())
                .groupName(invitation.getSession().getGroup().getGroupName())
                .sessionDurationDays(invitation.getSession().getDurationDays())
                .invitedBy(invitation.getSession().getCreatedBy().getId())
                .invitedByName(invitation.getSession().getCreatedBy().getFirstName() + " " +
                        invitation.getSession().getCreatedBy().getLastName())
                .userId(invitation.getUser().getId())
                .status(invitation.getStatus().name())
                .invitedAt(invitation.getInvitedAt())
                .respondedAt(invitation.getRespondedAt())
                .build();
    }
}
