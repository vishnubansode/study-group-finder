package com.groupgenius.groupgenius_backend.dto;

import lombok.*;

import java.util.List;

@Value
@Builder
@Data
@AllArgsConstructor
public class UserResponse {
    Long id;
    String firstName;
    String lastName;
    String email;
    String profileImageUrl;
    String secondarySchool;
    String graduationYear;
    String university;
    String major;
    String currentYear;
    String bio;
    List<CourseResponse> courses;
}
