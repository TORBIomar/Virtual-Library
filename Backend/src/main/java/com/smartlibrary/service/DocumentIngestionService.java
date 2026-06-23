package com.smartlibrary.service;

import com.smartlibrary.entity.Book;
import com.smartlibrary.exception.ResourceNotFoundException;
import com.smartlibrary.repository.BookRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.tika.TikaDocumentReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.core.io.FileSystemResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
public class DocumentIngestionService {

    private final VectorStore vectorStore;
    private final BookRepository bookRepository;

    public DocumentIngestionService(Optional<VectorStore> vectorStore, BookRepository bookRepository) {
        this.vectorStore = vectorStore.orElse(null);
        this.bookRepository = bookRepository;
    }

    @Transactional(readOnly = true)
    public void ingestBook(UUID bookId) {
        if (vectorStore == null) {
            log.warn("VectorStore is not available. Skipping ingestion for book: {}", bookId);
            return;
        }

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book", "id", bookId));

        log.info("Starting ingestion for book: {} (ID: {})", book.getTitle(), bookId);

        // Delete existing vectors for this book first to prevent duplicates
        deleteBookVectors(bookId);

        String filePath = book.getFilePath();
        if (filePath != null && !filePath.trim().isEmpty()) {
            File file = new File(filePath);
            if (file.exists() && file.isFile()) {
                try {
                    FileSystemResource resource = new FileSystemResource(file);
                    TikaDocumentReader reader = new TikaDocumentReader(resource);
                    List<Document> documents = reader.read();

                    TokenTextSplitter splitter = new TokenTextSplitter();
                    List<Document> splitDocs = splitter.apply(documents);

                    for (Document doc : splitDocs) {
                        Map<String, Object> metadata = doc.getMetadata();
                        if (metadata == null) {
                            metadata = new HashMap<>();
                        }
                        metadata.put("bookId", bookId.toString());
                        metadata.put("bookTitle", book.getTitle());
                        metadata.put("author", book.getAuthor());
                        metadata.put("category", book.getCategory());
                    }

                    log.info("Adding {} vector chunks for book: {}", splitDocs.size(), book.getTitle());
                    vectorStore.add(splitDocs);
                    return;
                } catch (Exception e) {
                    log.error("Failed to parse book file: " + filePath + ". Falling back to summary ingestion.", e);
                }
            } else {
                log.warn("Book file not found at path: {}. Falling back to summary ingestion.", filePath);
            }
        } else {
            log.info("No file path specified for book: {}. Falling back to summary ingestion.", book.getTitle());
        }

        // Fallback: Ingest metadata and summary
        String fallbackText = String.format("Title: %s\nAuthor: %s\nCategory: %s\nSummary: %s",
                book.getTitle(), book.getAuthor(), book.getCategory(),
                book.getSummary() != null ? book.getSummary() : "No summary available.");

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("bookId", bookId.toString());
        metadata.put("bookTitle", book.getTitle());
        metadata.put("author", book.getAuthor());
        metadata.put("category", book.getCategory());

        Document fallbackDoc = new Document(fallbackText, metadata);
        log.info("Adding summary vector for book: {}", book.getTitle());
        vectorStore.add(List.of(fallbackDoc));
    }

    public void deleteBookVectors(UUID bookId) {
        if (vectorStore == null) {
            log.warn("VectorStore is not available. Skipping vector deletion for book: {}", bookId);
            return;
        }
        log.info("Deleting existing vectors for book ID: {}", bookId);
        try {
            vectorStore.delete(new FilterExpressionBuilder().eq("bookId", bookId.toString()).build());
        } catch (Exception e) {
            log.error("Error deleting vectors for book ID: " + bookId, e);
        }
    }
}

