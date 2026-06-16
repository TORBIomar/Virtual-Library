package com.smartlibrary.repository;

import com.smartlibrary.entity.ReadLater;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReadLaterRepository extends JpaRepository<ReadLater, UUID> {

    List<ReadLater> findByUserId(UUID userId);

    List<ReadLater> findByBookId(UUID bookId);

    Optional<ReadLater> findByUserIdAndBookId(UUID userId, UUID bookId);

    boolean existsByUserIdAndBookId(UUID userId, UUID bookId);
}
