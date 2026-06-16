package com.smartlibrary.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AiSettingsResponse {
    private String apiKeyMasked;
    private String model;
    private Double temperature;
    private String embeddingModel;
}
