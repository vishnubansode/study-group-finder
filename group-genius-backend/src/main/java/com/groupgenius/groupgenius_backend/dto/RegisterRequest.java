package com.groupgenius.groupgenius_backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String password;

    private String profileImageUrl;

    private String secondarySchool;
    private String graduationYear;
    private String university;
    private String major;
    private String currentYear;

    private Set<Long> selectedCourseIds; // IDs of courses selected
}
