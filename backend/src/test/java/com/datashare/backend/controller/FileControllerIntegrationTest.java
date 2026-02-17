package com.datashare.backend.controller;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import com.datashare.backend.entity.User;
import com.datashare.backend.repository.FileRepository;
import com.datashare.backend.repository.UserRepository;
import com.datashare.backend.security.JwtUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@ActiveProfiles("test")
@Transactional
class FileControllerIntegrationTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileRepository fileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    private String jwtToken;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        fileRepository.deleteAll();
        userRepository.deleteAll();

        User user = new User("test@test.com", passwordEncoder.encode("password123"));
        userRepository.save(user);

        jwtToken = jwtUtil.generateToken("test@test.com");
    }

    @Test
    void upload_success_returns201() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "document.pdf", "application/pdf", "contenu du fichier".getBytes());

        mockMvc.perform(multipart("/api/files")
                        .file(file)
                        .param("expirationDays", "7")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("document.pdf"))
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.passwordProtected").value(false));
    }

    @Test
    void upload_withPasswordAndTags_returns201() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "facture.pdf", "application/pdf", "contenu".getBytes());

        mockMvc.perform(multipart("/api/files")
                        .file(file)
                        .param("expirationDays", "3")
                        .param("password", "secret123")
                        .param("tags", "facture", "urgent")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.passwordProtected").value(true))
                .andExpect(jsonPath("$.tags[0]").value("facture"))
                .andExpect(jsonPath("$.tags[1]").value("urgent"));
    }

    @Test
    void upload_noAuth_returns403() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "doc.pdf", "application/pdf", "contenu".getBytes());

        mockMvc.perform(multipart("/api/files").file(file))
                .andExpect(status().isForbidden());
    }

    @Test
    void upload_forbiddenExtension_returns400() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "virus.exe", "application/octet-stream", "contenu".getBytes());

        mockMvc.perform(multipart("/api/files")
                        .file(file)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("File type not allowed: .exe"));
    }

    @Test
    void getUserFiles_success_returns200() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "doc.pdf", "application/pdf", "contenu".getBytes());

        mockMvc.perform(multipart("/api/files")
                .file(file)
                .header("Authorization", "Bearer " + jwtToken));

        mockMvc.perform(get("/api/files")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("doc.pdf"));
    }

    @Test
    void getUserFiles_noAuth_returns403() throws Exception {
        mockMvc.perform(get("/api/files"))
                .andExpect(status().isForbidden());
    }

    @Test
    void getFileInfo_success_returns200() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "photo.png", "image/png", "image".getBytes());

        MvcResult uploadResult = mockMvc.perform(multipart("/api/files")
                        .file(file)
                        .header("Authorization", "Bearer " + jwtToken))
                .andReturn();

        JsonNode json = objectMapper.readTree(uploadResult.getResponse().getContentAsString());
        String token = json.get("token").asText();

        mockMvc.perform(get("/api/files/download/" + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("photo.png"))
                .andExpect(jsonPath("$.expired").value(false));
    }

    @Test
    void downloadFile_success_returns200() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "doc.pdf", "application/pdf", "contenu pdf".getBytes());

        MvcResult uploadResult = mockMvc.perform(multipart("/api/files")
                        .file(file)
                        .header("Authorization", "Bearer " + jwtToken))
                .andReturn();

        JsonNode json = objectMapper.readTree(uploadResult.getResponse().getContentAsString());
        String token = json.get("token").asText();

        mockMvc.perform(post("/api/files/download/" + token))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"doc.pdf\""));
    }

    @Test
    void downloadFile_wrongPassword_returns400() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "secret.pdf", "application/pdf", "contenu".getBytes());

        MvcResult uploadResult = mockMvc.perform(multipart("/api/files")
                        .file(file)
                        .param("password", "bonmotdepasse")
                        .header("Authorization", "Bearer " + jwtToken))
                .andReturn();

        JsonNode json = objectMapper.readTree(uploadResult.getResponse().getContentAsString());
        String token = json.get("token").asText();

        mockMvc.perform(post("/api/files/download/" + token)
                        .param("password", "mauvais"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Invalid password"));
    }

    @Test
    void deleteFile_success_returns204() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "a-supprimer.pdf", "application/pdf", "contenu".getBytes());

        MvcResult uploadResult = mockMvc.perform(multipart("/api/files")
                        .file(file)
                        .header("Authorization", "Bearer " + jwtToken))
                .andReturn();

        JsonNode json = objectMapper.readTree(uploadResult.getResponse().getContentAsString());
        Long fileId = json.get("id").asLong();

        mockMvc.perform(delete("/api/files/" + fileId)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNoContent());
    }
}
