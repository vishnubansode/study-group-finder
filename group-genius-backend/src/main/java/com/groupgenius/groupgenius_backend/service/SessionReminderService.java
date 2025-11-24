package com.groupgenius.groupgenius_backend.service;

import com.groupgenius.groupgenius_backend.entity.Notification;
import com.groupgenius.groupgenius_backend.entity.Session;
import com.groupgenius.groupgenius_backend.entity.SessionParticipant;
import com.groupgenius.groupgenius_backend.entity.User;
import com.groupgenius.groupgenius_backend.repository.NotificationRepository;
import com.groupgenius.groupgenius_backend.repository.SessionParticipantRepository;
import com.groupgenius.groupgenius_backend.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class SessionReminderService {

    private static final DateTimeFormatter TIME_DISPLAY_FORMATTER = DateTimeFormatter.ofPattern("h:mm a");
    private static final long DAY_OF_TOLERANCE_MINUTES = 24 * 60; // allow day-of reminder any time during the day
    private static final long TWO_HOUR_TOLERANCE_MINUTES = 45;
    private static final long ONE_HOUR_TOLERANCE_MINUTES = 30;

    private final SessionRepository sessionRepository;
    private final SessionParticipantRepository participantRepository;
    private final NotificationRepository notificationRepository;
    private final EmailService emailService;

    private enum ReminderType {
        DAY_OF,
        TWO_HOURS_BEFORE,
        ONE_HOUR_BEFORE
    }

    @Scheduled(fixedDelayString = "${app.reminders.poll-interval-ms:300000}")
    @Transactional
    public void dispatchSessionReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime windowStart = now.minusDays(1);
        LocalDateTime windowEnd = now.plusDays(2);

        List<Session> sessions = sessionRepository.findActiveSessionsBetween(windowStart, windowEnd);
        if (sessions.isEmpty()) {
            return;
        }

        for (Session session : sessions) {
            LocalDateTime sessionStart = session.getComputedStartTime();
            if (sessionStart == null) {
                continue;
            }
            processReminder(session, ReminderType.DAY_OF,
                    sessionStart.toLocalDate().atStartOfDay(), now);
            processReminder(session, ReminderType.TWO_HOURS_BEFORE,
                    sessionStart.minusHours(2), now);
            processReminder(session, ReminderType.ONE_HOUR_BEFORE,
                    sessionStart.minusHours(1), now);
        }
    }

    private void processReminder(Session session, ReminderType reminderType,
            LocalDateTime triggerTime, LocalDateTime now) {
        if (triggerTime == null) {
            return;
        }

        if (now.isBefore(triggerTime)) {
            return;
        }

        LocalDateTime sessionStart = session.getComputedStartTime();
        if (reminderType != ReminderType.DAY_OF && sessionStart != null && now.isAfter(sessionStart)) {
            return;
        }

        long tolerance = toleranceMinutesFor(reminderType);
        long minutesSinceTrigger = ChronoUnit.MINUTES.between(triggerTime, now);
        if (minutesSinceTrigger < 0 || minutesSinceTrigger > tolerance) {
            return;
        }

        String message = buildReminderMessage(session, reminderType);
        if (notificationRepository.existsBySessionAndTypeAndMessage(
                session,
                Notification.NotificationType.REMINDER,
                message)) {
            return;
        }

        sendReminderNotifications(session, reminderType, message);
    }

    private void sendReminderNotifications(Session session, ReminderType reminderType, String message) {
        List<SessionParticipant> participants = participantRepository.findBySession(session);
        Set<Long> recipientIds = new HashSet<>();
        List<Notification> notifications = new ArrayList<>();

        addRecipientFromUser(session.getCreatedBy(), session, message, recipientIds, notifications);

        for (SessionParticipant participant : participants) {
            addRecipientFromUser(participant.getUser(), session, message, recipientIds, notifications);
        }

        if (notifications.isEmpty()) {
            log.debug("No recipients found for reminder {} on session {}", reminderType, session.getId());
            return;
        }

        notificationRepository.saveAll(notifications);
        log.info("Sent {} reminder notifications for session {} ({})", notifications.size(), session.getId(),
                reminderType);

        // Send email reminders to all recipients
        String emailSubject = String.format("Session Reminder: %s", session.getTitle());
        for (Notification notification : notifications) {
            try {
                emailService.sendNotificationEmail(
                        notification.getRecipient().getEmail(),
                        emailSubject,
                        notification.getMessage());
                log.info("📧 Reminder email sent to {}", notification.getRecipient().getEmail());
            } catch (Exception e) {
                log.error("Failed to send reminder email to {}: {}",
                        notification.getRecipient().getEmail(), e.getMessage());
            }
        }
    }

    private void addRecipientFromUser(User user, Session session, String message,
            Set<Long> recipientIds, List<Notification> notifications) {
        if (user == null) {
            return;
        }
        if (!recipientIds.add(user.getId())) {
            return;
        }

        notifications.add(Notification.builder()
                .recipient(user)
                .session(session)
                .type(Notification.NotificationType.REMINDER)
                .message(message)
                .read(false)
                .build());
    }

    private String buildReminderMessage(Session session, ReminderType reminderType) {
        LocalDateTime startTime = session.getComputedStartTime();
        if (startTime == null) {
            return "Session reminder: " + session.getTitle();
        }
        String formattedTime = startTime.format(TIME_DISPLAY_FORMATTER);
        LocalDate sessionDate = startTime.toLocalDate();

        return switch (reminderType) {
            case DAY_OF -> String.format("Reminder: '%s' happens today (%s at %s)", session.getTitle(),
                    sessionDate, formattedTime);
            case TWO_HOURS_BEFORE -> String.format("Reminder: '%s' begins in 2 hours at %s", session.getTitle(),
                    formattedTime);
            case ONE_HOUR_BEFORE -> String.format("Reminder: '%s' begins in 1 hour at %s", session.getTitle(),
                    formattedTime);
        };
    }

    private long toleranceMinutesFor(ReminderType reminderType) {
        return switch (reminderType) {
            case DAY_OF -> DAY_OF_TOLERANCE_MINUTES;
            case TWO_HOURS_BEFORE -> TWO_HOUR_TOLERANCE_MINUTES;
            case ONE_HOUR_BEFORE -> ONE_HOUR_TOLERANCE_MINUTES;
        };
    }
}
