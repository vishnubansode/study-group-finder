package com.groupgenius.groupgenius_backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    // No static resource handler overrides needed; media served via Cloudinary
    // URLs.
}
