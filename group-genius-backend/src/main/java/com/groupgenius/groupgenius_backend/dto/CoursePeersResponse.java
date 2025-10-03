package com.groupgenius.groupgenius_backend.dto;

import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class CoursePeersResponse {
    Long courseId;
    String courseCode;
    String courseName;
    List<UserResponse> peers;
    Integer totalPeers;
}