package com.groupgenius.groupgenius_backend.service;

import com.groupgenius.groupgenius_backend.dto.LoginRequest;
import com.groupgenius.groupgenius_backend.dto.LoginResponse;
import com.groupgenius.groupgenius_backend.dto.UserDto;
import com.groupgenius.groupgenius_backend.entity.User;
import com.groupgenius.groupgenius_backend.repository.UserRepository;
import com.groupgenius.groupgenius_backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final ModelMapper modelMapper;

    // ================= Registration =================
    public String register(UserDto userDto, MultipartFile profileImage) throws IOException {

        // Check if email already exists
        if (userRepository.existsByEmail(userDto.getEmail())) {
            throw new IllegalArgumentException("Email is already taken");
        }

        // Handle profile image upload (optional)
        String profileImageUrl = null;
        if (profileImage != null && !profileImage.isEmpty()) {
            String fileName = System.currentTimeMillis() + "_" + profileImage.getOriginalFilename();
            Path uploadPath = Paths.get("uploads").toAbsolutePath().normalize();
            Files.createDirectories(uploadPath); // Ensure folder exists
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(profileImage.getInputStream(), filePath);
            profileImageUrl = "/uploads/" + fileName; // Relative path to return
        }

        // Map DTO to Entity
        User user = modelMapper.map(userDto, User.class);
        user.setPassword(passwordEncoder.encode(userDto.getPassword()));
        user.setProfileImageUrl(profileImageUrl); // This will be null if no file uploaded

        // Set selected courses if provided
        if (userDto.getSelectedCourses() != null) {
            user.setSelectedCourses(userDto.getSelectedCourses());
        }

        // Save user
        userRepository.save(user);

        return "User registered successfully";
    }

    // ================= Login =================
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getEmail());

        return LoginResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .build();

    }
}

