package com.smartlibrary.controller;

import com.smartlibrary.dto.BookResponse;
import com.smartlibrary.dto.ReadLaterRequest;
import com.smartlibrary.dto.ReadLaterResponse;
import com.smartlibrary.dto.ReviewRequest;
import com.smartlibrary.dto.ReviewResponse;
import com.smartlibrary.entity.Book;
import com.smartlibrary.entity.User;
import com.smartlibrary.exception.ResourceNotFoundException;
import com.smartlibrary.repository.BookRepository;
import com.smartlibrary.repository.UserRepository;
import com.smartlibrary.service.ReadLaterService;
import com.smartlibrary.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.ai.reader.tika.TikaDocumentReader;
import org.springframework.ai.document.Document;
import org.springframework.core.io.FileSystemResource;

@RestController
@RequestMapping("/api/reader")
@RequiredArgsConstructor
@Slf4j
public class ReaderBookController {

    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final ReadLaterService readLaterService;
    private final ReviewService reviewService;

    @Value("${smartlibrary.books.upload-dir:./uploads/books}")
    private String uploadDir;

    @GetMapping("/books")
    public ResponseEntity<List<BookResponse>> browseBooks(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        if (page != null && size != null) {
            Pageable pageable = PageRequest.of(page, size);
            return ResponseEntity.ok(bookRepository.findAll(pageable).getContent().stream()
                    .map(this::mapToResponse)
                    .toList());
        }
        return ResponseEntity.ok(bookRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList());
    }

    @GetMapping("/books/{id}")
    public ResponseEntity<BookResponse> getBookById(@PathVariable UUID id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book", "id", id));
        return ResponseEntity.ok(mapToResponse(book));
    }

    @GetMapping("/books/{id}/download")
    public ResponseEntity<Resource> downloadBook(@PathVariable UUID id) throws IOException {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book", "id", id));

        String rawPath = book.getFilePath();
        String filename = rawPath.substring(Math.max(rawPath.lastIndexOf('/'), rawPath.lastIndexOf('\\')) + 1);
        Path filePath = Paths.get(uploadDir).resolve(filename);
        if (!Files.exists(filePath)) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new UrlResource(filePath.toUri());
        String contentType = Files.probeContentType(filePath);
        if (contentType == null) {
            contentType = "application/octet-stream";
        }
        
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @GetMapping("/books/{id}/cover")
    public ResponseEntity<Resource> getBookCover(
            @PathVariable UUID id,
            @RequestParam("filename") String filename) throws IOException {
        Path filePath = Paths.get(uploadDir).resolve(filename);
        if (!Files.exists(filePath)) {
            return ResponseEntity.notFound().build();
        }
        Resource resource = new UrlResource(filePath.toUri());
        String contentType = Files.probeContentType(filePath);
        if (contentType == null) {
            contentType = "image/jpeg";
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }

    @GetMapping("/wishlist")
    public ResponseEntity<List<ReadLaterResponse>> getWishlist() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(readLaterService.getWishlistByUserId(user.getId()));
    }

    @PostMapping("/wishlist/{bookId}")
    public ResponseEntity<ReadLaterResponse> addToWishlist(@PathVariable UUID bookId) {
        User user = getAuthenticatedUser();
        ReadLaterRequest request = ReadLaterRequest.builder()
                .userId(user.getId())
                .bookId(bookId)
                .build();
        return ResponseEntity.ok(readLaterService.addToWishlist(request));
    }

    @DeleteMapping("/wishlist/{bookId}")
    public ResponseEntity<Void> removeFromWishlist(@PathVariable UUID bookId) {
        User user = getAuthenticatedUser();
        readLaterService.removeFromWishlistByUserAndBook(user.getId(), bookId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/books/{bookId}/reviews")
    public ResponseEntity<ReviewResponse> postReview(
            @PathVariable UUID bookId,
            @Valid @RequestBody ReviewRequest request) {
        User user = getAuthenticatedUser();
        request.setUserId(user.getId());
        request.setBookId(bookId);
        return ResponseEntity.ok(reviewService.createReview(request));
    }

    @GetMapping("/books/{bookId}/reviews")
    public ResponseEntity<List<ReviewResponse>> getBookReviews(@PathVariable UUID bookId) {
        return ResponseEntity.ok(reviewService.getReviewsByBookId(bookId));
    }

    @GetMapping("/books/{id}/pages")
    public ResponseEntity<List<String>> getBookPages(@PathVariable UUID id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book", "id", id));

        String rawPath = book.getFilePath();
        String filename = rawPath.substring(Math.max(rawPath.lastIndexOf('/'), rawPath.lastIndexOf('\\')) + 1);
        Path filePath = Paths.get(uploadDir).resolve(filename);
        if (!Files.exists(filePath)) {
            return ResponseEntity.notFound().build();
        }

        try {
            FileSystemResource resource = new FileSystemResource(filePath.toFile());
            TikaDocumentReader reader = new TikaDocumentReader(resource);
            List<Document> documents = reader.read();

            StringBuilder fullText = new StringBuilder();
            for (Document doc : documents) {
                fullText.append(doc.getText()).append("\n");
            }

            List<String> pages = new ArrayList<>();
            String text = fullText.toString();
            
            // If the book text is extremely small, just return it as one page.
            if (text.trim().isEmpty()) {
                pages.add("The book appears to be empty or contains unreadable text.");
                return ResponseEntity.ok(pages);
            }

            int pageSize = 2500;
            int index = 0;
            while (index < text.length()) {
                int endIndex = Math.min(index + pageSize, text.length());
                if (endIndex < text.length()) {
                    int lastNewline = text.lastIndexOf('\n', endIndex);
                    if (lastNewline > index) {
                        endIndex = lastNewline;
                    } else {
                        int lastSpace = text.lastIndexOf(' ', endIndex);
                        if (lastSpace > index) {
                            endIndex = lastSpace;
                        }
                    }
                }
                pages.add(text.substring(index, endIndex).trim());
                index = endIndex;
                while (index < text.length() && Character.isWhitespace(text.charAt(index))) {
                    index++;
                }
            }

            return ResponseEntity.ok(pages);
        } catch (Exception e) {
            log.error("Failed to extract text from book", e);
            return ResponseEntity.status(500).body(List.of("Error reading book content. Please try downloading it instead."));
        }
    }

    private User getAuthenticatedUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    private BookResponse mapToResponse(Book book) {
        return BookResponse.builder()
                .id(book.getId())
                .title(book.getTitle())
                .author(book.getAuthor())
                .summary(book.getSummary())
                .category(book.getCategory())
                .filePath(book.getFilePath())
                .coverImageUrl(book.getCoverImageUrl())
                .year(book.getYear())
                .build();
    }
}
