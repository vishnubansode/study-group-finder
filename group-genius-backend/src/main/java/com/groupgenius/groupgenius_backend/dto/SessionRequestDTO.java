package com.groupgenius.groupgenius_backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SessionRequestDTO {

    private Long groupId;
    private String title;
    private String description;
    private String date; // YYYY-MM-DD
    private String startTime; // HH:mm
    private String endTime; // HH:mm
    private Integer durationDays;
    private Long createdById;
    private String meetingLink;

}
