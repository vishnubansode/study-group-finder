package com.groupgenius.groupgenius_backend.controller;

import com.groupgenius.groupgenius_backend.dto.LoginRequest;
import com.groupgenius.groupgenius_backend.dto.LoginResponse;
import com.groupgenius.groupgenius_backend.dto.UserDto;
import com.groupgenius.groupgenius_backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // Supports both JSON-only and multipart (optional image)
    @PostMapping(value = "/register", consumes = {MediaType.APPLICATION_JSON_VALUE, MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<String> register(
            @RequestPart(value = "user", required = false) UserDto userDto,
            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage,
            @RequestBody(required = false) UserDto userJson
    ) throws IOException {

        UserDto finalUser = (userDto != null) ? userDto : userJson;

        if (finalUser == null) {
            return ResponseEntity.badRequest().body("User data is required");
        }

        String response = authService.register(finalUser, profileImage);
        return ResponseEntity.ok(response);
    }


    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        LoginResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }
}
