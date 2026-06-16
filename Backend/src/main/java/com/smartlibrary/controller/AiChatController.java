package com.smartlibrary.controller;

import com.smartlibrary.dto.AiChatRequest;
import com.smartlibrary.dto.AiChatResponse;
import com.smartlibrary.service.DocumentIngestionService;
import com.smartlibrary.service.RagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiChatController {

    private final RagService ragService;
    private final DocumentIngestionService documentIngestionService;

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

    @DeleteMapping("/ingest/{bookId}")
    public ResponseEntity<String> deleteBookVectors(@PathVariable UUID bookId) {
        documentIngestionService.deleteBookVectors(bookId);
        return ResponseEntity.ok("Book vectors deleted successfully.");
    }
}
