package com.financeIntelligence.MyFinanceCoach.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.financeIntelligence.MyFinanceCoach.Entity.Transaction;
import com.financeIntelligence.MyFinanceCoach.Entity.User;
import com.financeIntelligence.MyFinanceCoach.dto.simulationRequestDto;
import com.financeIntelligence.MyFinanceCoach.dto.simulationResponseDto;
import com.financeIntelligence.MyFinanceCoach.repository.transactionRepo;
import com.financeIntelligence.MyFinanceCoach.repository.userRepo;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class simulationService {

  private final userRepo userrepo;
  private final transactionRepo transactionrepo;
  public simulationResponseDto runWhatIfSimulation(UUID userId, simulationRequestDto request) {
        
        // 1. Fetch User data
        User user = userrepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        BigDecimal currentIncome = user.getMonthlyIncome() != null ? user.getMonthlyIncome() : BigDecimal.ZERO;
        
        // 2. Calculate current month's total expenses
        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime endOfMonth = LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth()).atTime(23, 59, 59);
        
        List<Transaction> currentMonthTxns = transactionrepo
                .findByUserIdAndTransactionDateBetween(userId, startOfMonth, endOfMonth);
                
        BigDecimal totalCurrentExpenses = currentMonthTxns.stream()
                .filter(t -> t.getType() == Transaction.TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        BigDecimal currentSavings = currentIncome.subtract(totalCurrentExpenses);
        
        // 3. Apply the hypotheticals
        BigDecimal projectedExpenses = totalCurrentExpenses;
        if (request.getSimulatedCategoryChanges() != null) {
            for (BigDecimal change : request.getSimulatedCategoryChanges().values()) {
                projectedExpenses = projectedExpenses.add(change); // Adds the positive/negative change
            }
        }
        
        BigDecimal projectedIncome = request.getNewSimulatedIncome() != null ? request.getNewSimulatedIncome() : currentIncome;
        BigDecimal projectedSavings = projectedIncome.subtract(projectedExpenses);
        
        // 4. Calculate Impact
        BigDecimal savingsDifference = projectedSavings.subtract(currentSavings);
        String impact = savingsDifference.compareTo(BigDecimal.ZERO) >= 0 ? "Increase" : "Decrease";
        
        String message = String.format("By making these changes, your monthly savings will %s by ₹%s.", 
                impact.toLowerCase(), savingsDifference.abs());
        
         // 5. Return structured DTO matching your exact field names
        simulationResponseDto response = new simulationResponseDto();
        response.setCurrentSaving(currentSavings);
        response.setProjectedSaving(projectedSavings);
        response.setExpectedSaving(savingsDifference.abs());
        response.setImpactDirection(impact);
        response.setSummaryMesssage(message); // Matches your 3 's' spelling exactly
        
        return response;
    }
}
