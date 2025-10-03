package com.groupgenius.groupgenius_backend.dto;

import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class UserCoursesResponse {
    List<CourseResponse> enrolledCourses;
    Integer totalCourses;
    Integer totalCreditHours;
    Double averageEnrollmentPercentage;
}