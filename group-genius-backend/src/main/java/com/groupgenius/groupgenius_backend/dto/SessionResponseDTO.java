package com.groupgenius.groupgenius_backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionResponseDTO {
    private Long id;
    private Long groupId;
    private String title;
    private String description;
    private LocalDateTime startTime;
    private Integer durationDays;
    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;
    private String meetingLink;

}
