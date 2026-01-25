package com.sentiment.api.service;

import com.sentiment.api.repository.SentimentAnalysisRepository;
import com.sentiment.api.dto.SentimentRequest;
import com.sentiment.api.dto.SentimentResponse;
import com.sentiment.api.entity.SentimentAnalysis;
import com.sentiment.api.dto.SentimentStats;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Sentiment Analysis Logic Service
 * 
 * Traceability & Authorship:
 * - Database Architecture: Lorena (G68)
 * - API Integration: Lorena (G68)
 * - Advanced Logic Refactor: Antigravity Agent
 */
@Service
public class SentimentService {
    private final SentimentAnalysisRepository repository;
    private final RestTemplate restTemplate;
    private final String PYTHON_URL = "http://localhost:8080/predict/sentiment";

    public SentimentService(SentimentAnalysisRepository repository, RestTemplate restTemplate) {
        this.repository = repository;
        this.restTemplate = restTemplate;
    }

    public SentimentResponse analyze(SentimentRequest request) {
        // 1. Call Python Engine
        SentimentResponse pythonResponse = restTemplate.postForObject(PYTHON_URL, request, SentimentResponse.class);

        if (pythonResponse != null) {
            // 2. Save to DB
            SentimentAnalysis entity = new SentimentAnalysis();
            entity.setText(request.text());
            entity.setPrevision(pythonResponse.prevision());
            entity.setProbabilidad(pythonResponse.probabilidad());
            entity.setTopFeatures(pythonResponse.top_features());
            entity.setEtiqueta(pythonResponse.etiqueta()); // Missing Link Fix
            entity.setRiesgo(pythonResponse.riesgo()); // Missing Link Fix
            entity.setFecha(LocalDateTime.now());

            SentimentAnalysis saved = repository.save(entity);

            // 3. Return response with generated ID
            return new SentimentResponse(
                    saved.getId(),
                    saved.getPrevision(),
                    saved.getProbabilidad(),
                    saved.getTopFeatures(),
                    saved.getEtiqueta(),
                    saved.getRiesgo());
        }
        return null;
    }

    public Page<SentimentAnalysis> getHistory(int page, int size) {
        return repository.findAllByOrderByFechaDesc(org.springframework.data.domain.PageRequest.of(page, size));
    }

    public void updateFeedback(Long id, String feedback) {
        repository.findById(id).ifPresent(entity -> {
            entity.setFeedback(feedback);
            repository.save(entity);
        });
    }

    public SentimentStats getStats() {
        List<SentimentAnalysis> all = repository.findAll();
        long total = all.size();

        // Count by Sentiment
        Map<String, Long> counts = new HashMap<>();
        counts.put("Positivo", all.stream().filter(
                a -> "Positivo".equalsIgnoreCase(a.getPrevision()) || "Positive".equalsIgnoreCase(a.getPrevision()))
                .count());
        counts.put("Negativo", all.stream().filter(
                a -> "Negativo".equalsIgnoreCase(a.getPrevision()) || "Negative".equalsIgnoreCase(a.getPrevision()))
                .count());
        counts.put("Neutral", all.stream().filter(
                a -> "Neutral".equalsIgnoreCase(a.getPrevision()) || "Neutro".equalsIgnoreCase(a.getPrevision()))
                .count());

        // Simple Keyword logic (parsing topFeatures string)
        List<SentimentStats.KeywordStats> keywords = new ArrayList<>();
        // Note: Real keyword extraction would require more complex parsing of the
        // 'topFeatures' string
        // which might look like "word1, word2". aggregated here for demo if possible,
        // or empty.

        // KPIs G68
        double totalD = (double) total;
        double pos = (double) counts.getOrDefault("Positivo", 0L);
        double neu = (double) counts.getOrDefault("Neutral", 0L);
        double neg = (double) counts.getOrDefault("Negativo", 0L);

        // 1. Criticidad: % Negativos / Total
        double criticidad = (total > 0) ? (neg / totalD) * 100.0 : 0.0;

        // 2. Salud (Formula G68): (10*Pos + 5*Neu + 0*Neg) / Total
        // Scale 0-10
        double salud = (total > 0) ? ((10.0 * pos) + (5.0 * neu)) / totalD : 0.0;

        // 3. Embajadores: % "Cliente Muy Satisfecho"
        long verySatisfiedCount = all.stream()
                .filter(a -> "Cliente Muy Satisfecho".equalsIgnoreCase(a.getEtiqueta()))
                .count();
        double embajadores = (total > 0) ? ((double) verySatisfiedCount / totalD) * 100.0 : 0.0;


        // Logic to extract top features
        // Helper function (map String -> count)
        Map<String, Long> posFreq = new HashMap<>();
        Map<String, Long> negFreq = new HashMap<>();
        Map<String, Long> critFreq = new HashMap<>();

        for (SentimentAnalysis a : all) {
            String features = a.getTopFeatures();
            if (features == null || features.isEmpty()) continue;
            
            String[] words = features.split("\\|");
            
            boolean isPos = "Positivo".equalsIgnoreCase(a.getPrevision()) || "Positive".equalsIgnoreCase(a.getPrevision());
            boolean isNeg = "Negativo".equalsIgnoreCase(a.getPrevision()) || "Negative".equalsIgnoreCase(a.getPrevision());
            boolean isCrit = (a.getRiesgo() != null && !a.getRiesgo().isEmpty());

            for (String w : words) {
                String clean = w.trim();
                if (clean.length() < 3) continue;
                if (clean.equalsIgnoreCase("análisis contextual")) continue;

                if (isPos) posFreq.put(clean, posFreq.getOrDefault(clean, 0L) + 1);
                if (isNeg) negFreq.put(clean, negFreq.getOrDefault(clean, 0L) + 1);
                if (isCrit) critFreq.put(clean, critFreq.getOrDefault(clean, 0L) + 1);
            }
        }

        // Convert and Sort Helper
        java.util.function.Function<Map<String, Long>, List<SentimentStats.PhraseStats>> toSortedList = (map) -> {
            return map.entrySet().stream()
                    .sorted((e1, e2) -> e2.getValue().compareTo(e1.getValue())) // Descending
                    .limit(5)
                    .map(e -> new SentimentStats.PhraseStats(e.getKey(), e.getValue()))
                    .collect(java.util.stream.Collectors.toList());
        };

        List<SentimentStats.PhraseStats> topPos = toSortedList.apply(posFreq);
        List<SentimentStats.PhraseStats> topNeg = toSortedList.apply(negFreq);
        List<SentimentStats.PhraseStats> topCrit = toSortedList.apply(critFreq);

        return new SentimentStats(
                total,
                counts,
                keywords, // keywords
                new HashMap<>(), // confidenceBins
                topPos, // topPositive
                topNeg, // topNegative
                topCrit, // topCritical
                criticidad, // Added
                salud, // Added
                embajadores, // Added
                null, // posBoxPlot
                null // negBoxPlot
        );
    }

    public void resetDatabase() {
        repository.deleteAll();
    }
}
