package com.groupgenius.groupgenius_backend.service;

import com.groupgenius.groupgenius_backend.entity.PasswordResetToken;
import com.groupgenius.groupgenius_backend.entity.User;
import com.groupgenius.groupgenius_backend.repository.PasswordResetTokenRepository;
import com.groupgenius.groupgenius_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {

    private final PasswordResetTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom = new SecureRandom();

    @Async
    @Transactional
    public void initiatePasswordReset(String email) {
        log.info("Initiating password reset for email: {}", email);
        
        // Find user by email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        
        // Invalidate any existing tokens for this user
        tokenRepository.deleteAllByUser(user);
        
        // Generate secure token
        String token = generateSecureToken();
        
        // Create and save password reset token
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiresAt(LocalDateTime.now().plusHours(1)) // Token expires in 1 hour
                .used(false)
                .build();
        
        tokenRepository.save(resetToken);
        log.info("Password reset token generated for user: {}", email);
        
        // Send password reset email
        emailService.sendPasswordResetEmail(email, token);
        log.info("Password reset email sent to: {}", email);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        log.info("Processing password reset for token: {}", token.substring(0, Math.min(token.length(), 8)) + "...");
        
        // Find the token
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid password reset token"));
        
        // Validate token
        if (!resetToken.isValid()) {
            throw new RuntimeException("Password reset token has expired or been used");
        }
        
        // Validate password
        if (newPassword == null || newPassword.trim().length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters long");
        }
        
        // Update user password
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        // Mark token as used
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
        
        log.info("Password successfully reset for user: {}", user.getEmail());
        
        // Send confirmation email (optional)
        emailService.sendNotificationEmail(
                user.getEmail(),
                "Password Reset Successful",
                "Your GroupGenius password has been successfully reset. If you didn't make this change, please contact our support team immediately."
        );
    }

    public boolean isValidToken(String token) {
        return tokenRepository.findByToken(token)
                .map(PasswordResetToken::isValid)
                .orElse(false);
    }

    @Transactional
    public void cleanupExpiredTokens() {
        log.info("Cleaning up expired password reset tokens");
        int deletedCount = tokenRepository.deleteAllByExpiresAtBefore(LocalDateTime.now());
        log.info("Deleted {} expired password reset tokens", deletedCount);
    }

    public List<PasswordResetToken> getAllTokens() {
        return tokenRepository.findAllByExpiresAtAfter(LocalDateTime.now().minusHours(1));
    }

    private String generateSecureToken() {
        byte[] tokenBytes = new byte[32]; // 256 bits
        secureRandom.nextBytes(tokenBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
    }
}