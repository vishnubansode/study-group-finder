package com.groupgenius.groupgenius_backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionInvitationResponse {
    private Long id;
    private Long sessionId;
    private String sessionTitle;
    private String sessionDescription;
    private LocalDateTime sessionStartTime;
    private LocalDateTime sessionEndTime;
    private Integer sessionDurationDays;
    private Long groupId;
    private String groupName;
    private Long invitedBy;
    private String invitedByName;
    private Long userId;
    private String status;
    private LocalDateTime invitedAt;
    private LocalDateTime respondedAt;
}
