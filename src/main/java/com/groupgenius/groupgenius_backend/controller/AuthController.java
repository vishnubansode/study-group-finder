package com.groupgenius.groupgenius_backend.controller;

import com.groupgenius.groupgenius_backend.dto.LoginRequest;
import com.groupgenius.groupgenius_backend.dto.LoginResponse;
import com.groupgenius.groupgenius_backend.dto.UserDto;
import com.groupgenius.groupgenius_backend.entity.User;
import com.groupgenius.groupgenius_backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> register(
            @RequestPart("user") UserDto userDto,
            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage
    ) throws IOException {

        User registeredUser = authService.register(userDto, profileImage);

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("message", "User registered successfully");
        responseBody.put("status", "success");
        responseBody.put("user", registeredUser);
        responseBody.put("email", registeredUser.getEmail());

        return ResponseEntity.ok(responseBody);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        LoginResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }
}