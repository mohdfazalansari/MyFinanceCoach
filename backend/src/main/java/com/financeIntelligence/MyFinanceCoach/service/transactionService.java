package com.financeIntelligence.MyFinanceCoach.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.financeIntelligence.MyFinanceCoach.Entity.Transaction;
import com.financeIntelligence.MyFinanceCoach.Entity.User;
import com.financeIntelligence.MyFinanceCoach.dto.transactionRequestDto;
import com.financeIntelligence.MyFinanceCoach.repository.transactionRepo;
import com.financeIntelligence.MyFinanceCoach.repository.userRepo;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class transactionService {

  private final transactionRepo transactionrepo;
  private final userRepo userrepo;
  private final mlPredictionSerivce mlpredictionservice;

  public Transaction addTransaction(transactionRequestDto request){

    //1. Verify User exists
    User user = userrepo.findById(request.getUserid())
    .orElseThrow(()-> new RuntimeException("User Not found "+ request.getUserid()));

    //2. Map DTO to entity
    Transaction transaction = new Transaction();
    transaction.setUser(user);
    transaction.setAmount(request.getAmount());
    transaction.setTransactionDate(request.getTransactionDate());
    transaction.setMerchant(request.getMerchant());
    transaction.setDescription(request.getDiscription());
    transaction.setType(request.getType());

    // 3. TODO: In the next step, we will call the Python ML API here!
        // For now, we set a default temporary category
        if (request.getType() == Transaction.TransactionType.INCOME) {
            transaction.setCategory("Income");
        } else {
            //transaction.setCategory("Uncategorized"); 
             String predictedCategory = mlpredictionservice.predictCategory(
              request.getDiscription(), 
              request.getMerchant(), 
              request.getAmount());
          transaction.setCategory(predictedCategory);
        }

        // 4. Save to PostgreSQL
        return transactionrepo.save(transaction);
  }

  public List<Transaction> getUserTransactions(UUID userId){
    return transactionrepo.findByUserIdOrderByTransactionDateDesc(userId);
    
  }

  public void deleteTransaction(UUID transactionId){
    transactionrepo.deleteById(transactionId);
  }

}
