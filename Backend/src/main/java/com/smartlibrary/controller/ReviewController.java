package com.smartlibrary.controller;

import com.smartlibrary.dto.ReviewRequest;
import com.smartlibrary.dto.ReviewResponse;
import com.smartlibrary.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    /**
     * POST /api/reviews
     * Create a new review.
     */
    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(@Valid @RequestBody ReviewRequest request) {
        ReviewResponse response = reviewService.createReview(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * GET /api/reviews/{id}
     * Get review by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ReviewResponse> getReviewById(@PathVariable UUID id) {
        return ResponseEntity.ok(reviewService.getReviewById(id));
    }

    /**
     * GET /api/reviews/book/{bookId}
     * Get all reviews for a book.
     */
    @GetMapping("/book/{bookId}")
    public ResponseEntity<List<ReviewResponse>> getReviewsByBook(@PathVariable UUID bookId) {
        return ResponseEntity.ok(reviewService.getReviewsByBookId(bookId));
    }

    /**
     * GET /api/reviews/user/{userId}
     * Get all reviews by a user.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ReviewResponse>> getReviewsByUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(reviewService.getReviewsByUserId(userId));
    }

    /**
     * PUT /api/reviews/{id}
     * Update a review (rating and comment only).
     */
    @PutMapping("/{id}")
    public ResponseEntity<ReviewResponse> updateReview(@PathVariable UUID id, @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(reviewService.updateReview(id, request));
    }

    /**
     * DELETE /api/reviews/{id}
     * Delete a review.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable UUID id) {
        reviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }
}
