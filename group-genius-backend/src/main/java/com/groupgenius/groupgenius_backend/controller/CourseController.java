package com.groupgenius.groupgenius_backend.controller;

import com.groupgenius.groupgenius_backend.dto.CourseResponse;
import com.groupgenius.groupgenius_backend.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    public ResponseEntity<List<CourseResponse>> getCourses() {
        return ResponseEntity.ok(
                courseService.getAllCourses().stream()
                        .map(course -> CourseResponse.builder()
                                .id(course.getId())
                                .courseCode(course.getCourseCode())
                                .courseName(course.getCourseName())
                                .description(course.getDescription())
                                .build())
                        .collect(Collectors.toList())
        );
    }
}
