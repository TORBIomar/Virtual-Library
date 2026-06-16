package com.smartlibrary.controller;

import com.smartlibrary.dto.ReadingProgressRequest;
import com.smartlibrary.dto.ReadingProgressResponse;
import com.smartlibrary.service.ReadingProgressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reading-progress")
@RequiredArgsConstructor
public class ReadingProgressController {

    private final ReadingProgressService readingProgressService;

    /**
     * POST /api/reading-progress
     * Create or update reading progress (upsert).
     */
    @PostMapping
    public ResponseEntity<ReadingProgressResponse> saveProgress(@Valid @RequestBody ReadingProgressRequest request) {
        ReadingProgressResponse response = readingProgressService.saveOrUpdateProgress(request);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    /**
     * GET /api/reading-progress/user/{userId}
     * Get all reading progress for a user.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ReadingProgressResponse>> getProgressByUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(readingProgressService.getProgressByUserId(userId));
    }

    /**
     * GET /api/reading-progress/user/{userId}/book/{bookId}
     * Get reading progress for a specific user-book pair.
     */
    @GetMapping("/user/{userId}/book/{bookId}")
    public ResponseEntity<ReadingProgressResponse> getProgress(
            @PathVariable UUID userId,
            @PathVariable UUID bookId) {
        return ResponseEntity.ok(readingProgressService.getProgressByUserAndBook(userId, bookId));
    }

    /**
     * DELETE /api/reading-progress/{id}
     * Delete a reading progress entry.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProgress(@PathVariable UUID id) {
        readingProgressService.deleteProgress(id);
        return ResponseEntity.noContent().build();
    }
}
