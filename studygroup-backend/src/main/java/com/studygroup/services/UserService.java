package com.studygroup.services;

import com.studygroup.exception.UserServiceException;
import com.studygroup.model.User;
import com.studygroup.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;


@Service
public class UserService {
@Autowired
private UserRepository userRepository;

private static final String PASSWORD_PATTERN= "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,}$";


public User registerUser(User user ){
// Check if email exists
    if(userRepository.findByEmail(user.getEmail()).isPresent()){
        throw new UserServiceException(HttpStatus.BAD_REQUEST,"Email already exists:"+user.getEmail());

    }

//check if username exist
    if (userRepository.findByUsername(user.getUsername()).isPresent()) {
        throw new UserServiceException(HttpStatus.BAD_REQUEST,
                "Username already exists: " + user.getUsername());

    }


 //Validate password strength

    if(!isPasswordStrong(user.getPassword())) {
        throw new UserServiceException(HttpStatus.BAD_REQUEST, "Password must be at least 8 charecters long and contain uppercase,lowercase,number,and special character.");

    }

 return userRepository.save(user);
}

private boolean isPasswordStrong(String password) {
    return Pattern.compile(PASSWORD_PATTERN).matcher(password).matches();

}
}
