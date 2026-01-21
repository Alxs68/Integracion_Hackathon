package com.sentiment.api.dto;

import java.util.List;
import java.util.Map;

public record SentimentStats(
                long totalAnalisis,
                Map<String, Long> conteoPorSentimiento,
                List<KeywordStats> topPalabrasClave,
                Map<String, List<Long>> confidenceBinsBySentiment,
                List<PhraseStats> topPositiveFeatures,
                List<PhraseStats> topNegativeFeatures,
                List<PhraseStats> topGlobalCriticalFeatures,
                BoxPlotStats positiveBoxPlot,
                BoxPlotStats negativeBoxPlot) {

        public record PhraseStats(String phrase, long count) {
        }

        public record KeywordStats(
                        String word,
                        long count,
                        long positive,
                        long neutral,
                        long negative) {
        }

        public record BoxPlotStats(
                        double min,
                        double q1,
                        double median,
                        double q3,
                        double max) {
        }
}
