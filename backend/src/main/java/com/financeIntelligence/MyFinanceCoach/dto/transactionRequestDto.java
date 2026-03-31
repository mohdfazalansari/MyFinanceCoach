package com.financeIntelligence.MyFinanceCoach.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import com.financeIntelligence.MyFinanceCoach.Entity.Transaction.TransactionType;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class transactionRequestDto {
  
  @NotNull(message = "User Id is required")
  private UUID userid;

  @NotNull(message = "Amount is required")
  @DecimalMin(value = "0.01", message = "Amount should be greater Zero")
  private BigDecimal amount;

  @NotNull(message = "Transaction date is required")
  private LocalDateTime transactionDate;

  @NotBlank(message = "Merchant name is required")
  private String merchant;

  private String Discription;

  @NotNull(message = "Transaction type(INCOME/EXPENSE) is required ")
  private TransactionType type;



}
