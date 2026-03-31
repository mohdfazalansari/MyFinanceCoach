package com.financeIntelligence.MyFinanceCoach.Controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.financeIntelligence.MyFinanceCoach.service.intelligenceService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/intelligence")
@RequiredArgsConstructor
public class intelligenceController {

  private final intelligenceService intelligenceservice;

  @GetMapping("/{userId}/insights")
    public ResponseEntity<Object> getInsights(@PathVariable UUID userId) {
        return ResponseEntity.ok(intelligenceservice.getInsights(userId));
    }

    @GetMapping("/{userId}/health")
    public ResponseEntity<Object> getFinancialHealth(@PathVariable UUID userId) {
        return ResponseEntity.ok(intelligenceservice.getFinancialHealth(userId));
    }

    @GetMapping("/{userId}/spending")
    public ResponseEntity<Object> getSpendingAnalysis(@PathVariable UUID userId) {
        return ResponseEntity.ok(intelligenceservice.getSpendingAnalysis(userId));
    }

    @GetMapping("/{userId}/predictions")
    public ResponseEntity<Object> getExpensePredictions(@PathVariable UUID userId) {
        return ResponseEntity.ok(intelligenceservice.getExpensePredictions(userId));
    }
}
