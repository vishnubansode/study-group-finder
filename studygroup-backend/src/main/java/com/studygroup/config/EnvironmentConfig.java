package com.studygroup.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;

/**
 * Configuration class to load environment variables from .env file
 * This runs before Spring Boot starts and loads environment variables
 */
public class EnvironmentConfig implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        try {
            // Try to load .env file from the current directory (backend directory)
            Dotenv dotenv = Dotenv.configure()
                    .ignoreIfMissing() // Don't fail if .env file doesn't exist
                    .load();

            ConfigurableEnvironment environment = applicationContext.getEnvironment();
            Map<String, Object> dotenvProperties = new HashMap<>();

            // Add all .env properties to Spring environment
            dotenv.entries().forEach(entry -> {
                dotenvProperties.put(entry.getKey(), entry.getValue());
            });

            // Add the properties to Spring's environment
            environment.getPropertySources().addFirst(new MapPropertySource("dotenv", dotenvProperties));

            System.out.println("✅ Successfully loaded .env file with " + dotenvProperties.size() + " properties");
        } catch (Exception e) {
            System.out.println("⚠️ Could not load .env file: " + e.getMessage());
            System.out.println("Environment variables will need to be set manually or through IDE");
        }
    }
}