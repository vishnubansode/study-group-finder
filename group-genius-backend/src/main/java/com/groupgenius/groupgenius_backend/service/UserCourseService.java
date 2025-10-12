package com.groupgenius.groupgenius_backend.service;

import com.groupgenius.groupgenius_backend.dto.*;
import com.groupgenius.groupgenius_backend.entity.Course;
import com.groupgenius.groupgenius_backend.entity.User;
import com.groupgenius.groupgenius_backend.repository.CourseRepository;
import com.groupgenius.groupgenius_backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserCourseService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    public List<CourseResponse> getUserCourses(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return user.getCourses().stream()
                .map(course -> mapToCourseResponse(course, userId))
                .collect(Collectors.toList());
    }

    @Transactional
    public void enrollInCourse(Long userId, Long courseId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        if (user.getCourses().contains(course)) {
            throw new IllegalArgumentException("User is already enrolled in this course");
        }

                // add relation
                user.getCourses().add(course);
                userRepository.save(user);

                // increment and persist course enrollment count
                Integer curr = course.getCurrentEnrollment();
                if (curr == null) curr = 0;
                course.setCurrentEnrollment(curr + 1);
                courseRepository.save(course);
    }

    @Transactional
    public void dropCourse(Long userId, Long courseId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        if (!user.getCourses().contains(course)) {
            throw new IllegalArgumentException("User is not enrolled in this course");
        }

                // remove relation
                user.getCourses().remove(course);
                userRepository.save(user);

                // decrement and persist course enrollment count (never below 0)
                Integer curr = course.getCurrentEnrollment();
                if (curr == null) curr = 0;
                course.setCurrentEnrollment(Math.max(0, curr - 1));
                courseRepository.save(course);
    }

    public CoursePeersResponse findCoursePeers(Long courseId, Long userId) {
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        List<UserResponse> peers = course.getEnrolledUsers().stream()
                .filter(peer -> !peer.getId().equals(userId)) // Exclude current user
                .map(peer -> mapToUserResponse(currentUser, peer)) // Pass both users
                .collect(Collectors.toList());

        return CoursePeersResponse.builder()
                .courseId(courseId)
                .courseCode(course.getCourseCode())
                .courseName(course.getCourseName())
                .peers(peers)
                .totalPeers(peers.size())
                .build();
    }

    public UserDashboardResponse getUserDashboard(Long userId) {
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Get enrolled courses
        List<CourseResponse> enrolledCourses = currentUser.getCourses().stream()
                .map(course -> mapToCourseResponse(course, userId))
                .collect(Collectors.toList());

        // Get suggested peers (users in same courses)
        List<UserResponse> suggestedPeers = currentUser.getCourses().stream()
                .flatMap(course -> course.getEnrolledUsers().stream())
                .filter(peer -> !peer.getId().equals(userId))
                .distinct()
                .limit(10) // Limit to 10 suggested peers
                .map(peer -> mapToUserResponse(currentUser, peer)) // Pass both users
                .collect(Collectors.toList());

        return UserDashboardResponse.builder()
                .userId(userId)
                .userName(currentUser.getFirstName() + " " + currentUser.getLastName())
                .enrolledCourses(enrolledCourses)
                .suggestedPeers(suggestedPeers)
                .totalCourses(enrolledCourses.size())
                .totalPeers(suggestedPeers.size())
                .build();
    }

    private CourseResponse mapToCourseResponse(Course course, Long userId) {
        return CourseResponse.builder()
                .id(course.getId())
                .courseCode(course.getCourseCode())
                .courseName(course.getCourseName())
                .description(course.getDescription())
                .currentEnrollment(course.getCurrentEnrollment())
                .isEnrolled(true) // Always true for user's courses
                .build();
    }

    private UserResponse mapToUserResponse(User currentUser, User peer) {
        return UserResponse.builder()
                .id(peer.getId())
                .firstName(peer.getFirstName())
                .lastName(peer.getLastName())
                .email(peer.getEmail())
                .profileImageUrl(peer.getProfileImageUrl())
                .secondarySchool(peer.getSecondarySchool())
                .graduationYear(peer.getGraduationYear())
                .university(peer.getUniversity())
                .major(peer.getMajor())
                .currentYear(peer.getCurrentYear())
                .bio(peer.getBio())
                .commonCourses(getCommonCoursesCount(currentUser, peer))
                .build();
    }

    private Integer getCommonCoursesCount(User currentUser, User peer) {
        if (currentUser == null || peer == null || currentUser.getCourses() == null || peer.getCourses() == null) {
            return 0;
        }

        return (int) currentUser.getCourses().stream()
                .filter(course -> peer.getCourses().contains(course))
                .count();
    }
}