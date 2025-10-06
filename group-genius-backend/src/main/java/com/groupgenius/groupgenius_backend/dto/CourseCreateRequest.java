package com.groupgenius.groupgenius_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class CourseCreateRequest {
    
    @NotBlank(message = "Course name is required")
    private String courseName;
    
    private String description;
    
    @NotNull(message = "Course capacity is required")
    @Positive(message = "Course capacity must be positive")
    private Integer courseCapacity;
}