package com.financeIntelligence.MyFinanceCoach.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.financeIntelligence.MyFinanceCoach.Entity.Budget;
import com.financeIntelligence.MyFinanceCoach.Entity.User;
import com.financeIntelligence.MyFinanceCoach.dto.analyzeRequestDto;
import com.financeIntelligence.MyFinanceCoach.dto.transactionItemDto;
import com.financeIntelligence.MyFinanceCoach.repository.budgetRepo;
import com.financeIntelligence.MyFinanceCoach.repository.transactionRepo;
import com.financeIntelligence.MyFinanceCoach.repository.userRepo;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class intelligenceService {
    private final userRepo userrepo;
    private final transactionRepo transactionrepo;
    private final budgetRepo budgetrepo;

    private final RestTemplate restTemplate = new RestTemplate();
    private final String PYTHON_BASE_URL = "http://localhost:8000/api";

    //1 Method to gather all user data from postgresSql and format it for python
    private analyzeRequestDto buildPayloadForPython(UUID userId){
      User user = userrepo.findById(userId)
                          .orElseThrow(()-> new RuntimeException("User not found"));
      
      //Get all transactions for the user
      List<transactionItemDto> transaction =  transactionrepo
                    .findByUserIdOrderByTransactionDateDesc(userId)
                  .stream()    
                  .map(t -> new transactionItemDto(
                    t.getTransactionDate().toString(),
                    t.getAmount(),
                    t.getCategory(),
                    t.getDescription()
                  ))   
                  .collect(Collectors.toList());    
    // Get current month's budgets and map them to Map<String, BigDecimal> (Category -> Limit)
        String currentMonth = LocalDate.now().getYear() + "-" + String.format("%02d", LocalDate.now().getMonthValue());
        Map<String, BigDecimal> budgets = budgetrepo.findByUserIdAndMonthYear(userId, currentMonth)
                .stream()
                .collect(Collectors.toMap(Budget::getCategory, Budget::getLimitAmount));

        // Build the final DTO
        analyzeRequestDto payload = new analyzeRequestDto();
        payload.setMonthlyIncome(user.getMonthlyIncome());
        payload.setEmergencyFundBalance(user.getEmergencyFundBalance());
        payload.setBudgets(budgets);
        payload.setTransactions(transaction);

        return payload;                                      
    }

     // 2. Methods to call the different Python endpoints
    
    public Object getInsights(UUID userId) {
        analyzeRequestDto payload = buildPayloadForPython(userId);
        //return restTemplate.postForObject(PYTHON_BASE_URL + "/generate-insights", payload, Object.class);
        // GRACEFUL FALLBACK: If there are no transactions, tell the user!
        if (payload.getTransactions().isEmpty()) {
            return Map.of("insights", List.of("Add some transactions to generate your first AI insights!"));
        }
        
        try {
            return restTemplate.postForObject(PYTHON_BASE_URL + "/generate-insights", payload, Object.class);
        } catch (Exception e) {
            log.error("Failed to connect to Python ML Engine: {}", e.getMessage());
            return Map.of("insights", List.of("AI Engine is currently offline or warming up."));
        }
    }

    public Object getFinancialHealth(UUID userId) {
        analyzeRequestDto payload = buildPayloadForPython(userId);
        //return restTemplate.postForObject(PYTHON_BASE_URL + "/financial-health", payload, Object.class);
        // GRACEFUL FALLBACK
        if (payload.getTransactions().isEmpty()) {
            return Map.of(
                "Total_Score", 0,
                "Status", "Need Data",
                "Main_Insight", "Add some transactions so we can calculate your financial health score!",
                "Breakdown", Map.of()
            );
        }
        
        try {
            return restTemplate.postForObject(PYTHON_BASE_URL + "/financial-health", payload, Object.class);
        } catch (Exception e) {
            log.error("Failed to connect to Python ML Engine: {}", e.getMessage());
            return Map.of(
                "Total_Score", 0,
                "Status", "Offline",
                "Main_Insight", "AI Engine is currently offline.",
                "Breakdown", Map.of()
            );
        }
    }

    public Object getSpendingAnalysis(UUID userId) {
        analyzeRequestDto payload = buildPayloadForPython(userId);
        //return restTemplate.postForObject(PYTHON_BASE_URL + "/analyze-spending", payload, Object.class);
         if (payload.getTransactions().isEmpty()) return Map.of();
        
        try {
            return restTemplate.postForObject(PYTHON_BASE_URL + "/analyze-spending", payload, Object.class);
        } catch (Exception e) {
            log.error("Failed to connect to Python ML Engine: {}", e.getMessage());
            return Map.of();
        }
    }

    public Object getExpensePredictions(UUID userId) {
        analyzeRequestDto payload = buildPayloadForPython(userId);
        //return restTemplate.postForObject(PYTHON_BASE_URL + "/predict-expenses", payload, Object.class);
        if (payload.getTransactions().isEmpty()) return Map.of();
        
        try {
            return restTemplate.postForObject(PYTHON_BASE_URL + "/predict-expenses", payload, Object.class);
        } catch (Exception e) {
            log.error("Failed to connect to Python ML Engine: {}", e.getMessage());
            return Map.of();
        }
    }

}
