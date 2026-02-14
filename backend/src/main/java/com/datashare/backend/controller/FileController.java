package com.datashare.backend.controller;

import com.datashare.backend.dto.FileUploadResponse;
import com.datashare.backend.service.FileService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileService fileService;

    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    @PostMapping
    public ResponseEntity<FileUploadResponse> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "expirationDays", required = false) Integer expirationDays,
            @RequestParam(value = "password", required = false) String password,
            @RequestParam(value = "tags", required = false) List<String> tags,
            Authentication authentication) {

        String userEmail = authentication.getName();
        FileUploadResponse response = fileService.upload(file, userEmail, expirationDays, password, tags);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
