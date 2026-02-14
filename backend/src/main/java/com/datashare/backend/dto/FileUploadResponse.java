package com.datashare.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public record FileUploadResponse(
        Long id,
        String name,
        String type,
        Long size,
        String token,
        LocalDateTime createdAt,
        LocalDateTime expiredAt,
        boolean passwordProtected,
        List<String> tags
) {}
