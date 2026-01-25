package com.sentiment.api.dto;

public record SentimentResponse(
        Long id,
        String prevision,
        Double probabilidad,
        String top_features,
        String etiqueta,
        String riesgo) {
}
