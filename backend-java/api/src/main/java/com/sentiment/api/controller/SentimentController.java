package com.sentiment.api.controller;

import com.sentiment.api.service.SentimentService;
import com.sentiment.api.dto.SentimentRequest;
import com.sentiment.api.dto.SentimentResponse;
import com.sentiment.api.dto.SentimentStats;
import com.sentiment.api.entity.SentimentAnalysis;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class SentimentController {

    private final SentimentService sentimentService;

    public SentimentController(SentimentService sentimentService) {
        this.sentimentService = sentimentService;
    }

    /**
     * Punto de entrada público.
     * Aquí recibimos el texto y se lo pasamos al servicio para que lo analice.
     */
    @PostMapping("/sentiment")
    public SentimentResponse sentiment(@Valid @RequestBody SentimentRequest request) {
        return sentimentService.analyze(request.text());
    }

    /**
     * Nos devuelve los últimos 20 análisis que hemos guardado.
     */
    @GetMapping("/api/history")
    public List<SentimentAnalysis> getHistory(@RequestParam(defaultValue = "0") int page) {
        return sentimentService.findPaginated(page);
    }

    /**
     * Calcula las estadísticas para mostrar en el Dashboard (Gráficos).
     */
    @GetMapping("/api/stats")
    public SentimentStats getStats() {
        return sentimentService.getStats();
    }

    @GetMapping("/api/seed")
    public String seed() {
        sentimentService.seedData();
        return "Datos de prueba cargados correctamente";
    }
}
