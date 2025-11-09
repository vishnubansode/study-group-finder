package com.groupgenius.groupgenius_backend.exception;

public class NotificationProcessingException extends RuntimeException {
    public NotificationProcessingException(String message) {
        super(message);
    }

    public NotificationProcessingException(String message, Throwable cause) {
        super(message, cause);
    }
}