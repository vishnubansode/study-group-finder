package com.groupgenius.groupgenius_backend.chat;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "chat_messages")
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "group_id", nullable = false)
    private Long groupId;

    @Column(name = "sender_id", nullable = false)
    private Long senderId;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;

    @Column(name = "message_type")
    private String messageType = "TEXT";

    @Column(name = "edited")
    private Boolean edited = false;

    // Not persisted; used for UI echoing (client may send sender display name)
    @Transient
    private String sender;

    // Client-generated ID to reconcile optimistic sends with server echo
    @Transient
    private String clientMessageId;

    // Sender metadata for rich UI display
    @Transient
    private String senderPhone;

    @Transient
    private String senderProfileImageUrl;
}
