package com.datashare.backend.controller;

import com.datashare.backend.dto.FileInfoResponse;
import com.datashare.backend.dto.FileUploadResponse;
import com.datashare.backend.service.FileService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Path;
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

    @GetMapping("/download/{token}")
    public ResponseEntity<FileInfoResponse> getFileInfo(@PathVariable String token) {
        FileInfoResponse info = fileService.getFileInfo(token);
        return ResponseEntity.ok(info);
    }

    @PostMapping("/download/{token}")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable String token,
            @RequestParam(value = "password", required = false) String password) {

        Path filePath = fileService.downloadFile(token, password);
        String fileName = fileService.getFileName(token);
        String contentType = fileService.getFileContentType(token);

        try {
            Resource resource = new UrlResource(filePath.toUri());
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType != null ? contentType : "application/octet-stream"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .body(resource);
        } catch (MalformedURLException e) {
            throw new RuntimeException("Could not read file", e);
        }
    }
}
