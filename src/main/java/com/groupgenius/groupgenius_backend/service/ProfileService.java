package com.groupgenius.groupgenius_backend.service;

import com.groupgenius.groupgenius_backend.entity.User;
import com.groupgenius.groupgenius_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;

@Service
public class ProfileService {
    @Autowired
    private UserRepository userRepository;

    private final String uploadDir = "uploads/";

    public String uploadAvatar(Long userId, MultipartFile file) throws IOException {
        String filename = userId + "_" + file.getOriginalFilename();
        File dest = new File(uploadDir + filename);
        file.transferTo(dest);
        User user = userRepository.findById(userId).orElseThrow();
        user.setAvatar(filename);
        userRepository.save(user);
        return filename;
    }
}

