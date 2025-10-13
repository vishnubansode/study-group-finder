package com.groupgenius.groupgenius_backend.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupDto {
    private Long groupId;
    private String groupName;
    private String description;
    private String privacyType;
    private Long createdByUserId;
    private String createdByUserName;
}
