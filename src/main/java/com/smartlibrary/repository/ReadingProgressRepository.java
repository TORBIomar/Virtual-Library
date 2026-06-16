package com.smartlibrary.repository;

import com.smartlibrary.entity.ReadingProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReadingProgressRepository extends JpaRepository<ReadingProgress, UUID> {

    List<ReadingProgress> findByUserId(UUID userId);

    List<ReadingProgress> findByBookId(UUID bookId);

    Optional<ReadingProgress> findByUserIdAndBookId(UUID userId, UUID bookId);
}
