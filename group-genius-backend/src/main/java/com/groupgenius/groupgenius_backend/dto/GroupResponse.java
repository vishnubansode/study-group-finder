package com.groupgenius.groupgenius_backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GroupResponse {
    private Long groupId;
    private String groupName;
    private String description;
    private String courseName;
    private Long createdBy;
    private String privacyType;
    private java.time.LocalDateTime createdAt;
    private String membershipStatus;
    private String membershipRole;
    private Boolean hasPassword;
}
