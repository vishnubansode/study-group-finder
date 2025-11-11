package com.groupgenius.groupgenius_backend.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionCreateWithInvitationsRequest {
    private Long groupId;
    private String title;
    private String description;
    private String startTime; // ISO format datetime
    private String endTime; // ISO format datetime
    private String meetingLink;
    private List<Long> invitedUserIds; // List of user IDs to invite
}
