package com.datashare.backend.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class StorageService {

    private final Path rootLocation;

    public StorageService(@Value("${storage.local.path}") String storagePath) {
        this.rootLocation = Paths.get(storagePath).toAbsolutePath().normalize();
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage directory", e);
        }
    }

    public String store(MultipartFile file) {
        String storedName = UUID.randomUUID().toString();

        try (InputStream inputStream = file.getInputStream()) {
            Path target = rootLocation.resolve(storedName);
            Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }

        return storedName;
    }

    public Path load(String storedName) {
        return rootLocation.resolve(storedName);
    }

    public void delete(String storedName) {
        try {
            Files.deleteIfExists(rootLocation.resolve(storedName));
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete file", e);
        }
    }
}
