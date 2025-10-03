package com.groupgenius.groupgenius_backend.controller;

import com.groupgenius.groupgenius_backend.service.EmailService;
import jakarta.mail.MessagingException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final EmailService emailService;

    public ContactController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping
    public ResponseEntity<?> handleContact(
            @RequestParam String name,
            @RequestParam String email,
            @RequestParam String queryType,
            @RequestParam String subject,
            @RequestParam String message,
            @RequestParam(required = false) MultipartFile attachment
    ) {
        try {
            // Use EmailService which handles dev logging and template rendering
        emailService.sendContactEmail(
            name,
            email,
            queryType,
            subject,
            message,
            attachment != null && !attachment.isEmpty() ? attachment::getInputStream : null,
            attachment != null && !attachment.isEmpty() ? attachment.getOriginalFilename() : null
        );
            return ResponseEntity.ok().body("Message sent");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to send message");
        }
    }
}
