package com.sentiment.api.service;

import com.sentiment.api.entity.SentimentAnalysis;
import com.sentiment.api.integration.client.MlClient;
import com.sentiment.api.dto.SentimentResponse;
import com.sentiment.api.integration.client.dto.MlSentimentResponse;
import com.sentiment.api.repository.SentimentAnalysisRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.time.LocalDateTime;

@Service
public class SentimentService {

    private final MlClient mlClient;
    private final SentimentAnalysisRepository repository;

    public SentimentService(MlClient mlClient, SentimentAnalysisRepository repository) {

        this.mlClient = mlClient;
        this.repository = repository;
    }

    public SentimentResponse analyze(String text) {
        MlSentimentResponse response = mlClient.predict(text);
        SentimentAnalysis entity = new SentimentAnalysis();

        entity.setText(text);
        entity.setPrevision(response.prevision());
        entity.setProbabilidad(response.probabilidad());
        entity.setFecha(LocalDateTime.now());

        repository.save(entity);

        return new SentimentResponse(
                response.prevision(),
                response.probabilidad()
        );
    }
    public List<SentimentAnalysis> getByPrevision(String prevision) {
        return repository.findByPrevision(prevision);
    }

    public SentimentAnalysis getByid(Long id){
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("No encontrado"));
    }
}