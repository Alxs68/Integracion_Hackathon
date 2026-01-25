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
import java.util.stream.Collectors;

@Service
public class SentimentService {
    private final SentimentAnalysisRepository repository;
    private final RestTemplate restTemplate;
    private final String PYTHON_URL = "http://localhost:8080/predict";

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

        return new SentimentStats(
                total,
                counts,
                keywords, // keywords
                new HashMap<>(), // confidenceBins
                new ArrayList<>(), // topPositive
                new ArrayList<>(), // topNegative
                new ArrayList<>(), // topCritical
                criticidad, // Added
                salud, // Added
                embajadores, // Added
                null, // posBoxPlot
                null // negBoxPlot
        );
    }
}
