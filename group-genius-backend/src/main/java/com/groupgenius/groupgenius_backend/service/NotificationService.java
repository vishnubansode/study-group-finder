package com.groupgenius.groupgenius_backend.service;

import com.groupgenius.groupgenius_backend.dto.NotificationResponse;
import com.groupgenius.groupgenius_backend.entity.*;
import com.groupgenius.groupgenius_backend.exception.NotificationProcessingException;
import com.groupgenius.groupgenius_backend.exception.ResourceNotFoundException;
import com.groupgenius.groupgenius_backend.mapper.NotificationMapper;
import com.groupgenius.groupgenius_backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SessionRepository sessionRepository;
    private final GroupMemberRepository groupMemberRepository;

    /**
     * Notify all group members (except session creator)
     */
    public void notifyGroupMembersOnSessionEvent(Session session, String message) {
        try {
            List<GroupMember> members = groupMemberRepository.findByGroup(session.getGroup());

            for (GroupMember member : members) {
                User recipient = member.getUser();

                // Skip the creator
                if (recipient.getId().equals(session.getCreatedBy().getId()))
                    continue;

                Notification notification = Notification.builder()
                        .recipient(recipient)
                        .session(session)
                        .type(Notification.NotificationType.GENERAL)
                        .message(message)
                        .read(false)
                        .build();

                notificationRepository.save(notification);
                log.info("📢 Notification sent to user {} for session {}", recipient.getId(), session.getId());
            }

        } catch (DataIntegrityViolationException e) {
            log.error("Data integrity violation while notifying group members: {}", e.getMessage());
            throw new NotificationProcessingException("Failed to notify group members due to invalid data.", e);
        } catch (Exception e) {
            log.error("Unexpected error during group member notification: {}", e.getMessage(), e);
            throw new NotificationProcessingException("Unexpected error while sending group notifications.", e);
        }
    }

    /**
     * Trigger direct notification for a specific recipient
     */
    public void triggerSessionNotification(Long recipientId, Long sessionId, String message) {
        try {
            User recipient = userRepository.findById(recipientId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + recipientId));

            Session session = sessionRepository.findById(sessionId)
                    .orElseThrow(() -> new ResourceNotFoundException("Session not found with ID: " + sessionId));

            Notification notification = Notification.builder()
                    .recipient(recipient)
                    .session(session)
                    .type(Notification.NotificationType.GENERAL)
                    .message(message)
                    .read(false)
                    .build();

            notificationRepository.save(notification);
            log.info("📨 Direct notification sent to user {} for session {}", recipientId, sessionId);

        } catch (DataIntegrityViolationException e) {
            log.error("Database error while saving notification: {}", e.getMessage());
            throw new NotificationProcessingException("Failed to save notification due to invalid data.", e);
        } catch (Exception e) {
            log.error("Unexpected error while triggering notification: {}", e.getMessage(), e);
            throw new NotificationProcessingException("Unexpected error while triggering notification.", e);
        }
    }

    /**
     * Fetch notifications for a specific user
     */
    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotificationsForUser(Long userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

            List<NotificationResponse> notifications = notificationRepository.findByRecipientOrderByCreatedAtDesc(user)
                    .stream()
                    .map(NotificationMapper::toDTO)
                    .toList();

            log.info("📬 Fetched {} notifications for user {}", notifications.size(), userId);
            return notifications;

        } catch (Exception e) {
            log.error("Error fetching notifications for user {}: {}", userId, e.getMessage(), e);
            throw new NotificationProcessingException("Failed to fetch notifications for user " + userId, e);
        }
    }

    /**
     * Mark a notification as read
     */
    public NotificationResponse markAsRead(Long notificationId) {
        try {
            Notification notification = notificationRepository.findById(notificationId)
                    .orElseThrow(
                            () -> new ResourceNotFoundException("Notification not found with ID: " + notificationId));

            notification.setRead(true);
            Notification updated = notificationRepository.save(notification);
            log.info("Notification {} marked as read", notificationId);

            return NotificationMapper.toDTO(updated);

        } catch (DataIntegrityViolationException e) {
            log.error("Error updating notification {}: {}", notificationId, e.getMessage());
            throw new NotificationProcessingException("Failed to mark notification as read due to DB constraint.", e);
        } catch (Exception e) {
            log.error("Unexpected error marking notification {} as read: {}", notificationId, e.getMessage(), e);
            throw new NotificationProcessingException("Unexpected error while marking notification as read.", e);
        }
    }
}
