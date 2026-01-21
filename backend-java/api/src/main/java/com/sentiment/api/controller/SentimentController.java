package com.sentiment.api.controller;

import com.sentiment.api.service.SentimentService;
import com.sentiment.api.dto.SentimentRequest;
import com.sentiment.api.dto.SentimentResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.util.List;

@RestController
@CrossOrigin(origins = "*") // Critical for frontend (usually on port 5500 or just generic local access)
public class SentimentController {

    private final SentimentService sentimentService;

    public SentimentController(SentimentService sentimentService) {
        this.sentimentService = sentimentService;
    }

    /**
     * Endpoint PRINCIPAL para análisis de sentimiento.
     * Mapeado a "/sentiment" para coincidir con app.js (DEV_BACKEND)
     */
    @PostMapping("/sentiment")
    public SentimentResponse sentiment(@Valid @RequestBody SentimentRequest request) {
        return sentimentService.analyze(request.text());
    }

    /**
     * HISTORIAL: Devuelve los últimos 50 análisis.
     * Mapeado a "/api/history" (ver app.js)
     */
    @GetMapping("/api/history")
    public java.util.List<com.sentiment.api.entity.SentimentAnalysis> getHistory() {
        return sentimentService.findLatest();
    }

    /**
     * ESTADISTICAS: Devuelve métricas para el Dashboard.
     * Mapeado a "/api/stats" (ver app.js)
     */
    @GetMapping("/api/stats")
    public com.sentiment.api.dto.SentimentStats getStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return sentimentService.getStats(start, end);
    }
}
