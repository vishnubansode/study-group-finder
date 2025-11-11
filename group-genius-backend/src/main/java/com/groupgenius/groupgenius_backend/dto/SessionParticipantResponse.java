package com.groupgenius.groupgenius_backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionParticipantResponse {
    private Long id;
    private Long sessionId;
    private Long userId;
    private String userName;
    private String userEmail;
    private LocalDateTime joinedAt;
}
