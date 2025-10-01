package com.groupgenius.groupgenius_backend.controller;

import com.groupgenius.groupgenius_backend.entity.Course;
import com.groupgenius.groupgenius_backend.entity.User;
import com.groupgenius.groupgenius_backend.repository.UserRepository;
import com.groupgenius.groupgenius_backend.security.JwtUtil;
import com.groupgenius.groupgenius_backend.service.ProfileService;
import com.groupgenius.groupgenius_backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UserService userService;
    @Autowired
    private ProfileService profileService;

    // ✅ Protected endpoint
    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(@RequestHeader("Authorization") String token) {
        // Extract JWT token without "Bearer "
        String jwt = token.replace("Bearer ", "");

        String email = jwtUtil.extractUsername(jwt);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(user);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        return userService.getUser(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User updated) {
        return ResponseEntity.ok(userService.updateUser(id, updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/avatar")
    public ResponseEntity<String> uploadAvatar(@PathVariable Long id, @RequestParam("file") MultipartFile file) throws IOException {
        String filename = profileService.uploadAvatar(id, file);
        return ResponseEntity.ok(filename);
    }

    @PostMapping("/{id}/courses/{courseId}")
    public ResponseEntity<User> addCourse(@PathVariable Long id, @PathVariable Long courseId) {
        return ResponseEntity.ok(userService.addCourse(id, courseId));
    }

    @DeleteMapping("/{id}/courses/{courseId}")
    public ResponseEntity<User> removeCourse(@PathVariable Long id, @PathVariable Long courseId) {
        return ResponseEntity.ok(userService.removeCourse(id, courseId));
    }

    @PutMapping("/{id}/courses/{courseId}")
    public ResponseEntity<User> updateCourse(@PathVariable Long id, @PathVariable Long courseId, @RequestBody Course updatedCourse) {
        return ResponseEntity.ok(userService.updateCourse(id, courseId, updatedCourse));
    }
}
