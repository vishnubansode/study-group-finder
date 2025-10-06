package com.groupgenius.groupgenius_backend.controller;

import com.groupgenius.groupgenius_backend.dto.CoursePeersResponse;
import com.groupgenius.groupgenius_backend.dto.CourseResponse;
import com.groupgenius.groupgenius_backend.dto.UserCoursesResponse;
import com.groupgenius.groupgenius_backend.repository.UserRepository;
import com.groupgenius.groupgenius_backend.service.UserCourseService;
import org.springframework.security.core.context.SecurityContextHolder;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user/courses")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class UserCourseController {

    private final UserCourseService userCourseService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<UserCoursesResponse> getUserCourses() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Long userId = userRepository.findByEmail(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"))
                .getId();
        UserCoursesResponse response = userCourseService.getUserCourses(userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{courseId}/enroll")
    public ResponseEntity<CourseResponse> enrollInCourse(@PathVariable Long courseId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Long userId = userRepository.findByEmail(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"))
                .getId();
        CourseResponse response = userCourseService.enrollInCourse(userId, courseId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{courseId}")
    public ResponseEntity<Void> dropCourse(@PathVariable Long courseId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Long userId = userRepository.findByEmail(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"))
                .getId();
        userCourseService.dropCourse(userId, courseId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/peers")
    public ResponseEntity<CoursePeersResponse> getCoursePeers(@RequestParam Long courseId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Long userId = userRepository.findByEmail(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"))
                .getId();
        CoursePeersResponse response = userCourseService.getCoursePeers(userId, courseId);
        return ResponseEntity.ok(response);
    }
}