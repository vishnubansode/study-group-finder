package com.groupgenius.groupgenius_backend.controller;

import com.groupgenius.groupgenius_backend.dto.CoursePeersResponse;
import com.groupgenius.groupgenius_backend.dto.CourseResponse;
import com.groupgenius.groupgenius_backend.dto.UserCoursesResponse;
import com.groupgenius.groupgenius_backend.service.UserCourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user/courses")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class UserCourseController {

    private final UserCourseService userCourseService;

    @GetMapping
    public ResponseEntity<UserCoursesResponse> getUserCourses(@RequestParam Long userId) {
        UserCoursesResponse response = userCourseService.getUserCourses(userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{courseId}/enroll")
    public ResponseEntity<CourseResponse> enrollInCourse(
            @PathVariable Long courseId,
            @RequestParam Long userId) {
        CourseResponse response = userCourseService.enrollInCourse(userId, courseId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{courseId}")
    public ResponseEntity<Void> dropCourse(
            @PathVariable Long courseId,
            @RequestParam Long userId) {
        userCourseService.dropCourse(userId, courseId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/peers")
    public ResponseEntity<CoursePeersResponse> getCoursePeers(
            @RequestParam Long courseId,
            @RequestParam Long userId) {
        CoursePeersResponse response = userCourseService.getCoursePeers(userId, courseId);
        return ResponseEntity.ok(response);
    }
}