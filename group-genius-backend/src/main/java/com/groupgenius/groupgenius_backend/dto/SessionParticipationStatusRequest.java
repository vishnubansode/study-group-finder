package com.groupgenius.groupgenius_backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class SessionParticipationStatusRequest {
    private List<Long> sessionIds;
}
