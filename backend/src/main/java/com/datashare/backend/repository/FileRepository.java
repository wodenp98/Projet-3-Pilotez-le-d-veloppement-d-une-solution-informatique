package com.datashare.backend.repository;

import com.datashare.backend.entity.FileEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface FileRepository extends JpaRepository<FileEntity, Long> {

    Optional<FileEntity> findByToken(String token);

    List<FileEntity> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<FileEntity> findByExpiredAtBefore(LocalDateTime dateTime);
}
