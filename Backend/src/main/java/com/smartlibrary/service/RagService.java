package com.smartlibrary.service;

import com.smartlibrary.dto.AiChatRequest;
import com.smartlibrary.dto.AiChatResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
public class RagService {

    private final VectorStore vectorStore;
    private final ChatClient chatClient;

    public RagService(Optional<VectorStore> vectorStore, ChatClient chatClient) {
        this.vectorStore = vectorStore.orElse(null);
        this.chatClient = chatClient;
    }

    public AiChatResponse chatWithContext(AiChatRequest request) {
        String question = request.getQuestion();
        if (question == null || question.trim().isEmpty()) {
            return AiChatResponse.builder()
                    .answer("Please ask a question.")
                    .sources(new ArrayList<>())
                    .build();
        }

        log.info("Processing RAG query: '{}' (bookId: {})", question, request.getBookId());

        // 1. Perform similarity search in ChromaDB
        SearchRequest.Builder builder = SearchRequest.builder()
                .query(question)
                .topK(5);

        if (request.getBookId() != null) {
            builder.filterExpression(
                    new FilterExpressionBuilder().eq("bookId", request.getBookId().toString()).build()
            );
        }

        SearchRequest searchRequest = builder.build();

        List<Document> matchedDocuments = new ArrayList<>();
        if (vectorStore != null) {
            try {
                matchedDocuments = vectorStore.similaritySearch(searchRequest);
                log.info("Retrieved {} matches from ChromaDB.", matchedDocuments.size());
            } catch (Exception e) {
                log.error("Failed to search ChromaDB vector store. Proceeding without context.", e);
            }
        } else {
            log.info("VectorStore is not configured. Proceeding without context.");
        }

        // 2. Prepare context text and sources list
        StringBuilder contextBuilder = new StringBuilder();
        List<String> sources = new ArrayList<>();

        if (!matchedDocuments.isEmpty()) {
            for (int i = 0; i < matchedDocuments.size(); i++) {
                Document doc = matchedDocuments.get(i);
                String title = (String) doc.getMetadata().getOrDefault("bookTitle", "Unknown Book");
                String author = (String) doc.getMetadata().getOrDefault("author", "Unknown Author");
                String sourceInfo = String.format("'%s' by %s", title, author);
                if (!sources.contains(sourceInfo)) {
                    sources.add(sourceInfo);
                }

                contextBuilder.append(String.format("[%d] Source: %s\nContent: %s\n\n", 
                        i + 1, sourceInfo, doc.getText()));
            }
        } else {
            contextBuilder.append("No context found from books in the library. Answer using your general knowledge, but mention that you couldn't find matches in the current library books.");
        }

        // 3. Format chat history if provided
        StringBuilder historyBuilder = new StringBuilder();
        if (request.getChatHistory() != null && !request.getChatHistory().isEmpty()) {
            historyBuilder.append("Here is the chat history for context:\n");
            for (String message : request.getChatHistory()) {
                historyBuilder.append("- ").append(message).append("\n");
            }
            historyBuilder.append("\n");
        }

        // 4. Construct System Prompt
        String systemPrompt = String.format(
                "You are \"ZenShelf AI\", a helpful and knowledgeable reading companion for the Smart Library system.\n" +
                "Your goal is to answer questions about books using the context provided below.\n\n" +
                "CONTEXT FROM BOOKS:\n" +
                "---------------------\n" +
                "%s" +
                "---------------------\n\n" +
                "%s" +
                "GUIDELINES:\n" +
                "- Ground your answers strictly in the context if possible.\n" +
                "- If the context has details, cite the source name/author (e.g. \"According to 'Book Title' by Author...\").\n" +
                "- If the context does not contain the answer, you can use your general knowledge, but be transparent that the book context doesn't specify it.\n" +
                "- Keep a friendly, literary, and helpful tone.",
                contextBuilder.toString(),
                historyBuilder.toString()
        );

        // 5. Call Google Gemini LLM via ChatClient
        String answer = "";
        try {
            answer = chatClient.prompt()
                    .system(systemPrompt)
                    .user(question)
                    .call()
                    .content();
        } catch (Exception e) {
            log.error("Failed to get response from Gemini model", e);
            answer = "Sorry, I encountered an error communicating with the AI service. Please verify your Gemini API key: " + e.getMessage();
        }

        return AiChatResponse.builder()
                .answer(answer)
                .sources(sources)
                .build();
    }
}
