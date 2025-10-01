package com.groupgenius.groupgenius_backend.dto;

import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
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
    List<CourseResponse> courses;
}
