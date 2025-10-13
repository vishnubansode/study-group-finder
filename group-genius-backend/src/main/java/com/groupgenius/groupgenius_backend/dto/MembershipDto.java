package com.groupgenius.groupgenius_backend.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MembershipDto {

    private Long membershipId;
    private Long userId;
    private String userName;
    private Long groupId;
    private String groupName;
    private String role;
    private String status;     
    private LocalDateTime joinedAt;
}
