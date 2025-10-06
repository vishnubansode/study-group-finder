package com.groupgenius.groupgenius_backend.controller;

import com.groupgenius.groupgenius_backend.dto.CourseResponse;
import com.groupgenius.groupgenius_backend.dto.CoursePeersResponse;
import com.groupgenius.groupgenius_backend.dto.UserDashboardResponse;
import com.groupgenius.groupgenius_backend.service.UserCourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user/courses")
@RequiredArgsConstructor
public class UserCourseController {

    private final UserCourseService userCourseService;

    @GetMapping
    public ResponseEntity<List<CourseResponse>> getUserCourses(@RequestParam Long userId) {
        List<CourseResponse> courses = userCourseService.getUserCourses(userId);
        return ResponseEntity.ok(courses);
    }

    @PostMapping("/{courseId}/enroll")
    public ResponseEntity<String> enrollInCourse(
            @PathVariable Long courseId,
            @RequestParam Long userId) {
        userCourseService.enrollInCourse(userId, courseId);
        return ResponseEntity.ok("Successfully enrolled in course");
    }

    @DeleteMapping("/{courseId}")
    public ResponseEntity<String> dropCourse(
            @PathVariable Long courseId,
            @RequestParam Long userId) {
        userCourseService.dropCourse(userId, courseId);
        return ResponseEntity.ok("Successfully dropped course");
    }

    @GetMapping("/peers")
    public ResponseEntity<CoursePeersResponse> findCoursePeers(
            @RequestParam Long courseId,
            @RequestParam Long userId) {
        CoursePeersResponse peers = userCourseService.findCoursePeers(courseId, userId);
        return ResponseEntity.ok(peers);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<UserDashboardResponse> getUserDashboard(@RequestParam Long userId) {
        UserDashboardResponse dashboard = userCourseService.getUserDashboard(userId);
        return ResponseEntity.ok(dashboard);
    }
}