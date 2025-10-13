package com.groupgenius.groupgenius_backend.exception;

public class DuplicateGroupMemberException extends RuntimeException {
    public DuplicateGroupMemberException(String message) {
        super(message);
    }
}
