package com.groupgenius.groupgenius_backend.service;

import com.groupgenius.groupgenius_backend.entity.Invitation;
import com.groupgenius.groupgenius_backend.entity.Session;
import com.groupgenius.groupgenius_backend.entity.SessionParticipant;
import com.groupgenius.groupgenius_backend.entity.User;
import com.groupgenius.groupgenius_backend.exception.ResourceNotFoundException;
import com.groupgenius.groupgenius_backend.repository.InvitationRepository;
import com.groupgenius.groupgenius_backend.repository.SessionParticipantRepository;
import com.groupgenius.groupgenius_backend.repository.SessionRepository;
import com.groupgenius.groupgenius_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class InvitationService {

    private final InvitationRepository invitationRepository;
    private final UserRepository userRepository;
    private final SessionRepository sessionRepository;
    private final SessionParticipantRepository sessionParticipantRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    /**
     * Create invitations for a session. This is transactional: invitations are
     * created and notifications dispatched.
     */
    @Transactional
    public List<Invitation> createInvitationsForSession(Long sessionId, Long senderId, List<Long> recipientIds,
            String message) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found: " + sessionId));

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("Sender not found: " + senderId));

        List<Invitation> created = new ArrayList<>();

        for (Long rid : recipientIds) {
            // defensive: skip if recipient is the sender
            if (rid != null && sender != null && rid.equals(sender.getId())) {
                log.debug("Skipping creating invitation for sender themselves: {}", rid);
                continue;
            }
            User recipient = userRepository.findById(rid)
                    .orElseThrow(() -> new ResourceNotFoundException("Recipient not found: " + rid));

            Invitation inv = Invitation.builder()
                    .session(session)
                    .sender(sender)
                    .recipient(recipient)
                    .status("PENDING")
                    .channel("in-app")
                    .message(message)
                    .build();

            Invitation saved = invitationRepository.save(inv);
            created.add(saved);

            // create notification for recipient (linking to invitation)
            try {
                notificationService.triggerInvitationNotification(recipient.getId(), session.getId(), saved.getId(),
                        "You have been invited to join session: " + session.getTitle());
            } catch (Exception e) {
                log.warn("Failed to send notification for invitation {}: {}", saved.getId(), e.getMessage());
            }

            // optionally send email asynchronously (no-op/logs in dev)
            try {
                emailService.sendInvitationEmail(saved);
            } catch (Exception e) {
                log.warn("Failed to queue invitation email for {}: {}", saved.getId(), e.getMessage());
            }
        }

        log.info("Created {} invitations for session {}: recipients={} (sender={})", created.size(), sessionId,
                created.stream().map(i -> i.getRecipient().getId()).toList(), senderId);

        return created;
    }

    /**
     * Respond to an invitation (ACCEPT or DECLINE). If accepted, create a session
     * participant.
     */
    @Transactional
    public Invitation respondToInvitation(Long invitationId, Long userId, String action) {
        Invitation inv = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found: " + invitationId));

        if (!inv.getRecipient().getId().equals(userId)) {
            throw new ResourceNotFoundException("Invitation does not belong to user: " + userId);
        }

        String normalized = action == null ? "" : action.toUpperCase();
        if ("ACCEPT".equals(normalized)) {
            inv.setStatus("ACCEPTED");

            // add participant if not present
            sessionParticipantRepository.findBySessionAndUser(inv.getSession(), inv.getRecipient())
                    .orElseGet(() -> {
                        SessionParticipant sp = SessionParticipant.builder()
                                .session(inv.getSession())
                                .user(inv.getRecipient())
                                .build();
                        return sessionParticipantRepository.save(sp);
                    });

            // notify session creator
            try {
                notificationService.triggerSessionNotification(inv.getSender().getId(), inv.getSession().getId(),
                        inv.getRecipient().getFirstName() + " accepted your invitation to "
                                + inv.getSession().getTitle());
            } catch (Exception e) {
                log.warn("Failed to notify creator after accept: {}", e.getMessage());
            }

        } else if ("DECLINE".equals(normalized)) {
            inv.setStatus("DECLINED");
            // optionally notify sender
            try {
                notificationService.triggerSessionNotification(inv.getSender().getId(), inv.getSession().getId(),
                        inv.getRecipient().getFirstName() + " declined your invitation to "
                                + inv.getSession().getTitle());
            } catch (Exception e) {
                log.warn("Failed to notify creator after decline: {}", e.getMessage());
            }
        } else {
            throw new IllegalArgumentException("Unknown action: " + action);
        }

        return invitationRepository.save(inv);
    }

}
