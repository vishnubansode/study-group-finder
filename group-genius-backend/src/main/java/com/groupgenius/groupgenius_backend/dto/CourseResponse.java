package com.groupgenius.groupgenius_backend.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class CourseResponse {
    Long id;
    String courseCode;
    String courseName;
    String description;
}
