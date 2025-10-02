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
            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage
    ) throws IOException {

        return ResponseEntity.ok(authService.register(userDto, profileImage));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        LoginResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Email is required"));
            }

            passwordResetService.initiatePasswordReset(email);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Password reset link sent to your email");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
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
}