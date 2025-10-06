package com.groupgenius.groupgenius_backend.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CoursePeersResponse {
    private Long courseId;
    private String courseCode;
    private String courseName;
    private List<UserResponse> peers;
    private Integer totalPeers;
}