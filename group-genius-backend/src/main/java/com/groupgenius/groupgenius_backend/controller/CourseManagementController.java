package com.groupgenius.groupgenius_backend.controller;

import com.groupgenius.groupgenius_backend.dto.CourseResponse;
import com.groupgenius.groupgenius_backend.entity.Course;
import com.groupgenius.groupgenius_backend.entity.User;
import com.groupgenius.groupgenius_backend.repository.CourseRepository;
import com.groupgenius.groupgenius_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/course-management")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class CourseManagementController {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    @PostMapping("/courses")
    public ResponseEntity<CourseResponse> createCourse(@RequestBody Map<String, String> courseData) {
        String courseCode = courseData.get("courseCode");
        String courseName = courseData.get("courseName");
        String description = courseData.get("description");

        // Check if course already exists
        if (courseRepository.findByCourseCode(courseCode).isPresent()) {
            return ResponseEntity.badRequest().build();
        }

        Course course = Course.builder()
                .courseCode(courseCode)
                .courseName(courseName)
                .description(description)
                .build();

        Course savedCourse = courseRepository.save(course);
        
        CourseResponse response = CourseResponse.builder()
                .id(savedCourse.getId())
                .courseCode(savedCourse.getCourseCode())
                .courseName(savedCourse.getCourseName())
                .description(savedCourse.getDescription())
                .isEnrolled(false)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/courses")
    public ResponseEntity<List<CourseResponse>> getAllCourses() {
        List<Course> courses = courseRepository.findAll();
        
        List<CourseResponse> courseResponses = courses.stream()
                .map(course -> CourseResponse.builder()
                        .id(course.getId())
                        .courseCode(course.getCourseCode())
                        .courseName(course.getCourseName())
                        .description(course.getDescription())
                        .isEnrolled(false)
                        .build())
                .toList();

        return ResponseEntity.ok(courseResponses);
    }

    @PostMapping("/enroll")
    public ResponseEntity<String> enrollUserInCourse(@RequestParam Long userId, @RequestParam Long courseId) {
        var user = userRepository.findById(userId);
        var course = courseRepository.findById(courseId);
        
        if (user.isEmpty() || course.isEmpty()) {
            return ResponseEntity.badRequest().body("User or course not found");
        }
        
        // Check if already enrolled
        if (user.get().getCourses().contains(course.get())) {
            return ResponseEntity.badRequest().body("Already enrolled in this course");
        }
        
        user.get().getCourses().add(course.get());
        userRepository.save(user.get());
        
        return ResponseEntity.ok("Successfully enrolled in course");
    }
}
