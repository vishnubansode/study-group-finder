package com.groupgenius.groupgenius_backend.dto;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String profileImageUrl;
    private String secondarySchool;
    private String graduationYear;
    private String university;
    private String major;
    private String currentYear;
    private String bio; // Add bio field
    private List<CourseResponse> courses;
    private Integer commonCourses;
}