package com.groupgenius.groupgenius_backend.exception;

public class GroupMemberNotFoundException extends RuntimeException {
    public GroupMemberNotFoundException(String message) {
        super(message);
    }
}
