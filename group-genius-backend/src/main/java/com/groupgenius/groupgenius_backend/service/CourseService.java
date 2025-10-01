package com.groupgenius.groupgenius_backend.service;

import com.groupgenius.groupgenius_backend.entity.Course;
import com.groupgenius.groupgenius_backend.repository.CourseRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public Course getCourse(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
    }

    @Transactional
    public Course createCourse(Course course) {
        if (courseRepository.existsByCourseCodeIgnoreCase(course.getCourseCode())) {
            throw new IllegalArgumentException("Course code already exists");
        }
        return courseRepository.save(course);
    }
}
