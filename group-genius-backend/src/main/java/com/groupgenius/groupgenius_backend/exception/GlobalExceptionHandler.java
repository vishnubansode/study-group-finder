package com.groupgenius.groupgenius_backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(GroupNotFoundException.class)
    public ResponseEntity<?> handleGroupNotFound(GroupNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", ex.getMessage()));
    }

    @ExceptionHandler(GroupMemberNotFoundException.class)
    public ResponseEntity<?> handleGroupMemberNotFound(GroupMemberNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", ex.getMessage()));
    }

    @ExceptionHandler(DuplicateGroupMemberException.class)
    public ResponseEntity<?> handleDuplicateMember(DuplicateGroupMemberException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("success", false, "message", ex.getMessage()));
    }

    @ExceptionHandler(UnauthorizedActionException.class)
    public ResponseEntity<?> handleUnauthorized(UnauthorizedActionException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("success", false, "message", ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "message", ex.getMessage()));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleResourceNotFound(ResourceNotFoundException ex, WebRequest request) {
        return buildErrorResponse(HttpStatus.NOT_FOUND, "Not Found", ex, request);
    }

    @ExceptionHandler(TimeSlotConflictException.class)
    public ResponseEntity<Map<String, Object>> handleTimeSlotConflict(TimeSlotConflictException ex, WebRequest request) {
        return buildErrorResponse(HttpStatus.CONFLICT, "Time Slot Conflict", ex, request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex, WebRequest request) {
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error", ex, request);
    }

    private ResponseEntity<Map<String, Object>> buildErrorResponse(HttpStatus status, String error, Exception ex, WebRequest request) {
        Map<String, Object> errorBody = new HashMap<>();
        errorBody.put("timestamp", LocalDateTime.now());
        errorBody.put("status", status.value());
        errorBody.put("error", error);
        errorBody.put("message", ex.getMessage());
        errorBody.put("path", request.getDescription(false));
        return new ResponseEntity<>(errorBody, status);
    }
}
