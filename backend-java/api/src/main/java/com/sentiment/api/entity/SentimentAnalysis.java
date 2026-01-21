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
    private Double probabilidad;
    
    @Column(length = 500)
    private String topFeatures;
    
    @Column(nullable = false)
    private LocalDateTime fecha;
    
    public SentimentAnalysis() {
        this.fecha = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getText() {
        return text;
    }
    
    public void setText(String text) {
        this.text = text;
    }
    
    public String getPrevision() {
        return prevision;
    }
    
    public void setPrevision(String prevision) {
        this.prevision = prevision;
    }
    
    public Double getProbabilidad() {
        return probabilidad;
    }
    
    public void setProbabilidad(Double probabilidad) {
        this.probabilidad = probabilidad;
    }
    
    public String getTopFeatures() {
        return topFeatures;
    }
    
    public void setTopFeatures(String topFeatures) {
        this.topFeatures = topFeatures;
    }
    
    public LocalDateTime getFecha() {
        return fecha;
    }
    
    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }
}
