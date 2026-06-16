package com.smartlibrary.service;

import com.smartlibrary.dto.ReadingProgressRequest;
import com.smartlibrary.dto.ReadingProgressResponse;
import com.smartlibrary.entity.Book;
import com.smartlibrary.entity.ReadingProgress;
import com.smartlibrary.entity.User;
import com.smartlibrary.exception.ResourceNotFoundException;
import com.smartlibrary.repository.BookRepository;
import com.smartlibrary.repository.ReadingProgressRepository;
import com.smartlibrary.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ReadingProgressService {

    private final ReadingProgressRepository readingProgressRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;

    /**
     * Creates or updates reading progress for a user-book pair.
     * If progress already exists, it updates the page numbers (upsert).
     */
    public ReadingProgressResponse saveOrUpdateProgress(ReadingProgressRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getUserId()));

        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book", "id", request.getBookId()));

        Optional<ReadingProgress> existing = readingProgressRepository
                .findByUserIdAndBookId(request.getUserId(), request.getBookId());

        ReadingProgress progress;
        if (existing.isPresent()) {
            progress = existing.get();
            progress.setCurrentPage(request.getCurrentPage());
            progress.setTotalPages(request.getTotalPages());
        } else {
            progress = ReadingProgress.builder()
                    .user(user)
                    .book(book)
                    .currentPage(request.getCurrentPage())
                    .totalPages(request.getTotalPages())
                    .build();
        }

        ReadingProgress saved = readingProgressRepository.save(progress);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public ReadingProgressResponse getProgressByUserAndBook(UUID userId, UUID bookId) {
        ReadingProgress progress = readingProgressRepository.findByUserIdAndBookId(userId, bookId)
                .orElseThrow(() -> new ResourceNotFoundException("ReadingProgress not found for this user and book"));
        return mapToResponse(progress);
    }

    @Transactional(readOnly = true)
    public List<ReadingProgressResponse> getProgressByUserId(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId);
        }
        return readingProgressRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public void deleteProgress(UUID id) {
        if (!readingProgressRepository.existsById(id)) {
            throw new ResourceNotFoundException("ReadingProgress", "id", id);
        }
        readingProgressRepository.deleteById(id);
    }

    private ReadingProgressResponse mapToResponse(ReadingProgress progress) {
        double percentage = progress.getTotalPages() > 0
                ? Math.round((double) progress.getCurrentPage() / progress.getTotalPages() * 100.0 * 100.0) / 100.0
                : 0.0;

        return ReadingProgressResponse.builder()
                .id(progress.getId())
                .userId(progress.getUser().getId())
                .username(progress.getUser().getUsername())
                .bookId(progress.getBook().getId())
                .bookTitle(progress.getBook().getTitle())
                .currentPage(progress.getCurrentPage())
                .totalPages(progress.getTotalPages())
                .progressPercentage(percentage)
                .build();
    }
}
