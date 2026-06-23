package com.smartlibrary.controller;

import com.smartlibrary.dto.AiChatRequest;
import com.smartlibrary.dto.AiChatResponse;
import com.smartlibrary.entity.Book;
import com.smartlibrary.repository.BookRepository;
import com.smartlibrary.service.DocumentIngestionService;
import com.smartlibrary.service.RagService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Slf4j
public class AiChatController {

    private final RagService ragService;
    private final DocumentIngestionService documentIngestionService;
    private final BookRepository bookRepository;

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chat(@RequestBody AiChatRequest request) {
        AiChatResponse response = ragService.chatWithContext(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/ingest/{bookId}")
    public ResponseEntity<String> ingestBook(@PathVariable UUID bookId) {
        documentIngestionService.ingestBook(bookId);
        return ResponseEntity.ok("Book ingestion completed successfully.");
    }

    @PostMapping("/ingest-all")
    public ResponseEntity<String> ingestAllBooks() {
        List<Book> books = bookRepository.findAll();
        log.info("Starting bulk ingestion of {} books", books.size());
        int success = 0;
        int failed = 0;
        for (Book book : books) {
            try {
                documentIngestionService.ingestBook(book.getId());
                success++;
                log.info("Ingested [{}/{}]: {}", success + failed, books.size(), book.getTitle());
            } catch (Exception e) {
                failed++;
                log.error("Failed to ingest book: " + book.getTitle(), e);
            }
        }
        String msg = String.format("Bulk ingestion complete: %d succeeded, %d failed out of %d total.", success, failed, books.size());
        log.info(msg);
        return ResponseEntity.ok(msg);
    }

    @DeleteMapping("/ingest/{bookId}")
    public ResponseEntity<String> deleteBookVectors(@PathVariable UUID bookId) {
        documentIngestionService.deleteBookVectors(bookId);
        return ResponseEntity.ok("Book vectors deleted successfully.");
    }
}

