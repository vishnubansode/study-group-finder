package com.groupgenius.groupgenius_backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FileStorageService {

    private final Cloudinary cloudinary;

    @Value("${cloudinary.upload-folder:group-genius}")
    private String uploadFolder;

    public String storeFile(MultipartFile file) throws IOException {
        @SuppressWarnings("unchecked")
        Map<String, Object> uploadOptions = (Map<String, Object>) ObjectUtils.asMap(
                "resource_type", "auto",
                "folder", uploadFolder,
                "public_id", generatePublicId(file.getOriginalFilename()));

        @SuppressWarnings("unchecked")
        Map<String, Object> uploadResult = (Map<String, Object>) cloudinary.uploader().upload(file.getBytes(),
                uploadOptions);

        Object secureUrl = uploadResult.get("secure_url");
        if (secureUrl instanceof String secureUrlString && !secureUrlString.isBlank()) {
            return secureUrlString;
        }

        Object url = uploadResult.get("url");
        if (url instanceof String urlString && !urlString.isBlank()) {
            return urlString;
        }

        throw new IOException("Cloudinary upload did not return a URL");
    }

    private String generatePublicId(String originalFilename) {
        String filename = StringUtils.getFilename(originalFilename);
        if (filename == null || filename.isBlank()) {
            filename = "file";
        }

        String sanitized = filename.replaceAll("[^a-zA-Z0-9._-]", "_");
        return System.currentTimeMillis() + "_" + sanitized;
    }
}