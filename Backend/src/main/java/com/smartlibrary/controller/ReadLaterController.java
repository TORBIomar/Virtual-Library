package com.smartlibrary.controller;

import com.smartlibrary.dto.ReadLaterRequest;
import com.smartlibrary.dto.ReadLaterResponse;
import com.smartlibrary.service.ReadLaterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/read-later")
@RequiredArgsConstructor
public class ReadLaterController {

    private final ReadLaterService readLaterService;

    /**
     * POST /api/read-later
     * Add a book to the user's wishlist.
     */
    @PostMapping
    public ResponseEntity<ReadLaterResponse> addToWishlist(@Valid @RequestBody ReadLaterRequest request) {
        ReadLaterResponse response = readLaterService.addToWishlist(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * GET /api/read-later/user/{userId}
     * Get the user's full wishlist.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ReadLaterResponse>> getWishlist(@PathVariable UUID userId) {
        return ResponseEntity.ok(readLaterService.getWishlistByUserId(userId));
    }

    /**
     * GET /api/read-later/check?userId=...&bookId=...
     * Check if a book is in the user's wishlist.
     */
    @GetMapping("/check")
    public ResponseEntity<Map<String, Boolean>> isInWishlist(
            @RequestParam UUID userId,
            @RequestParam UUID bookId) {
        boolean exists = readLaterService.isBookInWishlist(userId, bookId);
        return ResponseEntity.ok(Map.of("inWishlist", exists));
    }

    /**
     * DELETE /api/read-later/{id}
     * Remove an entry from the wishlist by its ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeFromWishlist(@PathVariable UUID id) {
        readLaterService.removeFromWishlist(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * DELETE /api/read-later/user/{userId}/book/{bookId}
     * Remove a book from the wishlist by user + book IDs.
     */
    @DeleteMapping("/user/{userId}/book/{bookId}")
    public ResponseEntity<Void> removeFromWishlistByUserAndBook(
            @PathVariable UUID userId,
            @PathVariable UUID bookId) {
        readLaterService.removeFromWishlistByUserAndBook(userId, bookId);
        return ResponseEntity.noContent().build();
    }
}
