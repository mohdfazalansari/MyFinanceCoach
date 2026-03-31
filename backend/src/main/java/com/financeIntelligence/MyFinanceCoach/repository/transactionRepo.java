package com.financeIntelligence.MyFinanceCoach.repository;

//import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.financeIntelligence.MyFinanceCoach.Entity.Transaction;

@Repository
public interface transactionRepo extends JpaRepository<Transaction,UUID>{
 
  //Fetch All Transaction for a specific user 
  List<Transaction> findByUserIdOrderByTransactionDateDesc(UUID UserId);

  //Fetch User Transaction within specific date range (for monthly charts )
  List<Transaction> findByUserIdAndTransactionDateBetween(UUID userid, LocalDateTime startOfMonth, LocalDateTime endOfMonth);

  //Fetch by specific category 
  List<Transaction> findByUserIdAndCategory(UUID userID, String category);
  
} 