package com.groupgenius.groupgenius_backend.service;

import com.groupgenius.groupgenius_backend.dto.LoginRequest;
import com.groupgenius.groupgenius_backend.dto.LoginResponse;
import com.groupgenius.groupgenius_backend.dto.UserDto;
import com.groupgenius.groupgenius_backend.entity.User;
import com.groupgenius.groupgenius_backend.mapper.UserMapper;
import com.groupgenius.groupgenius_backend.repository.CourseRepository;
import com.groupgenius.groupgenius_backend.repository.UserRepository;
import com.groupgenius.groupgenius_backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashSet;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final ModelMapper modelMapper;
    private final FileStorageService fileStorageService;
    private final CourseRepository courseRepository;
    private final EmailService emailService;

    public LoginResponse register(UserDto userDto, MultipartFile profileImage) throws IOException {
        // Check if email already exists
        if (userRepository.existsByEmail(userDto.getEmail())) {
            throw new IllegalArgumentException("Email is already taken");
        }

        // Handle profile image upload (optional)
        String profileImageUrl = null;
        if (profileImage != null && !profileImage.isEmpty()) {
            profileImageUrl = fileStorageService.storeFile(profileImage);
        }

        // Map DTO to Entity
        User user = modelMapper.map(userDto, User.class);
        user.setCourses(new HashSet<>());
        user.setPassword(passwordEncoder.encode(userDto.getPassword()));
        user.setProfileImageUrl(profileImageUrl);

        if (userDto.getSelectedCourses() != null) {
            for (String courseCode : userDto.getSelectedCourses()) {
                courseRepository.findByCourseCodeIgnoreCase(courseCode)
                        .ifPresent(user.getCourses()::add);
            }
        }

    userRepository.save(user);

    // Send welcome email asynchronously
    emailService.sendWelcomeEmail(user.getEmail(), user.getFirstName());

    String token = jwtUtil.generateToken(user.getEmail());
    return LoginResponse.builder()
        .token(token)
        .tokenType("Bearer")
        .user(UserMapper.toResponse(user))
        .build();
    }

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
                .user(UserMapper.toResponse(user))
                .build();
    }
}