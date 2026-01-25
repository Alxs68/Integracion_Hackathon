package com.sentiment.api.controller;

import com.sentiment.api.dto.SentimentRequest;
import com.sentiment.api.dto.SentimentResponse;
import com.sentiment.api.service.SentimentService;
import com.sentiment.api.dto.SentimentStats;
import org.springframework.data.domain.Page;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/sentiment")
@CrossOrigin(origins = "*")
public class SentimentController {

    private final SentimentService sentimentService;

    public SentimentController(SentimentService sentimentService) {
        this.sentimentService = sentimentService;
    }

    @PostMapping("/analyze")
    public ResponseEntity<SentimentResponse> analyze(@RequestBody @Valid SentimentRequest request) {
        SentimentResponse response = sentimentService.analyze(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/stats")
    public ResponseEntity<SentimentStats> getStats() {
        return ResponseEntity.ok(sentimentService.getStats());
    }

    @GetMapping("/history")
    public ResponseEntity<Page<com.sentiment.api.entity.SentimentAnalysis>> getHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        return ResponseEntity.ok(sentimentService.getHistory(page, size));
    }

    @PostMapping("/feedback/{id}")
    public ResponseEntity<Void> updateFeedback(@PathVariable Long id, @RequestParam String type) {
        sentimentService.updateFeedback(id, type);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/reset")
    public ResponseEntity<Void> resetDatabase() {
        sentimentService.resetDatabase();
        return ResponseEntity.ok().build();
    }
}
