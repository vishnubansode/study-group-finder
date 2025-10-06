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
        if (courseRepository.existsByCourseNameIgnoreCase(request.getCourseName())) {
            throw new IllegalArgumentException("Course name already exists");
        }
        
    Course course = Course.builder()
        .courseName(request.getCourseName())
        .description(request.getDescription())
        .courseCapacity(request.getCourseCapacity())
        .currentEnrollment(0)
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
        .courseName(course.getCourseName())
        .description(course.getDescription())
        .courseCapacity(course.getCourseCapacity())
        .currentEnrollment(course.getCurrentEnrollment())
        .enrollmentPercentage(course.getEnrollmentPercentage())
        .isFull(course.isFull())
        .isEnrolled(isEnrolled)
        .build();
    }
}
