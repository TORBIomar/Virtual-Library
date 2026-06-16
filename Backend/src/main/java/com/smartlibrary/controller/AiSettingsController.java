package com.smartlibrary.controller;

import com.smartlibrary.dto.AiSettingsRequest;
import com.smartlibrary.dto.AiSettingsResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/ai-settings")
@RequiredArgsConstructor
@Slf4j
public class AiSettingsController {

    @Value("${spring.ai.google.genai.api-key:}")
    private String currentApiKey;

    @Value("${spring.ai.google.genai.chat.options.model:gemini-2.5-flash}")
    private String currentModel;

    @Value("${spring.ai.google.genai.chat.options.temperature:0.7}")
    private Double currentTemperature;

    @Value("${spring.ai.google.genai.embedding.model:text-embedding-004}")
    private String embeddingModel;

    @GetMapping
    public ResponseEntity<AiSettingsResponse> getSettings() {
        String masked = maskApiKey(currentApiKey);
        return ResponseEntity.ok(AiSettingsResponse.builder()
                .apiKeyMasked(masked)
                .model(currentModel)
                .temperature(currentTemperature)
                .embeddingModel(embeddingModel)
                .build());
    }

    @PutMapping
    public ResponseEntity<AiSettingsResponse> updateSettings(@RequestBody AiSettingsRequest request) {
        if (request.getApiKey() != null && !request.getApiKey().isBlank()) {
            currentApiKey = request.getApiKey();
            System.setProperty("spring.ai.google.genai.api-key", currentApiKey);
            System.setProperty("spring.ai.google.genai.embedding.api-key", currentApiKey);
            log.info("AI API key updated by admin.");
        }
        if (request.getModel() != null && !request.getModel().isBlank()) {
            currentModel = request.getModel();
            System.setProperty("spring.ai.google.genai.chat.options.model", currentModel);
            log.info("AI model changed to: {}", currentModel);
        }
        if (request.getTemperature() != null) {
            currentTemperature = request.getTemperature();
            System.setProperty("spring.ai.google.genai.chat.options.temperature", String.valueOf(currentTemperature));
            log.info("AI temperature set to: {}", currentTemperature);
        }

        String masked = maskApiKey(currentApiKey);
        return ResponseEntity.ok(AiSettingsResponse.builder()
                .apiKeyMasked(masked)
                .model(currentModel)
                .temperature(currentTemperature)
                .embeddingModel(embeddingModel)
                .build());
    }

    private String maskApiKey(String key) {
        if (key == null || key.length() < 8) return "••••••••";
        return key.substring(0, 4) + "••••••••" + key.substring(key.length() - 4);
    }
}
