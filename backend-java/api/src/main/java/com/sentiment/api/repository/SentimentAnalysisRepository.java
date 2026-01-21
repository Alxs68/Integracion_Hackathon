package com.sentiment.api.repository;

import com.sentiment.api.entity.SentimentAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SentimentAnalysisRepository extends JpaRepository<SentimentAnalysis, Long> {

    List<SentimentAnalysis> findByPrevision(String prevision);

    List<SentimentAnalysis> findTop5ByOrderByFechaDesc();
}
