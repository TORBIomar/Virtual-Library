package com.smartlibrary.service;

import com.smartlibrary.dto.BookRequest;
import com.smartlibrary.dto.BookResponse;
import com.smartlibrary.entity.Book;
import com.smartlibrary.exception.ResourceNotFoundException;
import com.smartlibrary.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class BookService {

    private final BookRepository bookRepository;

    public BookResponse createBook(BookRequest request) {
        Book book = Book.builder()
                .title(request.getTitle())
                .author(request.getAuthor())
                .summary(request.getSummary())
                .category(request.getCategory())
                .filePath(request.getFilePath())
                .coverImageUrl(request.getCoverImageUrl())
                .build();

        Book saved = bookRepository.save(book);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public BookResponse getBookById(UUID id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book", "id", id));
        return mapToResponse(book);
    }

    @Transactional(readOnly = true)
    public List<BookResponse> getAllBooks() {
        return bookRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookResponse> searchBooksByTitle(String keyword) {
        return bookRepository.findByTitleContainingIgnoreCase(keyword).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookResponse> getBooksByCategory(String category) {
        return bookRepository.findByCategory(category).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookResponse> getBooksByAuthor(String author) {
        return bookRepository.findByAuthor(author).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public BookResponse updateBook(UUID id, BookRequest request) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book", "id", id));

        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setSummary(request.getSummary());
        book.setCategory(request.getCategory());
        book.setFilePath(request.getFilePath());
        book.setCoverImageUrl(request.getCoverImageUrl());

        Book updated = bookRepository.save(book);
        return mapToResponse(updated);
    }

    public void deleteBook(UUID id) {
        if (!bookRepository.existsById(id)) {
            throw new ResourceNotFoundException("Book", "id", id);
        }
        bookRepository.deleteById(id);
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
                .build();
    }
}
