package com.groupgenius.groupgenius_backend.mapper;

import com.groupgenius.groupgenius_backend.dto.CourseResponse;
import com.groupgenius.groupgenius_backend.dto.UserResponse;
import com.groupgenius.groupgenius_backend.entity.Course;
import com.groupgenius.groupgenius_backend.entity.User;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public final class UserMapper {

    private UserMapper() {
    }

    public static UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .profileImageUrl(user.getProfileImageUrl())
                .secondarySchool(user.getSecondarySchool())
                .graduationYear(user.getGraduationYear())
                .university(user.getUniversity())
                .major(user.getMajor())
                .currentYear(user.getCurrentYear())
                .bio(user.getBio()) // ADD THIS LINE
                .build();
    }

    private static List<CourseResponse> mapCourses(Set<Course> courses) {
        if (courses == null || courses.isEmpty()) {
            return List.of();
        }

        return courses.stream()
                .map(course -> CourseResponse.builder()
                        .id(course.getId())
                        .courseCode(course.getCourseCode())
                        .courseName(course.getCourseName())
                        .description(course.getDescription())
                        .build())
                .collect(Collectors.toList());
    }
}
