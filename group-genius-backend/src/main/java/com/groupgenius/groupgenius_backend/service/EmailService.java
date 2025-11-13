package com.groupgenius.groupgenius_backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamSource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Value("${spring.mail.username:groupgeniusweb@gmail.com}")
    private String fromEmail;

    @Value("${app.email.enabled:false}")
    private boolean emailEnabled;

    @Value("${app.contact.to:}")
    private String contactTo;

    @Async
    public CompletableFuture<Void> sendPasswordResetEmail(String userEmail, String resetToken) {
        try {
            String resetLink = frontendUrl + "/reset-password?token=" + resetToken;

            if (!emailEnabled) {
                // Development mode - log to console
                log.info("===========================================");
                log.info("PASSWORD RESET EMAIL (Development Mode)");
                log.info("===========================================");
                log.info("To: {}", userEmail);
                log.info("Subject: Reset Your GroupGenius Password");
                log.info("");
                log.info("Dear User,");
                log.info("");
                log.info("You have requested to reset your password for GroupGenius.");
                log.info("Click the link below to reset your password:");
                log.info("");
                log.info("Reset Link: {}", resetLink);
                log.info("");
                log.info("This link will expire in 1 hour for security reasons.");
                log.info("If you didn't request this, please ignore this email.");
                log.info("");
                log.info("Best regards,");
                log.info("GroupGenius Team");
                log.info("===========================================");
                return CompletableFuture.completedFuture(null);
            }

            // Production mode - send real email
            sendHtmlEmail(userEmail, "Reset Your GroupGenius Password", createPasswordResetEmail(userEmail, resetLink));
            log.info("Password reset email sent successfully to: {}", userEmail);

        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", userEmail, e);
            throw new RuntimeException("Failed to send password reset email", e);
        }

        return CompletableFuture.completedFuture(null);
    }

    @Async
    public CompletableFuture<Void> sendWelcomeEmail(String userEmail, String firstName) {
        try {
            if (!emailEnabled) {
                // Development mode - log to console
                log.info("===========================================");
                log.info("WELCOME EMAIL (Development Mode)");
                log.info("===========================================");
                log.info("To: {}", userEmail);
                log.info("Subject: Welcome to GroupGenius!");
                log.info("");
                log.info("Hi {},", firstName);
                log.info("");
                log.info("Welcome to GroupGenius! We're excited to have you join our community.");
                log.info("You can now:");
                log.info("- Find and join study groups");
                log.info("- Connect with fellow students");
                log.info("- Collaborate on academic projects");
                log.info("");
                log.info("Get started: {}/dashboard", frontendUrl);
                log.info("");
                log.info("Happy studying!");
                log.info("GroupGenius Team");
                log.info("===========================================");
                return CompletableFuture.completedFuture(null);
            }

            // Production mode - send real email
            sendHtmlEmail(userEmail, "Welcome to GroupGenius!", createWelcomeEmail(firstName));
            log.info("Welcome email sent successfully to: {}", userEmail);

        } catch (Exception e) {
            log.error("Failed to send welcome email to: {}", userEmail, e);
            // Don't throw exception for welcome email failures
        }

        return CompletableFuture.completedFuture(null);
    }

    @Async
    public CompletableFuture<Void> sendContactEmail(
            String senderName,
            String senderEmail,
            String queryType,
            String subject,
            String message,
            InputStreamSource attachment,
            String attachmentFilename) {
        try {
            String safeName = senderName == null || senderName.isBlank() ? "Guest" : senderName.trim();
            String safeEmail = senderEmail == null || senderEmail.isBlank() ? fromEmail : senderEmail.trim();
            String safeQueryType = queryType == null || queryType.isBlank() ? "General" : queryType.trim();
            String safeSubject = subject == null || subject.isBlank() ? "No subject provided" : subject.trim();
            String safeMessage = message == null ? "" : message.trim();

            String fullSubject = "[Contact Form] " + safeSubject + " (" + safeQueryType + ")";
            String formattedMessage = safeMessage.replaceAll("\\r?\\n", "<br/>");
            boolean hasAttachment = attachment != null && attachmentFilename != null && !attachmentFilename.isBlank();

            if (!emailEnabled) {
                // Development mode - log to console
                log.info("===========================================");
                log.info("CONTACT EMAIL (Development Mode)");
                log.info("===========================================");
                log.info("To: {}", getContactToAddress());
                log.info("Subject: {}", fullSubject);
                log.info("");
                log.info("From: {} <{}>", safeName, safeEmail);
                log.info("");
                log.info("Message:\n{}", safeMessage);
                if (hasAttachment) {
                    log.info("Attachment: {}", attachmentFilename);
                }
                log.info("");
                log.info("Submitted At: {}", LocalDateTime.now());
                log.info("");
                log.info("GroupGenius Team");
                log.info("===========================================");
                return CompletableFuture.completedFuture(null);
            }

            Context context = new Context();
            context.setVariable("name", safeName);
            context.setVariable("email", safeEmail);
            context.setVariable("queryType", safeQueryType);
            context.setVariable("subject", safeSubject);
            context.setVariable("message", formattedMessage);
            context.setVariable("submittedAt",
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM d, yyyy h:mm a")));
            context.setVariable("hasAttachment", hasAttachment);
            context.setVariable("attachmentName", hasAttachment ? attachmentFilename : "");

            String html = templateEngine.process("contact-email", context);

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, hasAttachment, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(getContactToAddress());
            helper.setReplyTo(safeEmail);
            helper.setSubject(fullSubject);
            helper.setText(html, true);

            if (hasAttachment) {
                helper.addAttachment(attachmentFilename, attachment);
            }

            mailSender.send(mimeMessage);

            log.info("Contact email sent successfully from: {} <{}> (attachment: {})", safeName, safeEmail,
                    hasAttachment ? attachmentFilename : "none");
        } catch (Exception e) {
            log.error("Failed to send contact email from: {} <{}>", senderName, senderEmail, e);
            throw new RuntimeException("Failed to send contact email", e);
        }

        return CompletableFuture.completedFuture(null);
    }

    private String getContactToAddress() {
        return contactTo != null && !contactTo.isBlank() ? contactTo : fromEmail;
    }

    @Async
    public CompletableFuture<Void> sendNotificationEmail(String userEmail, String subject, String message) {
        try {
            if (!emailEnabled) {
                // Development mode - log to console
                log.info("===========================================");
                log.info("NOTIFICATION EMAIL (Development Mode)");
                log.info("===========================================");
                log.info("To: {}", userEmail);
                log.info("Subject: {}", subject);
                log.info("");
                log.info("{}", message);
                log.info("");
                log.info("GroupGenius Team");
                log.info("===========================================");
                return CompletableFuture.completedFuture(null);
            }

            // Production mode - send real email
            sendSimpleEmail(userEmail, subject, message);
            log.info("Notification email sent successfully to: {}", userEmail);

        } catch (Exception e) {
            log.error("Failed to send notification email to: {}", userEmail, e);
            // Don't throw exception for notification email failures
        }

        return CompletableFuture.completedFuture(null);
    }

    private void sendSimpleEmail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);

        mailSender.send(message);
    }

    private String createPasswordResetEmail(String userEmail, String resetLink) {
        Context context = new Context();
        context.setVariable("userEmail", userEmail);
        context.setVariable("resetLink", resetLink);
        context.setVariable("frontendUrl", frontendUrl);

        return templateEngine.process("password-reset-email", context);
    }

    private String createWelcomeEmail(String firstName) {
        Context context = new Context();
        context.setVariable("firstName", firstName);
        context.setVariable("dashboardUrl", frontendUrl + "/dashboard");

        return templateEngine.process("welcome-email", context);
    }

    @Async
    public CompletableFuture<Void> sendInvitationEmail(
            String userEmail,
            Long invitationId,
            Long groupId,
            String message,
            String sessionTitle,
            String groupName,
            String startTime,
            String location,
            String description) {
        try {
            String acceptLink = String.format("%s/groups/%d?invitation=%d&action=accept",
                    frontendUrl, groupId, invitationId);
            String declineLink = String.format("%s/groups/%d?invitation=%d&action=decline",
                    frontendUrl, groupId, invitationId);
            if (!emailEnabled) {
                // Development mode - log to console
                log.info("===========================================");
                log.info("SESSION INVITATION EMAIL (Development Mode)");
                log.info("===========================================");
                log.info("To: {}", userEmail);
                log.info("Subject: Session Invitation: {}", sessionTitle);
                log.info("");
                log.info("{}", message);
                log.info("");
                log.info("📋 Session Details:");
                log.info("Title: {}", sessionTitle);
                log.info("Group: {}", groupName);
                log.info("Start Time: {}", startTime);
                if (location != null && !location.isEmpty()) {
                    log.info("Location: {}", location);
                }
                if (description != null && !description.isEmpty()) {
                    log.info("Description: {}", description);
                }
                log.info("");
                log.info("Accept: {}", acceptLink);
                log.info("Decline: {}", declineLink);
                log.info("");
                log.info("We look forward to seeing you there!");
                log.info("GroupGenius Team");
                log.info("===========================================");
                return CompletableFuture.completedFuture(null);
            }

            // Production mode - send real email with HTML template
            String htmlContent = createInvitationEmail(
                    message, sessionTitle, groupName, startTime,
                    location, description, acceptLink, declineLink);
            sendHtmlEmail(userEmail, "Session Invitation: " + sessionTitle, htmlContent);
            log.info("Invitation email sent successfully to: {}", userEmail);

        } catch (Exception e) {
            log.error("Failed to send invitation email to: {}", userEmail, e);
            // Don't throw exception for invitation email failures
        }

        return CompletableFuture.completedFuture(null);
    }

    private String createInvitationEmail(
            String message,
            String sessionTitle,
            String groupName,
            String startTime,
            String location,
            String description,
            String acceptLink,
            String declineLink) {
        Context context = new Context();
        context.setVariable("message", message);
        context.setVariable("sessionTitle", sessionTitle);
        context.setVariable("groupName", groupName);
        context.setVariable("startTime", startTime);
        context.setVariable("location", location);
        context.setVariable("description", description);
        context.setVariable("acceptLink", acceptLink);
        context.setVariable("declineLink", declineLink);

        return templateEngine.process("session-invitation-email", context);
    }
}