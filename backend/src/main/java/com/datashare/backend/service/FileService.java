package com.datashare.backend.service;

import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.datashare.backend.dto.FileInfoResponse;
import com.datashare.backend.dto.FileUploadResponse;
import com.datashare.backend.entity.FileEntity;
import com.datashare.backend.entity.Tag;
import com.datashare.backend.entity.User;
import com.datashare.backend.repository.FileRepository;
import com.datashare.backend.repository.UserRepository;

@Service
public class FileService {

    private final FileRepository fileRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;
    private final PasswordEncoder passwordEncoder;
    private final Set<String> forbiddenExtensions;

    public FileService(FileRepository fileRepository,
                       UserRepository userRepository,
                       StorageService storageService,
                       PasswordEncoder passwordEncoder,
                       @Value("${file.forbidden-extensions}") String forbiddenExts) {
        this.fileRepository = fileRepository;
        this.userRepository = userRepository;
        this.storageService = storageService;
        this.passwordEncoder = passwordEncoder;
        this.forbiddenExtensions = Arrays.stream(forbiddenExts.split(","))
                .map(String::trim)
                .map(String::toLowerCase)
                .collect(Collectors.toSet());
    }

    @Transactional
    public FileUploadResponse upload(MultipartFile file,
                                     String userEmail,
                                     Integer expirationDays,
                                     String password,
                                     List<String> tags) {

        validateFile(file);

        int days = (expirationDays != null && expirationDays >= 1 && expirationDays <= 7)
                ? expirationDays : 7;

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String storedName = storageService.store(file);
        String token = UUID.randomUUID().toString();

        FileEntity fileEntity = new FileEntity();
        fileEntity.setName(file.getOriginalFilename());
        fileEntity.setType(file.getContentType());
        fileEntity.setSize(file.getSize());
        fileEntity.setFilePath(storedName);
        fileEntity.setToken(token);
        fileEntity.setExpiredAt(LocalDateTime.now().plusDays(days));
        fileEntity.setUser(user);

        if (password != null && !password.isBlank()) {
            if (password.length() < 6) {
                throw new IllegalArgumentException("File password must be at least 6 characters");
            }
            fileEntity.setPassword(passwordEncoder.encode(password));
        }

        if (tags != null && !tags.isEmpty()) {
            for (String tagName : tags) {
                String trimmed = tagName.trim();
                if (trimmed.length() > 30) {
                    throw new IllegalArgumentException("Tag must be 30 characters or less");
                }
                fileEntity.getTags().add(new Tag(trimmed, fileEntity));
            }
        }

        fileEntity = fileRepository.save(fileEntity);

        List<String> tagNames = fileEntity.getTags().stream()
                .map(Tag::getName)
                .toList();

        return new FileUploadResponse(
                fileEntity.getId(),
                fileEntity.getName(),
                fileEntity.getType(),
                fileEntity.getSize(),
                fileEntity.getToken(),
                fileEntity.getCreatedAt(),
                fileEntity.getExpiredAt(),
                fileEntity.getPassword() != null,
                tagNames
        );
    }

    public List<FileUploadResponse> getUserFiles(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return fileRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(f -> new FileUploadResponse(
                        f.getId(),
                        f.getName(),
                        f.getType(),
                        f.getSize(),
                        f.getToken(),
                        f.getCreatedAt(),
                        f.getExpiredAt(),
                        f.getPassword() != null,
                        f.getTags().stream().map(Tag::getName).toList()
                ))
                .toList();
    }

    public FileInfoResponse getFileInfo(String token) {
        FileEntity fileEntity = fileRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("File not found"));

        boolean expired = fileEntity.getExpiredAt().isBefore(LocalDateTime.now());

        return new FileInfoResponse(
                fileEntity.getName(),
                fileEntity.getType(),
                fileEntity.getSize(),
                fileEntity.getExpiredAt(),
                fileEntity.getPassword() != null,
                expired
        );
    }

    public Path downloadFile(String token, String password) {
        FileEntity fileEntity = fileRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("File not found"));

        if (fileEntity.getExpiredAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("File has expired");
        }

        if (fileEntity.getPassword() != null) {
            if (password == null || password.isBlank()) {
                throw new IllegalArgumentException("Password is required");
            }
            if (!passwordEncoder.matches(password, fileEntity.getPassword())) {
                throw new IllegalArgumentException("Invalid password");
            }
        }

        return storageService.load(fileEntity.getFilePath());
    }

    public String getFileName(String token) {
        return fileRepository.findByToken(token)
                .map(FileEntity::getName)
                .orElseThrow(() -> new IllegalArgumentException("File not found"));
    }

    public String getFileContentType(String token) {
        return fileRepository.findByToken(token)
                .map(FileEntity::getType)
                .orElseThrow(() -> new IllegalArgumentException("File not found"));
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        String originalName = file.getOriginalFilename();
        if (originalName != null && originalName.contains(".")) {
            String extension = originalName.substring(originalName.lastIndexOf(".") + 1).toLowerCase();
            if (forbiddenExtensions.contains(extension)) {
                throw new IllegalArgumentException("File type not allowed: ." + extension);
            }
        }
    }
}
