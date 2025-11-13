package com.groupgenius.groupgenius_backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/files")
public class FileController {

    @GetMapping({ "/{filename:.+}", "/view/{filename:.+}", "/download/{filename:.+}" })
    public ResponseEntity<String> deprecatedEndpoint(@PathVariable String filename) {
        String message = "Local file serving has been deprecated. Media is now stored in Cloudinary."
                + " Requested filename: " + filename;
        return ResponseEntity.status(HttpStatus.GONE).body(message);
    }
}