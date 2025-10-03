package com.groupgenius.groupgenius_backend.service;

import com.groupgenius.groupgenius_backend.dto.CoursePeersResponse;
import com.groupgenius.groupgenius_backend.dto.CourseResponse;
import com.groupgenius.groupgenius_backend.dto.UserCoursesResponse;
import com.groupgenius.groupgenius_backend.dto.UserResponse;
import com.groupgenius.groupgenius_backend.entity.Course;
import com.groupgenius.groupgenius_backend.entity.User;
import com.groupgenius.groupgenius_backend.repository.CourseRepository;
import com.groupgenius.groupgenius_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserCourseService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    @Transactional
    public CourseResponse enrollInCourse(Long userId, Long courseId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        
        // Check if already enrolled
        if (user.getCourses().contains(course)) {
            throw new IllegalArgumentException("User is already enrolled in this course");
        }
        
        // Check if course is full
        if (course.isFull()) {
            throw new IllegalArgumentException("Course is full");
        }
        
        // Add course to user and user to course
        user.getCourses().add(course);
        course.getEnrolledUsers().add(user);
        course.setCurrentEnrollment(course.getCurrentEnrollment() + 1);
        
        // Save both entities
        userRepository.save(user);
        courseRepository.save(course);
        
        return mapToCourseResponse(course, true);
    }

    @Transactional
    public void dropCourse(Long userId, Long courseId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        
        // Check if user is enrolled
        if (!user.getCourses().contains(course)) {
            throw new IllegalArgumentException("User is not enrolled in this course");
        }
        
        // Remove course from user and user from course
        user.getCourses().remove(course);
        course.getEnrolledUsers().remove(user);
        course.setCurrentEnrollment(course.getCurrentEnrollment() - 1);
        
        // Save both entities
        userRepository.save(user);
        courseRepository.save(course);
    }

    public UserCoursesResponse getUserCourses(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        List<CourseResponse> enrolledCourses = user.getCourses().stream()
                .map(course -> mapToCourseResponse(course, true))
                .collect(Collectors.toList());
        
        Integer totalCreditHours = user.getCourses().stream()
                .mapToInt(Course::getCreditHours)
                .sum();
        
        Double averageEnrollmentPercentage = user.getCourses().stream()
                .mapToDouble(Course::getEnrollmentPercentage)
                .average()
                .orElse(0.0);
        
        return UserCoursesResponse.builder()
                .enrolledCourses(enrolledCourses)
                .totalCourses(user.getCourses().size())
                .totalCreditHours(totalCreditHours)
                .averageEnrollmentPercentage(averageEnrollmentPercentage)
                .build();
    }

    public CoursePeersResponse getCoursePeers(Long userId, Long courseId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        
        // Check if user is enrolled in the course
        if (!user.getCourses().contains(course)) {
            throw new IllegalArgumentException("User is not enrolled in this course");
        }
        
        List<UserResponse> peers = course.getEnrolledUsers().stream()
                .filter(peer -> !peer.getId().equals(userId)) // Exclude the requesting user
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
        
        return CoursePeersResponse.builder()
                .courseId(course.getId())
                .courseCode(course.getCourseCode())
                .courseName(course.getCourseName())
                .peers(peers)
                .totalPeers(peers.size())
                .build();
    }

    private CourseResponse mapToCourseResponse(Course course, Boolean isEnrolled) {
        return CourseResponse.builder()
                .id(course.getId())
                .courseCode(course.getCourseCode())
                .courseName(course.getCourseName())
                .description(course.getDescription())
                .instructorName(course.getInstructorName())
                .classSchedule(course.getClassSchedule())
                .creditHours(course.getCreditHours())
                .courseCapacity(course.getCourseCapacity())
                .currentEnrollment(course.getCurrentEnrollment())
                .enrollmentPercentage(course.getEnrollmentPercentage())
                .isFull(course.isFull())
                .isEnrolled(isEnrolled)
                .build();
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .profileImageUrl(user.getProfileImageUrl())
                .university(user.getUniversity())
                .major(user.getMajor())
                .currentYear(user.getCurrentYear())
                .build();
    }
}