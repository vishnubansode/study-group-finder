package com.groupgenius.groupgenius_backend.service;

import com.groupgenius.groupgenius_backend.dto.CourseCreateRequest;
import com.groupgenius.groupgenius_backend.dto.CourseResponse;
import com.groupgenius.groupgenius_backend.entity.Course;
import com.groupgenius.groupgenius_backend.entity.User;
import com.groupgenius.groupgenius_backend.repository.CourseRepository;
import com.groupgenius.groupgenius_backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public Page<CourseResponse> getAllCourses(int page, int size, String sortBy, String sortDirection, Long userId) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Course> coursePage = courseRepository.findAll(pageable);
        return coursePage.map(course -> mapToCourseResponse(course, userId));
    }

    public Page<CourseResponse> searchCourses(String query, int page, int size, Long userId) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("courseName"));
        Page<Course> coursePage = courseRepository.searchCourses(query, pageable);
        return coursePage.map(course -> mapToCourseResponse(course, userId));
    }

    public CourseResponse getCourse(Long id, Long userId) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        return mapToCourseResponse(course, userId);
    }

    @Transactional
    public CourseResponse createCourse(CourseCreateRequest request) {
        if (courseRepository.existsByCourseCodeIgnoreCase(request.getCourseCode())) {
            throw new IllegalArgumentException("Course code already exists");
        }

        Course course = Course.builder()
                .courseCode(request.getCourseCode())
                .courseName(request.getCourseName())
                .description(request.getDescription())
                .build();

        Course savedCourse = courseRepository.save(course);
        return mapToCourseResponse(savedCourse, null);
    }

    private CourseResponse mapToCourseResponse(Course course, Long userId) {
        Boolean isEnrolled = false;

        if (userId != null) {
            User user = userRepository.findById(userId).orElse(null);
            if (user != null) {
                isEnrolled = user.getCourses().contains(course);
            }
        }

        return CourseResponse.builder()
                .id(course.getId())
                .courseCode(course.getCourseCode())
                .courseName(course.getCourseName())
                .description(course.getDescription())
                .currentEnrollment(course.getCurrentEnrollment())
                .isEnrolled(isEnrolled)
                .build();
    }
}