package com.groupgenius.groupgenius_backend.config;

import com.groupgenius.groupgenius_backend.entity.User;
import com.groupgenius.groupgenius_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DefaultUserInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Seed a default user if none exists, or if specific email missing
        String seedEmail = "demo@example.com";
        if (userRepository.findByEmail(seedEmail).isEmpty()) {
            User user = User.builder()
                    .firstName("Demo")
                    .lastName("User")
                    .email(seedEmail)
                    .password(passwordEncoder.encode("Password123!"))
                    .university("Demo University")
                    .major("Computer Science")
                    .currentYear("3")
                    .bio("Seed user for quick login")
                    .build();
            userRepository.save(user);
            System.out.println("Seeded default user: " + seedEmail + " / Password123!");
        }
    }
}



