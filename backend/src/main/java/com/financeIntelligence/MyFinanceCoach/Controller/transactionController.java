package com.financeIntelligence.MyFinanceCoach.Controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.financeIntelligence.MyFinanceCoach.Entity.Transaction;
import com.financeIntelligence.MyFinanceCoach.dto.transactionRequestDto;
import com.financeIntelligence.MyFinanceCoach.service.transactionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor

public class transactionController {

  private final transactionService transactionservice;
  
  //Creating new transactions
  @PostMapping
  public ResponseEntity<Transaction> addTransactions(@Valid @RequestBody transactionRequestDto request){
    Transaction savedTransaction = transactionservice.addTransaction(request);
    return new ResponseEntity<>(savedTransaction, HttpStatus.CREATED);
  }

  // Read all transactions for a specific user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Transaction>> getUserTransactions(@PathVariable UUID userId) {
        List<Transaction> transactions = transactionservice.getUserTransactions(userId);
        return ResponseEntity.ok(transactions);
    }

    // Delete a transaction
    @DeleteMapping("/{transactionId}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable UUID transactionId) {
        transactionservice.deleteTransaction(transactionId);
        return ResponseEntity.noContent().build();
    }

}
