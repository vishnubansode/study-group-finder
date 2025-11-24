package com.groupgenius.groupgenius_backend.controller;

import com.groupgenius.groupgenius_backend.dto.LoginRequest;
import com.groupgenius.groupgenius_backend.dto.LoginResponse;
import com.groupgenius.groupgenius_backend.dto.UserDto;
import com.groupgenius.groupgenius_backend.entity.PasswordResetToken;
import com.groupgenius.groupgenius_backend.service.AuthService;
import com.groupgenius.groupgenius_backend.service.PasswordResetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<LoginResponse> register(
            @RequestPart("user") UserDto userDto,
            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage) throws IOException {

        return ResponseEntity.ok(authService.register(userDto, profileImage));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        LoginResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (!StringUtils.hasText(authHeader) || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Authorization header with Bearer token is required"));
            }

            String token = authHeader.substring(7);
            LoginResponse response = authService.refreshToken(token);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Unable to refresh token right now"));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Email is required"));
            }

            passwordResetService.initiatePasswordReset(email.trim());

            Map<String, String> response = new HashMap<>();
            response.put("message", "Password reset link sent to your email");
            response.put("email", email.trim());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // Handle user not found specifically
            if (e.getMessage().contains("User not found")) {
                return ResponseEntity.status(404)
                        .body(Map.of("error", "No account found with this email address"));
            }
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Internal server error. Please try again later."));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String token = request.get("token");
            String newPassword = request.get("password");

            if (token == null || newPassword == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Token and password are required"));
            }

            passwordResetService.resetPassword(token, newPassword);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Password reset successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/debug/reset-tokens")
    public ResponseEntity<Map<String, Object>> getResetTokens() {
        List<PasswordResetToken> tokens = passwordResetService.getAllTokens();

        Map<String, Object> debug = new HashMap<>();
        debug.put("totalTokens", tokens.size());
        debug.put("tokens", tokens.stream().map(token -> {
            Map<String, Object> tokenInfo = new HashMap<>();
            tokenInfo.put("token", token.getToken());
            tokenInfo.put("email", token.getUser().getEmail());
            tokenInfo.put("expiryDate", token.getExpiresAt());
            tokenInfo.put("used", token.getUsed());
            tokenInfo.put("resetLink", "http://localhost:3000/reset-password?token=" + token.getToken());
            return tokenInfo;
        }).toList());

        return ResponseEntity.ok(debug);
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> request) {
        try {
            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");

            if (currentPassword == null || newPassword == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Current password and new password are required"));
            }

            // Extract email from JWT token
            String token = authHeader.replace("Bearer ", "");
            String email = authService.changePassword(token, currentPassword, newPassword);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Password changed successfully");
            response.put("email", email);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            if (e.getMessage().contains("Current password is incorrect")) {
                return ResponseEntity.status(401)
                        .body(Map.of("error", "Current password is incorrect"));
            } else if (e.getMessage().contains("Invalid token") || e.getMessage().contains("User not found")) {
                return ResponseEntity.status(401)
                        .body(Map.of("error", "Invalid authentication token"));
            }
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Internal server error. Please try again later."));
        }
    }
}