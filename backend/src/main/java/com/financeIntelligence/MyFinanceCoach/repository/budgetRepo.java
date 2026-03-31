package com.financeIntelligence.MyFinanceCoach.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.financeIntelligence.MyFinanceCoach.Entity.Budget;

@Repository
public interface budgetRepo extends JpaRepository<Budget, UUID> {
  
  //Get ALL budget for  a User for aspecific month
  List<Budget> findByUserIdAndMonthYear(UUID userId, String monthYear);

  // src/main/java/com/finance/repository/BudgetRepository.java
  List<Budget> findByUserId(UUID userId);

  //Get specific category budget
  Optional<Budget> findByUserIdAndCategoryAndMonthYear(UUID userId, String category, String monthYear);

}
