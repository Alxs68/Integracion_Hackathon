package com.sentiment.api.service;

import com.sentiment.api.client.MlClient;
import com.sentiment.api.dto.SentimentResponse;
import org.springframework.stereotype.Service;

@Service
public class SentimentService {

    private final MlClient mlClient;

    public SentimentService(MlClient mlClient) {
        this.mlClient = mlClient;
    }

    public SentimentResponse analyze(String text) {
        return mlClient.predict(text);
    }
}
