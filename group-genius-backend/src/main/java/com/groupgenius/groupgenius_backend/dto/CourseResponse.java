package com.groupgenius.groupgenius_backend.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class CourseResponse {
    Long id;
    String courseName;
    String description;
    Integer courseCapacity;
    Integer currentEnrollment;
    Double enrollmentPercentage;
    Boolean isFull;
    Boolean isEnrolled; // Will be set based on current user context
}
