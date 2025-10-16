package com.groupgenius.groupgenius_backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

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

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneric(Exception ex) {
        ex.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("success", false, "message", "An unexpected error occurred"));
    }
}
