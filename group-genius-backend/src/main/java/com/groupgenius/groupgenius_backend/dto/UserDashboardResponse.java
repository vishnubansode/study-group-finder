package com.groupgenius.groupgenius_backend.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class UserDashboardResponse {
    private Long userId;
    private String userName;
    private List<CourseResponse> enrolledCourses;
    private List<UserResponse> suggestedPeers;
    private Integer totalCourses;
    private Integer totalPeers;
}