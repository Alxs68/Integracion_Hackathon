package com.sentiment.api.controller;


import com.sentiment.api.entity.SentimentAnalysis;
import com.sentiment.api.service.SentimentService;
import com.sentiment.api.dto.SentimentRequest;
import com.sentiment.api.dto.SentimentResponse;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
@RestController
@RequestMapping("/sentiment")
public class SentimentController    {

    private final SentimentService sentimentService;

    public SentimentController(SentimentService sentimentService) {
        this.sentimentService = sentimentService;
    }

    /**
     Endpoint público para análisis de sentimiento.
     Valida input y delega la lógica al servicio.
     */
    @PostMapping
    public SentimentResponse sentiment(@Valid @RequestBody SentimentRequest request) {
        return sentimentService.analyze(request.text());
    }

    @GetMapping("/obtener")
    public List<SentimentAnalysis> getByPrevision(@RequestParam String prevision){
        return sentimentService.getByPrevision(prevision);
    }

    @GetMapping("/{id}")
    public SentimentAnalysis getByid(@PathVariable Long id){
        return sentimentService.getByid(id);
    }

    @GetMapping("/fecha/{fecha}")
    public List<SentimentAnalysis> getByFecha(@PathVariable @DateTimeFormat (iso = DateTimeFormat.ISO.DATE)LocalDate fecha){
        return sentimentService.getByFecha(fecha);
    }
}
