package com.smartlibrary.service;

import com.smartlibrary.dto.ReadLaterRequest;
import com.smartlibrary.dto.ReadLaterResponse;
import com.smartlibrary.entity.Book;
import com.smartlibrary.entity.ReadLater;
import com.smartlibrary.entity.User;
import com.smartlibrary.exception.DuplicateResourceException;
import com.smartlibrary.exception.ResourceNotFoundException;
import com.smartlibrary.repository.BookRepository;
import com.smartlibrary.repository.ReadLaterRepository;
import com.smartlibrary.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ReadLaterService {

    private final ReadLaterRepository readLaterRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;

    public ReadLaterResponse addToWishlist(ReadLaterRequest request) {
        if (readLaterRepository.existsByUserIdAndBookId(request.getUserId(), request.getBookId())) {
            throw new DuplicateResourceException("Book is already in the wishlist");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getUserId()));

        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book", "id", request.getBookId()));

        ReadLater readLater = ReadLater.builder()
                .user(user)
                .book(book)
                .build();

        ReadLater saved = readLaterRepository.save(readLater);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ReadLaterResponse> getWishlistByUserId(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId);
        }
        return readLaterRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public boolean isBookInWishlist(UUID userId, UUID bookId) {
        return readLaterRepository.existsByUserIdAndBookId(userId, bookId);
    }

    public void removeFromWishlist(UUID id) {
        if (!readLaterRepository.existsById(id)) {
            throw new ResourceNotFoundException("ReadLater", "id", id);
        }
        readLaterRepository.deleteById(id);
    }

    public void removeFromWishlistByUserAndBook(UUID userId, UUID bookId) {
        ReadLater readLater = readLaterRepository.findByUserIdAndBookId(userId, bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book is not in the wishlist"));
        readLaterRepository.delete(readLater);
    }

    private ReadLaterResponse mapToResponse(ReadLater readLater) {
        return ReadLaterResponse.builder()
                .id(readLater.getId())
                .userId(readLater.getUser().getId())
                .username(readLater.getUser().getUsername())
                .bookId(readLater.getBook().getId())
                .bookTitle(readLater.getBook().getTitle())
                .bookAuthor(readLater.getBook().getAuthor())
                .bookCoverImageUrl(readLater.getBook().getCoverImageUrl())
                .addedAt(readLater.getAddedAt())
                .build();
    }
}
