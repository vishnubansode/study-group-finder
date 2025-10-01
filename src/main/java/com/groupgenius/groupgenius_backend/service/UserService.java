package com.groupgenius.groupgenius_backend.service;

import com.groupgenius.groupgenius_backend.entity.User;
import com.groupgenius.groupgenius_backend.entity.Course;
import com.groupgenius.groupgenius_backend.repository.UserRepository;
import com.groupgenius.groupgenius_backend.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Set;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CourseRepository courseRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    public User register(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public Optional<User> authenticate(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent() && passwordEncoder.matches(password, userOpt.get().getPassword())) {
            return userOpt;
        }
        return Optional.empty();
    }

    public Optional<User> getUser(Long id) {
        return userRepository.findById(id);
    }

    public User updateUser(Long id, User updated) {
        User user = userRepository.findById(id).orElseThrow();
        user.setName(updated.getName());
        user.setEmail(updated.getEmail());
        user.setAcademicDetails(updated.getAcademicDetails());
        user.setAvatar(updated.getAvatar());
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public User addCourse(Long userId, Long courseId) {
        User user = userRepository.findById(userId).orElseThrow();
        Course course = courseRepository.findById(courseId).orElseThrow();
        user.getCourses().add(course);
        return userRepository.save(user);
    }

    public User removeCourse(Long userId, Long courseId) {
        User user = userRepository.findById(userId).orElseThrow();
        Course course = courseRepository.findById(courseId).orElseThrow();
        user.getCourses().remove(course);
        return userRepository.save(user);
    }

    public User updateCourse(Long userId, Long courseId, Course updatedCourse) {
        Course course = courseRepository.findById(courseId).orElseThrow();
        course.setCourseCode(updatedCourse.getCourseCode());
        course.setCourseName(updatedCourse.getCourseName());
        course.setDescription(updatedCourse.getDescription());
        courseRepository.save(course);
        return userRepository.findById(userId).orElseThrow();
    }
}

