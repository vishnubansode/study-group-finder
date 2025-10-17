package com.groupgenius.groupgenius_backend.dto;

import lombok.Data;

@Data
public class GroupCreateRequest {
    private String name;
    private String description;
    private Long courseId;
    private Long createdBy;
    private String privacy;
    private String password;
}
