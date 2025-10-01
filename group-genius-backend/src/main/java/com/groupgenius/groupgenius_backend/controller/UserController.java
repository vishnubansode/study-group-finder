package com.groupgenius.groupgenius_backend.controller;

import com.groupgenius.groupgenius_backend.dto.UserDto;
import com.groupgenius.groupgenius_backend.dto.UserResponse;
import com.groupgenius.groupgenius_backend.service.ProfileService;
import com.groupgenius.groupgenius_backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final ProfileService profileService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        return ResponseEntity.ok(profileService.getProfileByEmail(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(profileService.getProfile(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id, @RequestBody UserDto updateRequest) {
        return ResponseEntity.ok(profileService.updateProfile(id, updateRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        profileService.deleteProfile(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/{id}/avatar", consumes = { "multipart/form-data" })
    public ResponseEntity<UserResponse> uploadAvatar(@PathVariable Long id, @RequestParam("avatar") MultipartFile avatar) throws IOException {
        return ResponseEntity.ok(profileService.uploadAvatar(id, avatar));
    }

    @PostMapping("/{userId}/courses/{courseId}")
    public ResponseEntity<UserResponse> addCourse(@PathVariable Long userId, @PathVariable Long courseId) {
        return ResponseEntity.ok(userService.addCourse(userId, courseId));
    }

    @DeleteMapping("/{userId}/courses/{courseId}")
    public ResponseEntity<UserResponse> removeCourse(@PathVariable Long userId, @PathVariable Long courseId) {
        return ResponseEntity.ok(userService.removeCourse(userId, courseId));
    }

    @PutMapping("/{userId}/courses/{courseId}")
    public ResponseEntity<UserResponse> updateCourse(@PathVariable Long userId, @PathVariable Long courseId, @RequestParam("active") boolean active) {
        return ResponseEntity.ok(userService.updateCourseStatus(userId, courseId, active));
    }
}
