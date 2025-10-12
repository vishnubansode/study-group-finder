package com.groupgenius.groupgenius_backend.service;

import com.groupgenius.groupgenius_backend.dto.LoginRequest;
import com.groupgenius.groupgenius_backend.dto.LoginResponse;
import com.groupgenius.groupgenius_backend.dto.UserDto;
import com.groupgenius.groupgenius_backend.dto.UserResponse;
import com.groupgenius.groupgenius_backend.entity.Course;
import com.groupgenius.groupgenius_backend.entity.User;
import com.groupgenius.groupgenius_backend.mapper.UserMapper;
import com.groupgenius.groupgenius_backend.repository.CourseRepository;
import com.groupgenius.groupgenius_backend.repository.UserRepository;
import com.groupgenius.groupgenius_backend.security.JwtUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public User register(UserDto userDto) {
        if (userRepository.existsByEmail(userDto.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        User user = User.builder()
                .firstName(userDto.getFirstName())
                .lastName(userDto.getLastName())
                .email(userDto.getEmail())
                .password(passwordEncoder.encode(userDto.getPassword()))
                .secondarySchool(userDto.getSecondarySchool())
                .graduationYear(userDto.getGraduationYear())
                .university(userDto.getUniversity())
                .major(userDto.getMajor())
                .currentYear(userDto.getCurrentYear())
                .build();

        return userRepository.save(user);
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getEmail());

        return LoginResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .build();
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public User updateUser(Long id, UserDto updateRequest) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setFirstName(updateRequest.getFirstName());
        user.setLastName(updateRequest.getLastName());
        user.setSecondarySchool(updateRequest.getSecondarySchool());
        user.setGraduationYear(updateRequest.getGraduationYear());
        user.setUniversity(updateRequest.getUniversity());
        user.setMajor(updateRequest.getMajor());
        user.setCurrentYear(updateRequest.getCurrentYear());

        if (updateRequest.getPassword() != null && !updateRequest.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(updateRequest.getPassword()));
        }

        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new IllegalArgumentException("User not found");
        }
        userRepository.deleteById(id);
    }

    @Transactional
    public UserResponse addCourse(Long userId, Long courseId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        if (!user.getCourses().contains(course)) {
            user.getCourses().add(course);
            course.getEnrolledUsers().add(user);
            Integer curr = course.getCurrentEnrollment();
            if (curr == null) curr = 0;
            course.setCurrentEnrollment(curr + 1);
            courseRepository.save(course);
            userRepository.save(user);
        }
        return UserMapper.toResponse(user);
    }

    @Transactional
    public UserResponse removeCourse(Long userId, Long courseId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        if (user.getCourses().contains(course)) {
            user.getCourses().remove(course);
            course.getEnrolledUsers().remove(user);
            Integer curr = course.getCurrentEnrollment();
            if (curr == null) curr = 0;
            course.setCurrentEnrollment(Math.max(0, curr - 1));
            courseRepository.save(course);
            userRepository.save(user);
        }
        return UserMapper.toResponse(user);
    }

    @Transactional
    public UserResponse updateCourseStatus(Long userId, Long courseId, boolean active) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        Set<Course> courses = user.getCourses();
        if (active) {
            if (!courses.contains(course)) {
                courses.add(course);
                course.getEnrolledUsers().add(user);
                Integer curr = course.getCurrentEnrollment();
                if (curr == null) curr = 0;
                course.setCurrentEnrollment(curr + 1);
                courseRepository.save(course);
            }
        } else {
            if (courses.contains(course)) {
                courses.remove(course);
                course.getEnrolledUsers().remove(user);
                Integer curr = course.getCurrentEnrollment();
                if (curr == null) curr = 0;
                course.setCurrentEnrollment(Math.max(0, curr - 1));
                courseRepository.save(course);
            }
        }
        return UserMapper.toResponse(user);
    }
}
