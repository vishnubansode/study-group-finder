package com.studygroup.exception;

import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;

public class UserServiceException extends RuntimeException{
    private final HttpStatus status;
    private final String message;
    private final LocalDateTime timestamp;


    public UserServiceException(HttpStatus status,String message){
        super(message);
        this.status=status;
        this.message=message;
        this.timestamp=LocalDateTime.now();
    }

    public HttpStatus getStatus(){
        return status;
    }

    @Override
    public String getMessage(){
        return message;
    }

    public LocalDateTime getTimestamp(){
        return timestamp;
    }

}
