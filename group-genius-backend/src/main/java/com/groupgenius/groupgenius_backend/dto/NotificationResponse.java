package com.groupgenius.groupgenius_backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {
    private Long id;
    private Long recipientId;
    private String recipientName;
    private Long sessionId;
    private String type;
    private String message;
    private Boolean read;
    private LocalDateTime createdAt;
}
