package com.datashare.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.datashare.backend.dto.FileInfoResponse;
import com.datashare.backend.dto.FileUploadResponse;
import com.datashare.backend.entity.FileEntity;
import com.datashare.backend.entity.User;
import com.datashare.backend.repository.FileRepository;
import com.datashare.backend.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class FileServiceTest {

    @Mock
    private FileRepository fileRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private StorageService storageService;

    @Mock
    private PasswordEncoder passwordEncoder;

    private FileService fileService;

    private User testUser;

    @BeforeEach
    void setUp() {
        fileService = new FileService(
                fileRepository, userRepository, storageService, passwordEncoder,
                "exe,bat,cmd,sh,msi,com,scr,ps1,vbs");

        testUser = new User("test@test.com", "encodedPw");
        testUser.setId(1L);
    }

    @Test
    void upload_success() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "document.pdf", "application/pdf", "contenu".getBytes());

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(testUser));
        when(storageService.store(file)).thenReturn("stored-uuid");
        when(fileRepository.save(any(FileEntity.class))).thenAnswer(invocation -> {
            FileEntity entity = invocation.getArgument(0);
            entity.setId(1L);
            return entity;
        });

        FileUploadResponse response = fileService.upload(file, "test@test.com", 7, null, null);

        assertThat(response.name()).isEqualTo("document.pdf");
        assertThat(response.type()).isEqualTo("application/pdf");
        assertThat(response.passwordProtected()).isFalse();
        verify(storageService).store(file);
    }

    @Test
    void upload_withPassword() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "doc.pdf", "application/pdf", "contenu".getBytes());

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(testUser));
        when(storageService.store(file)).thenReturn("stored-uuid");
        when(passwordEncoder.encode("motdepasse")).thenReturn("encodedMdp");
        when(fileRepository.save(any(FileEntity.class))).thenAnswer(invocation -> {
            FileEntity entity = invocation.getArgument(0);
            entity.setId(1L);
            return entity;
        });

        FileUploadResponse response = fileService.upload(file, "test@test.com", 7, "motdepasse", null);

        assertThat(response.passwordProtected()).isTrue();
        verify(passwordEncoder).encode("motdepasse");
    }

    @Test
    void upload_withTags() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "doc.pdf", "application/pdf", "contenu".getBytes());

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(testUser));
        when(storageService.store(file)).thenReturn("stored-uuid");
        when(fileRepository.save(any(FileEntity.class))).thenAnswer(invocation -> {
            FileEntity entity = invocation.getArgument(0);
            entity.setId(1L);
            return entity;
        });

        FileUploadResponse response = fileService.upload(
                file, "test@test.com", 7, null, List.of("urgent", "facture"));

        assertThat(response.tags()).containsExactly("urgent", "facture");
    }

    @Test
    void upload_emptyFile_throwsException() {
        MockMultipartFile file = new MockMultipartFile("file", "vide.pdf", "application/pdf", new byte[0]);

        assertThatThrownBy(() -> fileService.upload(file, "test@test.com", 7, null, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("File is empty");
    }

    @Test
    void upload_forbiddenExtension_throwsException() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "virus.exe", "application/octet-stream", "contenu".getBytes());

        assertThatThrownBy(() -> fileService.upload(file, "test@test.com", 7, null, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("File type not allowed: .exe");
    }

    @Test
    void upload_shortPassword_throwsException() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "doc.pdf", "application/pdf", "contenu".getBytes());

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(testUser));
        when(storageService.store(file)).thenReturn("stored-uuid");

        assertThatThrownBy(() -> fileService.upload(file, "test@test.com", 7, "abc", null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("File password must be at least 6 characters");
    }

    @Test
    void upload_tagTooLong_throwsException() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "doc.pdf", "application/pdf", "contenu".getBytes());

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(testUser));
        when(storageService.store(file)).thenReturn("stored-uuid");

        String longTag = "a".repeat(31);
        assertThatThrownBy(() -> fileService.upload(file, "test@test.com", 7, null, List.of(longTag)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Tag must be 30 characters or less");
    }

    @Test
    void upload_userNotFound_throwsException() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "doc.pdf", "application/pdf", "contenu".getBytes());

        when(userRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> fileService.upload(file, "unknown@test.com", 7, null, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("User not found");
    }

    @Test
    void upload_defaultExpirationDays() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "doc.pdf", "application/pdf", "contenu".getBytes());

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(testUser));
        when(storageService.store(file)).thenReturn("stored-uuid");
        when(fileRepository.save(any(FileEntity.class))).thenAnswer(invocation -> {
            FileEntity entity = invocation.getArgument(0);
            entity.setId(1L);
            return entity;
        });

        FileUploadResponse response = fileService.upload(file, "test@test.com", null, null, null);

        assertThat(response.expiredAt()).isAfter(LocalDateTime.now().plusDays(6));
    }

    @Test
    void getUserFiles_success() {
        FileEntity fileEntity = createFileEntity(1L, "doc.pdf", "application/pdf", false);

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(testUser));
        when(fileRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(fileEntity));

        List<FileUploadResponse> files = fileService.getUserFiles("test@test.com");

        assertThat(files).hasSize(1);
        assertThat(files.get(0).name()).isEqualTo("doc.pdf");
    }

    @Test
    void getUserFiles_userNotFound_throwsException() {
        when(userRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> fileService.getUserFiles("unknown@test.com"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("User not found");
    }

    @Test
    void getFileInfo_success() {
        FileEntity fileEntity = createFileEntity(1L, "doc.pdf", "application/pdf", false);
        fileEntity.setExpiredAt(LocalDateTime.now().plusDays(3));

        when(fileRepository.findByToken("token-123")).thenReturn(Optional.of(fileEntity));

        FileInfoResponse info = fileService.getFileInfo("token-123");

        assertThat(info.name()).isEqualTo("doc.pdf");
        assertThat(info.expired()).isFalse();
    }

    @Test
    void getFileInfo_expired() {
        FileEntity fileEntity = createFileEntity(1L, "doc.pdf", "application/pdf", false);
        fileEntity.setExpiredAt(LocalDateTime.now().minusDays(1));

        when(fileRepository.findByToken("token-123")).thenReturn(Optional.of(fileEntity));

        FileInfoResponse info = fileService.getFileInfo("token-123");

        assertThat(info.expired()).isTrue();
    }

    @Test
    void getFileInfo_notFound_throwsException() {
        when(fileRepository.findByToken("fake")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> fileService.getFileInfo("fake"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("File not found");
    }

    @Test
    void downloadFile_success_noPassword() {
        FileEntity fileEntity = createFileEntity(1L, "doc.pdf", "application/pdf", false);
        fileEntity.setExpiredAt(LocalDateTime.now().plusDays(3));
        fileEntity.setFilePath("stored-uuid");

        when(fileRepository.findByToken("token-123")).thenReturn(Optional.of(fileEntity));
        when(storageService.load("stored-uuid")).thenReturn(Path.of("/tmp/stored-uuid"));

        Path result = fileService.downloadFile("token-123", null);

        assertThat(result).isEqualTo(Path.of("/tmp/stored-uuid"));
    }

    @Test
    void downloadFile_success_withPassword() {
        FileEntity fileEntity = createFileEntity(1L, "doc.pdf", "application/pdf", true);
        fileEntity.setExpiredAt(LocalDateTime.now().plusDays(3));
        fileEntity.setFilePath("stored-uuid");

        when(fileRepository.findByToken("token-123")).thenReturn(Optional.of(fileEntity));
        when(passwordEncoder.matches("bonmdp", "encodedPw")).thenReturn(true);
        when(storageService.load("stored-uuid")).thenReturn(Path.of("/tmp/stored-uuid"));

        Path result = fileService.downloadFile("token-123", "bonmdp");

        assertThat(result).isEqualTo(Path.of("/tmp/stored-uuid"));
    }

    @Test
    void downloadFile_expired_throwsException() {
        FileEntity fileEntity = createFileEntity(1L, "doc.pdf", "application/pdf", false);
        fileEntity.setExpiredAt(LocalDateTime.now().minusDays(1));

        when(fileRepository.findByToken("token-123")).thenReturn(Optional.of(fileEntity));

        assertThatThrownBy(() -> fileService.downloadFile("token-123", null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("File has expired");
    }

    @Test
    void downloadFile_passwordRequired_throwsException() {
        FileEntity fileEntity = createFileEntity(1L, "doc.pdf", "application/pdf", true);
        fileEntity.setExpiredAt(LocalDateTime.now().plusDays(3));

        when(fileRepository.findByToken("token-123")).thenReturn(Optional.of(fileEntity));

        assertThatThrownBy(() -> fileService.downloadFile("token-123", null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Password is required");
    }

    @Test
    void downloadFile_wrongPassword_throwsException() {
        FileEntity fileEntity = createFileEntity(1L, "doc.pdf", "application/pdf", true);
        fileEntity.setExpiredAt(LocalDateTime.now().plusDays(3));

        when(fileRepository.findByToken("token-123")).thenReturn(Optional.of(fileEntity));
        when(passwordEncoder.matches("mauvais", "encodedPw")).thenReturn(false);

        assertThatThrownBy(() -> fileService.downloadFile("token-123", "mauvais"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid password");
    }

    @Test
    void downloadFile_notFound_throwsException() {
        when(fileRepository.findByToken("fake")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> fileService.downloadFile("fake", null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("File not found");
    }

    @Test
    void deleteFile_success() {
        FileEntity fileEntity = createFileEntity(1L, "doc.pdf", "application/pdf", false);
        fileEntity.setFilePath("stored-uuid");
        fileEntity.setUser(testUser);

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(testUser));
        when(fileRepository.findById(1L)).thenReturn(Optional.of(fileEntity));

        fileService.deleteFile(1L, "test@test.com");

        verify(storageService).delete("stored-uuid");
        verify(fileRepository).delete(fileEntity);
    }

    @Test
    void deleteFile_notOwner_throwsException() {
        User otherUser = new User("other@test.com", "pw");
        otherUser.setId(2L);

        FileEntity fileEntity = createFileEntity(1L, "doc.pdf", "application/pdf", false);
        fileEntity.setUser(otherUser);

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(testUser));
        when(fileRepository.findById(1L)).thenReturn(Optional.of(fileEntity));

        assertThatThrownBy(() -> fileService.deleteFile(1L, "test@test.com"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("You can only delete your own files");
    }

    @Test
    void deleteFile_fileNotFound_throwsException() {
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(testUser));
        when(fileRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> fileService.deleteFile(99L, "test@test.com"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("File not found");
    }

    @Test
    void deleteFile_userNotFound_throwsException() {
        when(userRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> fileService.deleteFile(1L, "unknown@test.com"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("User not found");
    }

    @Test
    void getFileName_success() {
        FileEntity fileEntity = createFileEntity(1L, "doc.pdf", "application/pdf", false);

        when(fileRepository.findByToken("token-123")).thenReturn(Optional.of(fileEntity));

        assertThat(fileService.getFileName("token-123")).isEqualTo("doc.pdf");
    }

    @Test
    void getFileContentType_success() {
        FileEntity fileEntity = createFileEntity(1L, "doc.pdf", "application/pdf", false);

        when(fileRepository.findByToken("token-123")).thenReturn(Optional.of(fileEntity));

        assertThat(fileService.getFileContentType("token-123")).isEqualTo("application/pdf");
    }

    private FileEntity createFileEntity(Long id, String name, String type, boolean hasPassword) {
        FileEntity entity = new FileEntity();
        entity.setId(id);
        entity.setName(name);
        entity.setType(type);
        entity.setSize(1024L);
        entity.setToken("token-123");
        entity.setFilePath("stored-uuid");
        entity.setExpiredAt(LocalDateTime.now().plusDays(7));
        if (hasPassword) {
            entity.setPassword("encodedPw");
        }
        return entity;
    }
}
