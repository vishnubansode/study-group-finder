package com.groupgenius.groupgenius_backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class SessionRequestDTO {

    private Long groupId;
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long createdById;
    private String meetingLink;

}
