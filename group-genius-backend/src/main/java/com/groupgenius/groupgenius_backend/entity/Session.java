package com.groupgenius.groupgenius_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private LocalDate sessionDate;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    @Column(nullable = false)
    private Integer durationDays;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(length = 500)
    private String meetingLink;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SessionInvitation> invitations = new ArrayList<>();

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SessionParticipant> participants = new ArrayList<>();

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Notification> notifications = new ArrayList<>();

    // Soft-archive flag: when true the session is hidden from regular queries but
    // preserved in DB
    @Column(nullable = false)
    @Builder.Default
    private Boolean archived = false;

    @Column
    private LocalDateTime archivedAt;

    public LocalDateTime getComputedStartTime() {
        if (sessionDate == null || startTime == null)
            return null;
        return LocalDateTime.of(sessionDate, startTime);
    }

    public LocalDateTime getComputedEndTime() {
        if (sessionDate == null || startTime == null || endTime == null || durationDays == null)
            return null;
        LocalDateTime firstDayEnd = LocalDateTime.of(sessionDate, endTime);
        long extraDays = Math.max(0, durationDays.longValue() - 1);
        return firstDayEnd.plusDays(extraDays);
    }
}
