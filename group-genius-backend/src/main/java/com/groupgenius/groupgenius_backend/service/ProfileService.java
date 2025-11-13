package com.groupgenius.groupgenius_backend.service;

import com.groupgenius.groupgenius_backend.dto.UserDto;
import com.groupgenius.groupgenius_backend.dto.UserResponse;
import com.groupgenius.groupgenius_backend.entity.User;
import com.groupgenius.groupgenius_backend.mapper.UserMapper;
import com.groupgenius.groupgenius_backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final PasswordEncoder passwordEncoder;

    public UserResponse getProfile(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return UserMapper.toResponse(user);
    }

    public UserResponse getProfileByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return UserMapper.toResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(Long id, UserDto updateRequest) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Update ALL profile fields
        user.setFirstName(updateRequest.getFirstName());
        user.setLastName(updateRequest.getLastName());
        user.setEmail(updateRequest.getEmail());
        user.setUniversity(updateRequest.getUniversity());
        user.setMajor(updateRequest.getMajor());
        user.setCurrentYear(updateRequest.getCurrentYear());
        user.setSecondarySchool(updateRequest.getSecondarySchool());
        user.setGraduationYear(updateRequest.getGraduationYear());
        user.setBio(updateRequest.getBio()); // Add this line

        User savedUser = userRepository.save(user);
        return UserMapper.toResponse(savedUser);
    }

    @Transactional
    public void deleteProfile(Long id) {
        if (!userRepository.existsById(id)) {
            throw new IllegalArgumentException("User not found");
        }
        userRepository.deleteById(id);
    }

    @Transactional
    public UserResponse uploadAvatar(Long id, MultipartFile avatar) throws IOException {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String imageUrl = fileStorageService.storeFile(avatar);
        user.setProfileImageUrl(imageUrl);
        User saved = userRepository.save(user);
        return UserMapper.toResponse(saved);
    }
}
