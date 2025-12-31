package com.sentiment.api.integration.client.dto;

public record MlSentimentResponse(
        String prediction,
        double probability
) {}
