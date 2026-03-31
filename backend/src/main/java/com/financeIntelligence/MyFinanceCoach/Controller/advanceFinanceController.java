package com.financeIntelligence.MyFinanceCoach.Controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.financeIntelligence.MyFinanceCoach.dto.simulationRequestDto;
import com.financeIntelligence.MyFinanceCoach.dto.simulationResponseDto;
import com.financeIntelligence.MyFinanceCoach.dto.subscriptionAlertDto;
import com.financeIntelligence.MyFinanceCoach.service.simulationService;
import com.financeIntelligence.MyFinanceCoach.service.subscriptionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/advanced")
@RequiredArgsConstructor
public class advanceFinanceController {
  private final subscriptionService subscriptionservice;
  private final simulationService simulationservice;

   // 1. Subscription & Sneaky Price Hike Detector
    @GetMapping("/subscriptions/{userId}")
    public ResponseEntity<List<subscriptionAlertDto>> getSubscriptions(@PathVariable UUID userId) {
        List<subscriptionAlertDto> alerts = subscriptionservice.detectSubscriptions(userId);
        return ResponseEntity.ok(alerts);
    }

    // 2. 'What-If' Financial Sandbox
    @PostMapping("/simulate/{userId}")
    public ResponseEntity<simulationResponseDto> runSimulation(
            @PathVariable UUID userId, 
            @RequestBody simulationRequestDto request) {
            
        simulationResponseDto response = simulationservice.runWhatIfSimulation(userId, request);
        return ResponseEntity.ok(response);
    }
}
