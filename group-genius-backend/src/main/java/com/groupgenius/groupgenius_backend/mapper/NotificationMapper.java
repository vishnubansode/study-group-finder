package com.groupgenius.groupgenius_backend.mapper;

import com.groupgenius.groupgenius_backend.dto.NotificationResponse;
import com.groupgenius.groupgenius_backend.entity.Notification;

public class NotificationMapper {

    private NotificationMapper() {
    }

    public static NotificationResponse toDTO(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .recipientId(notification.getRecipient().getId())
                .recipientName(notification.getRecipient().getFirstName())
                .sessionId(notification.getSession() != null ? notification.getSession().getId() : null)
                .type(notification.getType() != null ? notification.getType().name() : null)
                .message(notification.getMessage())
                .read(notification.getRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
