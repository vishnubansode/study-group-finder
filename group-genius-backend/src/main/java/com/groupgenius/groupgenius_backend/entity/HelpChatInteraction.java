package com.groupgenius.groupgenius_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "help_chat_interactions")
@Data
public class HelpChatInteraction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String question;

    @Column(columnDefinition = "TEXT")
    private String response;

    @Column(nullable = false)
    private String sessionId;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Enumerated(EnumType.STRING)
    private InteractionType type;

    private String userAgent;
    private String pageContext;

    public enum InteractionType {
        QUESTION, GUIDANCE, FEATURE_HELP, ONBOARDING
    }

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }
}