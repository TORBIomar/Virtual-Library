package com.smartlibrary.controller;

import com.smartlibrary.dto.BookResponse;
import com.smartlibrary.dto.UserResponse;
import com.smartlibrary.dto.ReviewResponse;
import com.smartlibrary.entity.Book;
import com.smartlibrary.exception.ResourceNotFoundException;
import com.smartlibrary.repository.BookRepository;
import com.smartlibrary.service.UserService;
import com.smartlibrary.service.ReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminBookController {

    private final BookRepository bookRepository;
    private final UserService userService;
    private final ReviewService reviewService;

    @Value("${smartlibrary.books.upload-dir:./uploads/books}")
    private String uploadDir;

    @PostMapping(value = "/books", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BookResponse> uploadBook(
            @RequestParam("title") String title,
            @RequestParam("author") String author,
            @RequestParam("category") String category,
            @RequestParam("description") String description,
            @RequestParam("year") Integer year,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "cover", required = false) MultipartFile cover) throws IOException {

        // 1. Create upload directory if it does not exist
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // 2. Save PDF file
        String pdfFilename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path pdfFilePath = uploadPath.resolve(pdfFilename);
        Files.copy(file.getInputStream(), pdfFilePath, StandardCopyOption.REPLACE_EXISTING);

        // 3. Save Cover Image file if present
        String coverFilename = null;
        if (cover != null && !cover.isEmpty()) {
            coverFilename = UUID.randomUUID().toString() + "_" + cover.getOriginalFilename();
            Path coverFilePath = uploadPath.resolve(coverFilename);
            Files.copy(cover.getInputStream(), coverFilePath, StandardCopyOption.REPLACE_EXISTING);
        }

        // 4. Save metadata to database
        Book book = Book.builder()
                .title(title)
                .author(author)
                .category(category)
                .summary(description)
                .year(year)
                .filePath(pdfFilePath.toString())
                .build();

        Book saved = bookRepository.save(book);

        // Set the relative cover image url pointing to the download controller
        if (coverFilename != null) {
            saved.setCoverImageUrl("/api/reader/books/" + saved.getId() + "/cover?filename=" + coverFilename);
        } else {
            saved.setCoverImageUrl("https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600");
        }
        saved = bookRepository.save(saved);

        BookResponse response = mapToResponse(saved);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping(value = "/books/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BookResponse> updateBook(
            @PathVariable UUID id,
            @RequestParam("title") String title,
            @RequestParam("author") String author,
            @RequestParam("category") String category,
            @RequestParam("description") String description,
            @RequestParam("year") Integer year,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "cover", required = false) MultipartFile cover) throws IOException {

        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book", "id", id));

        book.setTitle(title);
        book.setAuthor(author);
        book.setCategory(category);
        book.setSummary(description);
        book.setYear(year);

        Path uploadPath = Paths.get(uploadDir);

        if (file != null && !file.isEmpty()) {
            // Delete old file
            deleteFileIfExists(book.getFilePath());
            // Save new file
            String pdfFilename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path pdfFilePath = uploadPath.resolve(pdfFilename);
            Files.copy(file.getInputStream(), pdfFilePath, StandardCopyOption.REPLACE_EXISTING);
            book.setFilePath(pdfFilePath.toString());
        }

        if (cover != null && !cover.isEmpty()) {
            // Save new cover
            String coverFilename = UUID.randomUUID().toString() + "_" + cover.getOriginalFilename();
            Path coverFilePath = uploadPath.resolve(coverFilename);
            Files.copy(cover.getInputStream(), coverFilePath, StandardCopyOption.REPLACE_EXISTING);
            book.setCoverImageUrl("/api/reader/books/" + book.getId() + "/cover?filename=" + coverFilename);
        }

        Book updated = bookRepository.save(book);
        return ResponseEntity.ok(mapToResponse(updated));
    }

    @DeleteMapping("/books/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable UUID id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book", "id", id));

        // Delete book file from disk
        deleteFileIfExists(book.getFilePath());

        // Delete cover image if it points to a local controller url
        if (book.getCoverImageUrl() != null && book.getCoverImageUrl().contains("filename=")) {
            try {
                String filename = book.getCoverImageUrl().split("filename=")[1];
                Path coverFilePath = Paths.get(uploadDir).resolve(filename);
                Files.deleteIfExists(coverFilePath);
            } catch (Exception e) {
                log.error("Failed to delete cover image: " + book.getCoverImageUrl(), e);
            }
        }

        bookRepository.delete(book);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/reviews")
    public ResponseEntity<List<ReviewResponse>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviews());
    }

    @DeleteMapping("/reviews/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable UUID id) {
        reviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }

    private void deleteFileIfExists(String pathStr) {
        if (pathStr != null) {
            try {
                Files.deleteIfExists(Paths.get(pathStr));
            } catch (IOException e) {
                log.error("Failed to delete file: " + pathStr, e);
            }
        }
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
