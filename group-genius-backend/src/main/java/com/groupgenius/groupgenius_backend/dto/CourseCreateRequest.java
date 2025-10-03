package com.groupgenius.groupgenius_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class CourseCreateRequest {
    
    @NotBlank(message = "Course code is required")
    private String courseCode;
    
    @NotBlank(message = "Course name is required")
    private String courseName;
    
    private String description;
    
    @NotBlank(message = "Instructor name is required")
    private String instructorName;
    
    @NotBlank(message = "Class schedule is required")
    private String classSchedule;
    
    @NotNull(message = "Credit hours is required")
    @Positive(message = "Credit hours must be positive")
    private Integer creditHours;
    
    @NotNull(message = "Course capacity is required")
    @Positive(message = "Course capacity must be positive")
    private Integer courseCapacity;
}