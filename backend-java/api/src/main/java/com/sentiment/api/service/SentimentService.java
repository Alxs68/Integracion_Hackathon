package com.sentiment.api.service;

import com.sentiment.api.entity.SentimentAnalysis;
import com.sentiment.api.repository.SentimentAnalysisRepository;
import com.sentiment.api.integration.client.MlClient;
import com.sentiment.api.dto.SentimentResponse;
import com.sentiment.api.integration.client.dto.MlSentimentResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

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

        repository.save(entity);

        // Retornar respuesta
        return new SentimentResponse(
                mlResponse.prevision(),
                mlResponse.probabilidad(),
                mlResponse.top_features());
    }

    public java.util.List<SentimentAnalysis> findPaginated(int page) {
        return repository.findAll(PageRequest.of(page, 20, Sort.by("fecha").descending())).getContent();
    }

    public java.util.List<SentimentAnalysis> findLatest() {
        return repository.findTop5ByOrderByFechaDesc();
    }

    public com.sentiment.api.dto.SentimentStats getStats() {
        java.util.List<SentimentAnalysis> all = repository.findAll();

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

        // Ordenar y limitar a las top 10 palabras más frecuentes, y convertir a
        // KeywordStats
        java.util.List<com.sentiment.api.dto.SentimentStats.KeywordStats> topKeywords = keywordDetails.entrySet()
                .stream()
                .map(e -> {
                    String word = e.getKey();
                    java.util.Map<String, Long> rawCounts = e.getValue();
                    long totalWord = rawCounts.values().stream().mapToLong(Long::longValue).sum();

                    java.util.Map<String, Long> lowerCounts = new java.util.HashMap<>();
                    rawCounts.forEach((k, v) -> lowerCounts.put(k.toLowerCase(), v));

                    long pos = lowerCounts.getOrDefault("positivo", 0L);
                    long neg = lowerCounts.getOrDefault("negativo", 0L);
                    long neu = lowerCounts.getOrDefault("neutral", 0L) + lowerCounts.getOrDefault("neutro", 0L);

                    return new com.sentiment.api.dto.SentimentStats.KeywordStats(
                            word, totalWord, pos, neu, neg);
                })
                .sorted(java.util.Comparator.comparing(com.sentiment.api.dto.SentimentStats.KeywordStats::count)
                        .reversed())
                .limit(10)
                .collect(java.util.stream.Collectors.toList());

        // Calcular Bins de Confianza por Sentimiento (Histograma apilado)
        java.util.Map<String, java.util.List<Long>> confidenceBinsBySentiment = new java.util.HashMap<>();
        confidenceBinsBySentiment.put("Positivo", new java.util.ArrayList<>(java.util.Collections.nCopies(10, 0L)));
        confidenceBinsBySentiment.put("Neutral", new java.util.ArrayList<>(java.util.Collections.nCopies(10, 0L)));
        confidenceBinsBySentiment.put("Negativo", new java.util.ArrayList<>(java.util.Collections.nCopies(10, 0L)));

        for (SentimentAnalysis entry : all) {
            double prob = entry.getProbabilidad();
            String sentimiento = entry.getPrevision();
            if (sentimiento.equalsIgnoreCase("Neutro"))
                sentimiento = "Neutral"; // Normalizar

            int bin = (int) Math.floor(prob * 10);
            if (bin > 9)
                bin = 9;
            if (bin < 0)
                bin = 0;

            if (confidenceBinsBySentiment.containsKey(sentimiento)) {
                java.util.List<Long> bins = confidenceBinsBySentiment.get(sentimiento);
                bins.set(bin, bins.get(bin) + 1);
            }
        }

        // Calcular Top Features Positivas y Negativas Globales
        java.util.Map<String, Long> posFeatures = new java.util.HashMap<>();
        java.util.Map<String, Long> negFeatures = new java.util.HashMap<>();

        for (SentimentAnalysis entry : all) {
            String features = entry.getTopFeatures();
            String sentiment = entry.getPrevision();
            if (features != null && !features.isEmpty()) {
                String[] tokens = features.split("\\|");
                for (String token : tokens) {
                    String cleanToken = token.trim().toLowerCase();
                    if (cleanToken.length() >= 3) {
                        if (sentiment.equalsIgnoreCase("positivo")) {
                            posFeatures.merge(cleanToken, 1L, Long::sum);
                        } else if (sentiment.equalsIgnoreCase("negativo")) {
                            negFeatures.merge(cleanToken, 1L, Long::sum);
                        }
                    }
                }
            }
        }

        java.util.List<com.sentiment.api.dto.SentimentStats.PhraseStats> topPosFeatures = posFeatures.entrySet()
                .stream()
                .sorted(java.util.Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(10)
                .map(e -> new com.sentiment.api.dto.SentimentStats.PhraseStats(e.getKey(), e.getValue()))
                .collect(java.util.stream.Collectors.toList());

        java.util.List<com.sentiment.api.dto.SentimentStats.PhraseStats> topNegFeatures = negFeatures.entrySet()
                .stream()
                .sorted(java.util.Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(10)
                .map(e -> new com.sentiment.api.dto.SentimentStats.PhraseStats(e.getKey(), e.getValue()))
                .collect(java.util.stream.Collectors.toList());

        // Calcular Top Features CRÍTICAS Globales (Frecuencia en vetos >= 99%)
        java.util.Map<String, Long> critFeatures = new java.util.HashMap<>();
        for (SentimentAnalysis entry : all) {
            String features = entry.getTopFeatures();
            if (entry.getPrevision().equalsIgnoreCase("negativo") && entry.getProbabilidad() >= 0.99) {
                if (features != null && !features.isEmpty()) {
                    String[] tokens = features.split("\\|");
                    for (String token : tokens) {
                        String cleanToken = token.trim().toLowerCase();
                        if (cleanToken.length() >= 3) {
                            critFeatures.merge(cleanToken, 1L, Long::sum);
                        }
                    }
                }
            }
        }

        java.util.List<com.sentiment.api.dto.SentimentStats.PhraseStats> topCritFeatures = critFeatures.entrySet()
                .stream()
                .sorted(java.util.Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(7)
                .map(e -> new com.sentiment.api.dto.SentimentStats.PhraseStats(e.getKey(), e.getValue()))
                .collect(java.util.stream.Collectors.toList());

        // Calcular BoxPlot Stats for Positive and Negative probabilities
        java.util.List<Double> positiveProbs = new java.util.ArrayList<>();
        java.util.List<Double> negativeProbs = new java.util.ArrayList<>();

        for (SentimentAnalysis entry : all) {
            if (entry.getPrevision().equalsIgnoreCase("positivo")) {
                positiveProbs.add(entry.getProbabilidad());
            } else if (entry.getPrevision().equalsIgnoreCase("negativo")) {
                negativeProbs.add(entry.getProbabilidad());
            }
        }

        com.sentiment.api.dto.SentimentStats.BoxPlotStats posBoxPlot = calculateBoxPlotStats(positiveProbs);
        com.sentiment.api.dto.SentimentStats.BoxPlotStats negBoxPlot = calculateBoxPlotStats(negativeProbs);

        return new com.sentiment.api.dto.SentimentStats(total, counts, topKeywords, confidenceBinsBySentiment,
                topPosFeatures, topNegFeatures, topCritFeatures, posBoxPlot, negBoxPlot);
    }

    public void seedData() {
        String[] phrases = {
                "Excelente servicio y atención impecable",
                "El hotel estaba sucio y olía a cloaca, fatal",
                "Una experiencia aceptable, el wifi funcionaba bien",
                "Estafa total, la habitación no existía al llegar",
                "Muy cómodo y bien ubicado, volvería sin duda",
                "Atención de mierda, el personal fue grosero",
                "Todo bien, lo esperado para el precio",
                "Increíble vista, pero el cuarto era diminuto",
                "Pretencioso y caro para la calidad que ofrecen",
                "Limpieza perfecta y staff muy amable",
                "Instalaciones viejas y descuidadas, no lo recomiendo",
                "Desayuno delicioso y variado cada mañana",
                "Ruidos molestos toda la noche, imposible descansar",
                "Ubicación privilegiada en el corazón de la ciudad",
                "El aire acondicionado no funcionaba, calor insoportable",
                "Piscina descuidada y con exceso de cloro",
                "El servicio a la habitación fue rapidísimo",
                "Camas duras como una piedra, dormí fatal",
                "Vistas al mar espectaculares desde el balcón",
                "Check-in lento y recepción desorganizada",
                "Un oasis de paz y tranquilidad absoluto",
                "Olor a cigarrillo en una habitación de no fumadores",
                "Personal de limpieza muy eficiente y educado",
                "Gimnasio moderno y bien equipado",
                "El bar de la terraza tiene cócteles increíbles"
        };

        String[] sentiments = {
                "Positivo", "Negativo", "Neutral", "Negativo", "Positivo",
                "Negativo", "Neutral", "Neutral", "Negativo", "Positivo",
                "Negativo", "Positivo", "Negativo", "Positivo", "Negativo",
                "Negativo", "Positivo", "Negativo", "Positivo", "Negativo",
                "Positivo", "Negativo", "Positivo", "Positivo", "Positivo"
        };
        double[] probs = {
                0.98, 0.95, 0.6, 0.99, 0.92,
                0.97, 0.55, 0.65, 0.88, 0.94,
                0.91, 0.96, 0.93, 0.99, 0.95,
                0.85, 0.98, 0.92, 0.99, 0.94,
                0.99, 0.91, 0.96, 0.97, 0.98
        };
        String[] feats = {
                "excelente | atención", "sucio | cloaca", "aceptable | wifi", "estafa | no existía",
                "cómodo | ubicado", "mierda | grosero", "bien | precio", "increíble | diminuto",
                "caro | calidad", "perfecta | amable", "viejas | descuidadas", "desayuno | delicioso",
                "ruidos | noche", "ubicación | privilegiada", "aire | calor",
                "piscina | cloro", "servicio | rápido", "camas | piedra", "vistas | mar", "lento | desorganizada",
                "paz | tranquilidad", "olor | cigarrillo", "eficiente | educado", "gimnasio | moderno",
                "terraza | cócteles"
        };

        java.util.Random random = new java.util.Random();
        for (int i = 0; i < 300; i++) {
            SentimentAnalysis entry = new SentimentAnalysis();
            int idx = random.nextInt(phrases.length);
            entry.setText(phrases[idx]);
            entry.setPrevision(sentiments[idx]);
            entry.setProbabilidad(probs[idx]);
            entry.setTopFeatures(feats[idx]);

            // Random date in the last 90 days (3 months)
            entry.setFecha(java.time.LocalDateTime.now().minusDays(random.nextInt(90)));
            repository.save(entry);
        }
    }

    private com.sentiment.api.dto.SentimentStats.BoxPlotStats calculateBoxPlotStats(java.util.List<Double> values) {
        if (values == null || values.isEmpty()) {
            return new com.sentiment.api.dto.SentimentStats.BoxPlotStats(0, 0, 0, 0, 0);
        }
        java.util.Collections.sort(values);
        double min = values.get(0);
        double max = values.get(values.size() - 1);
        double median = getPercentile(values, 50);
        double q1 = getPercentile(values, 25);
        double q3 = getPercentile(values, 75);
        return new com.sentiment.api.dto.SentimentStats.BoxPlotStats(min, q1, median, q3, max);
    }

    private double getPercentile(java.util.List<Double> sortedValues, double percentile) {
        int index = (int) Math.ceil(percentile / 100.0 * sortedValues.size()) - 1;
        if (index < 0)
            index = 0;
        return sortedValues.get(index);
    }
}
