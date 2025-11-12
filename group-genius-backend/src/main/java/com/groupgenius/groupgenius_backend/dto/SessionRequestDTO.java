package com.groupgenius.groupgenius_backend.dto;

import lombok.Getter;
import lombok.Setter;

// startTime is kept as String to support offset-aware ISO datetimes from clients

@Getter
@Setter
public class SessionRequestDTO {

    private Long groupId;
    private String title;
    private String description;
    private String startTime; // ISO datetime string, may include timezone offset
    private String startTimeLocal; // optional local wall-clock representation (YYYY-MM-DDTHH:mm)
    private Integer durationDays;
    private Long createdById;
    private String meetingLink;

}
