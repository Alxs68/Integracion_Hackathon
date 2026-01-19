package com.sentiment.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "sentiment_analysis")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
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
}
