package com.groupgenius.groupgenius_backend.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
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
    private List<String> courses;
}
