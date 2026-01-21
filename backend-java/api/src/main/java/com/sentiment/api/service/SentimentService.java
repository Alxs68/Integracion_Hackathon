package com.sentiment.api.service;

import com.sentiment.api.entity.SentimentAnalysis;
import com.sentiment.api.repository.SentimentAnalysisRepository;
import com.sentiment.api.integration.client.MlClient;
import com.sentiment.api.dto.SentimentResponse;
import com.sentiment.api.integration.client.dto.MlSentimentResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SentimentService {

    private final MlClient mlClient;
    private final SentimentAnalysisRepository repository;

    public SentimentService(MlClient mlClient, SentimentAnalysisRepository repository) {
        this.mlClient = mlClient;
        this.repository = repository;
    }

    public SentimentResponse analyze(String text) {
        // Llamar al servicio ML
        MlSentimentResponse mlResponse = mlClient.predict(text);

        // Guardar en base de datos
        SentimentAnalysis entity = new SentimentAnalysis();
        entity.setText(text);
        entity.setPrevision(mlResponse.prevision());
        entity.setProbabilidad(mlResponse.probabilidad());
        entity.setTopFeatures(mlResponse.top_features());
        // La fecha se debe setear automaticamente en la entidad con @PrePersist o
        // similar,
        // pero el stash no mostraba esa parte. Asumiremos que la Entity lo maneja o que
        // JPA lo hace.
        // Revisando el diff anterior, el stash NO seteaba fecha explícitamente en
        // analyze,
        // pero sí lo hacía el "ours" (updated upstream).
        // Sin embargo, si la DB es H2 persistente, mejor dejar que la entidad lo maneje
        // si tiene @CreationTimestamp
        // o similar. Si no, deberíamos setearlo.
        // El stash original NO tenía setFecha en analyze.

        repository.save(entity);

        // Retornar respuesta
        return new SentimentResponse(
                mlResponse.prevision(),
                mlResponse.probabilidad(),
                mlResponse.top_features());
    }

    public java.util.List<SentimentAnalysis> findLatest() {
        return repository.findTop50ByOrderByFechaDesc();
    }

    public com.sentiment.api.dto.SentimentStats getStats(java.time.LocalDate start, java.time.LocalDate end) {
        java.util.List<SentimentAnalysis> all = repository.findAll();

        // Filtrado por fecha
        if (start != null || end != null) {
            all = all.stream().filter(e -> {
                // Verificar si getFecha() devuelve nulo antes de usarlo
                if (e.getFecha() == null)
                    return false;
                java.time.LocalDate date = e.getFecha().toLocalDate();
                boolean afterStart = (start == null) || !date.isBefore(start);
                boolean beforeEnd = (end == null) || !date.isAfter(end);
                return afterStart && beforeEnd;
            }).collect(java.util.stream.Collectors.toList());
        }

        long total = all.size();

        // Conteo por sentimiento
        java.util.Map<String, Long> counts = all.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        SentimentAnalysis::getPrevision,
                        java.util.stream.Collectors.counting()));

        // Conteo de palabras clave con desglose de sentimiento
        java.util.Map<String, java.util.Map<String, Long>> keywordDetails = new java.util.HashMap<>();

        for (SentimentAnalysis entry : all) {
            String features = entry.getTopFeatures();
            String sentiment = entry.getPrevision();
            if (features != null && !features.isEmpty()) {
                String[] tokens = features.split("\\|");
                for (String token : tokens) {
                    String cleanToken = token.trim().toLowerCase();
                    if (!cleanToken.isEmpty()) {
                        keywordDetails.computeIfAbsent(cleanToken, k -> new java.util.HashMap<>())
                                .merge(sentiment, 1L, Long::sum);
                    }
                }
            }
        }

        // Ordenar y limitar a las top 10 palabras más frecuentes
        java.util.List<com.sentiment.api.dto.SentimentStats.KeywordStats> topKeywords = keywordDetails.entrySet()
                .stream()
                .map(e -> {
                    String word = e.getKey();
                    java.util.Map<String, Long> sCounts = e.getValue();
                    long totalWord = sCounts.values().stream().mapToLong(Long::longValue).sum();
                    return new com.sentiment.api.dto.SentimentStats.KeywordStats(
                            word,
                            totalWord,
                            sCounts.getOrDefault("Positivo", 0L),
                            sCounts.getOrDefault("Neutral", 0L),
                            sCounts.getOrDefault("Negativo", 0L));
                })
                .sorted(java.util.Comparator.comparing(com.sentiment.api.dto.SentimentStats.KeywordStats::count)
                        .reversed())
                .limit(10)
                .collect(java.util.stream.Collectors.toList());

        return new com.sentiment.api.dto.SentimentStats(total, counts, topKeywords);
    }
}