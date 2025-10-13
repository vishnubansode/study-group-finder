package com.groupgenius.groupgenius_backend.config;

import com.groupgenius.groupgenius_backend.entity.User;
import com.groupgenius.groupgenius_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "groupGenius@example.com";

        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            User admin = User.builder()
                    .firstName("Admin")
                    .lastName("User")
                    .email(adminEmail)
                    .password(passwordEncoder.encode("admin123"))
                    .role("ROLE_ADMIN")
                    .build();

            userRepository.save(admin);
            System.out.println("Admin user created: " + adminEmail);
        } else {
            System.out.println("Admin user already exists: " + adminEmail);
        }
    }
}
