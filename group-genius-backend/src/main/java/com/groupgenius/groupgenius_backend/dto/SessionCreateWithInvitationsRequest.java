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
    private String date; // YYYY-MM-DD
    private String startTime; // HH:mm
    private String endTime; // HH:mm
    private Integer durationDays; // number of days the session continues
    private String meetingLink;
    private List<Long> invitedUserIds; // List of user IDs to invite
}
