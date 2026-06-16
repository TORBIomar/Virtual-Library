package com.smartlibrary.dto;

import lombok.Data;

@Data
public class AiSettingsRequest {
    private String apiKey;
    private String model;
    private Double temperature;
}
