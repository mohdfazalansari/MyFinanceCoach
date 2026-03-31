package com.financeIntelligence.MyFinanceCoach.service;

import java.math.BigDecimal;
//import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.financeIntelligence.MyFinanceCoach.Entity.Transaction;
import com.financeIntelligence.MyFinanceCoach.dto.subscriptionAlertDto;
import com.financeIntelligence.MyFinanceCoach.repository.transactionRepo;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class subscriptionService {

  private final transactionRepo transactionrepo;

  //Scan last 3month of user data to scan recurring plan
  public List<subscriptionAlertDto> detectSubscriptions(UUID userId) {
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusMonths(3);
        
        // Fetch real data from DB
        List<Transaction> recentTxns = transactionrepo
                .findByUserIdAndTransactionDateBetween(userId, startDate, endDate);
                
        List<subscriptionAlertDto> alerts = new ArrayList<>();

        // Group EXPENSE transactions by merchant
        Map<String, List<Transaction>> byMerchant = recentTxns.stream()
                .filter(t -> t.getType() == Transaction.TransactionType.EXPENSE)
                .filter(t -> t.getMerchant() != null) // <-- ADD THIS SAFETY CHECK!
                .filter(t -> t.getTransactionDate() != null) // <-- And this one for good measure!
                .collect(Collectors.groupingBy(Transaction::getMerchant));

        for (Map.Entry<String, List<Transaction>> entry : byMerchant.entrySet()) {
            List<Transaction> txns = entry.getValue();
            
            // Need at least 2 transactions to establish a recurring pattern
            if (txns.size() >= 2) {
                // Sort by date descending (newest first)
                txns.sort((a, b) -> b.getTransactionDate().compareTo(a.getTransactionDate()));
                
                Transaction latest = txns.get(0);
                Transaction previous = txns.get(1);
                
                long daysBetween = ChronoUnit.DAYS.between(previous.getTransactionDate(), latest.getTransactionDate());
                
                // If the charge happens roughly every 27-32 days, it's likely a monthly subscription
                if (daysBetween >= 27 && daysBetween <= 32) {
                    String alertMsg = "Active monthly subscription detected.";
                    
                    // Alert: Price Increase Detection
                    if (latest.getAmount().compareTo(previous.getAmount()) > 0) {
                        BigDecimal increase = latest.getAmount().subtract(previous.getAmount());
                        alertMsg = "⚠️ ALERT: " + entry.getKey() + " increased their price by ₹" + increase + " this month!";
                    }
                    
                    alerts.add(subscriptionAlertDto.builder()
                            .merchant(entry.getKey())
                            //.expectedAmount(latest.getAmount())
                            .amount(latest.getAmount())
                            .frequency("MONTHLY")
                            .alertMessage(alertMsg)
                            .build());
                }
            }
        }
        return alerts;
    }

}
