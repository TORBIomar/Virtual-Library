package com.smartlibrary.repository;

import com.smartlibrary.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {

    List<Review> findByUserId(UUID userId);

    List<Review> findByBookId(UUID bookId);

    boolean existsByUserIdAndBookId(UUID userId, UUID bookId);
}
