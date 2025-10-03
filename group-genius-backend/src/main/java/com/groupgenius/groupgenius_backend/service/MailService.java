package com.groupgenius.groupgenius_backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamSource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${app.contact.to:contact@studygroupfinder.com}")
    private String contactTo;

    public MailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendContactEmail(String name, String fromEmail, String subject, String message, InputStreamSource attachment, String attachmentFilename) throws MessagingException, IOException {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, attachment != null);

        helper.setTo(contactTo);
        helper.setReplyTo(fromEmail);
        helper.setFrom("no-reply@studygroupfinder.com");
        helper.setSubject("[Contact Form] " + subject + " — " + name);

        String html = buildHtmlBody(name, fromEmail, subject, message);
        helper.setText(html, true);

        if (attachment != null && attachmentFilename != null) {
            helper.addAttachment(attachmentFilename, attachment);
        }

        mailSender.send(mimeMessage);
    }

    private String buildHtmlBody(String name, String fromEmail, String subject, String message) {
        StringBuilder sb = new StringBuilder();
        sb.append("<h3>New contact form submission</h3>");
        sb.append("<p><strong>Name:</strong> ").append(escape(name)).append("</p>");
        sb.append("<p><strong>Email:</strong> ").append(escape(fromEmail)).append("</p>");
        sb.append("<p><strong>Subject:</strong> ").append(escape(subject)).append("</p>");
        sb.append("<p><strong>Message:</strong></p>");
        sb.append("<p>").append(escape(message).replaceAll("\n", "<br/>")).append("</p>");
        return sb.toString();
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
