package com.studygroup.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 2000)
    private String content;

    @Enumerated(EnumType.STRING)
    private MessageType messageType = MessageType.CHAT;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "is_edited")
    private Boolean isEdited = false;

    @Column(name = "edited_at")
    private LocalDateTime editedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    public enum MessageType {
        CHAT, SYSTEM, FILE
    }

    // Constructors
    public ChatMessage() {
    }

    public ChatMessage(String content, User sender, Group group) {
        this.content = content;
        this.sender = sender;
        this.group = group;
        this.messageType = MessageType.CHAT;
        this.sentAt = LocalDateTime.now();
        this.isEdited = false;
    }

    public ChatMessage(String content, MessageType messageType, User sender, Group group) {
        this.content = content;
        this.messageType = messageType;
        this.sender = sender;
        this.group = group;
        this.sentAt = LocalDateTime.now();
        this.isEdited = false;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public MessageType getMessageType() {
        return messageType;
    }

    public void setMessageType(MessageType messageType) {
        this.messageType = messageType;
    }

    public LocalDateTime getSentAt() {
        return sentAt;
    }

    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = sentAt;
    }

    public Boolean getIsEdited() {
        return isEdited;
    }

    public void setIsEdited(Boolean isEdited) {
        this.isEdited = isEdited;
    }

    public LocalDateTime getEditedAt() {
        return editedAt;
    }

    public void setEditedAt(LocalDateTime editedAt) {
        this.editedAt = editedAt;
    }

    public User getSender() {
        return sender;
    }

    public void setSender(User sender) {
        this.sender = sender;
    }

    public Group getGroup() {
        return group;
    }

    public void setGroup(Group group) {
        this.group = group;
    }

    @PrePersist
    protected void onCreate() {
        sentAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        if (isEdited) {
            editedAt = LocalDateTime.now();
        }
    }
}