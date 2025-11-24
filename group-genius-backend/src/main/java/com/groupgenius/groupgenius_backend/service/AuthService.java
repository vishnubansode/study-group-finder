package com.groupgenius.groupgenius_backend.service;

import com.groupgenius.groupgenius_backend.dto.LoginRequest;
import com.groupgenius.groupgenius_backend.dto.LoginResponse;
import com.groupgenius.groupgenius_backend.dto.UserDto;
import com.groupgenius.groupgenius_backend.entity.User;
import com.groupgenius.groupgenius_backend.mapper.UserMapper;
import com.groupgenius.groupgenius_backend.repository.CourseRepository;
import com.groupgenius.groupgenius_backend.repository.UserRepository;
import com.groupgenius.groupgenius_backend.security.JwtUtil;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
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

        // Map DTO to Entity manually to avoid type mismatches
        User user = User.builder()
                .firstName(userDto.getFirstName())
                .lastName(userDto.getLastName())
                .email(userDto.getEmail())
                .password(passwordEncoder.encode(userDto.getPassword()))
                .secondarySchool(userDto.getSecondarySchool())
                .graduationYear(userDto.getGraduationYear())
                .university(userDto.getUniversity())
                .major(userDto.getMajor())
                .currentYear(userDto.getCurrentYear())
                .bio(userDto.getBio())
                .profileImageUrl(profileImageUrl)
                .courses(new HashSet<>())
                .build();

        if (userDto.getSelectedCourseIds() != null) {
            for (Long courseId : userDto.getSelectedCourseIds()) {
                courseRepository.findById(courseId)
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

    public LoginResponse refreshToken(String token) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Authorization token is required");
        }

        boolean expired;
        try {
            expired = jwtUtil.isTokenExpired(token);
        } catch (JwtException | IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid token");
        }

        if (!expired && !jwtUtil.validateToken(token)) {
            throw new IllegalArgumentException("Invalid token");
        }

        String email = jwtUtil.extractUsernameAllowExpired(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String newToken = jwtUtil.generateToken(user.getEmail());

        return LoginResponse.builder()
                .token(newToken)
                .tokenType("Bearer")
                .user(UserMapper.toResponse(user))
                .build();
    }

    public String changePassword(String token, String currentPassword, String newPassword) {
        // Extract email from JWT token
        String email = jwtUtil.extractUsername(token);
        if (email == null) {
            throw new IllegalArgumentException("Invalid token");
        }

        // Find user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        // Validate new password
        if (newPassword == null || newPassword.trim().length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters long");
        }

        // Check if new password is different from current
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new IllegalArgumentException("New password must be different from current password");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Send notification email
        emailService.sendNotificationEmail(
                user.getEmail(),
                "Password Changed Successfully",
                String.format(
                        "Hi %s,\n\nYour password has been successfully changed. If you didn't make this change, please contact support immediately.\n\nBest regards,\nGroupGenius Team",
                        user.getFirstName()));

        return email;
    }
}