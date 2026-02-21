package com.datashare.backend.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.file.Files;
import java.nio.file.Path;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

class StorageServiceTest {

    @TempDir
    Path tempDir;

    private StorageService storageService;

    @BeforeEach
    void setUp() {
        storageService = new StorageService(tempDir.toString());
        storageService.init();
    }

    @Test
    void store_success() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "document.pdf", "application/pdf", "contenu du fichier".getBytes());

        String storedName = storageService.store(file);

        assertThat(storedName).isNotBlank();
        assertThat(Files.exists(tempDir.resolve(storedName))).isTrue();
    }

    @Test
    void load_returnsCorrectPath() {
        Path result = storageService.load("mon-fichier");

        assertThat(result).isEqualTo(tempDir.resolve("mon-fichier"));
    }

    @Test
    void delete_success() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.txt", "text/plain", "contenu".getBytes());
        String storedName = storageService.store(file);

        storageService.delete(storedName);

        assertThat(Files.exists(tempDir.resolve(storedName))).isFalse();
    }

    @Test
    void delete_nonExistentFile_noException() {
        storageService.delete("fichier-inexistant");
    }
}
