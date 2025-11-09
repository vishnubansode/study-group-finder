package com.groupgenius.groupgenius_backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationRequest {
    private Long recipientId;
    private Long sessionId;
    private String message;
}
