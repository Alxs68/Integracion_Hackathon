package com.sentiment.api.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "sentiment_analysis")
public class SentimentAnalysis {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 2000)
    private String text;

    @Column(nullable = false)
    private String prevision;

    @Column(nullable = false)
    private double probabilidad;

    @Column(nullable = false)
    private LocalDateTime fecha;

    protected SentimentAnalysis(){}

    public SentimentAnalysis(Long id, String text, String prevision, double probabilidad, LocalDateTime fecha) {
        this.id = id;
        this.text = text;
        this.prevision = prevision;
        this.probabilidad = probabilidad;
        this.fecha = fecha;
    }

    public Long getId() {
        return id;
    }

    public String getText() {
        return text;
    }

    public String getPrevision() {
        return prevision;
    }

    public double getProbabilidad() {
        return probabilidad;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }
}
