package com.groupgenius.groupgenius_backend.exception;

public class TimeSlotConflictException extends RuntimeException {
    public TimeSlotConflictException(String message) {
        super(message);
    }
}
