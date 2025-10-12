package com.groupgenius.groupgenius_backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CourseResponse {
    private Long id;
    private String courseCode;
    private String courseName;
    private String description;
    private Integer currentEnrollment;
    private Boolean isEnrolled;
}