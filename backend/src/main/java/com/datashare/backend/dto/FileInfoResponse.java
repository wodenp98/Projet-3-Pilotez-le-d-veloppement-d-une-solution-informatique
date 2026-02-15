package com.datashare.backend.dto;

import java.time.LocalDateTime;

public record FileInfoResponse(
        String name,
        String type,
        Long size,
        LocalDateTime expiredAt,
        boolean passwordProtected,
        boolean expired
) {}
