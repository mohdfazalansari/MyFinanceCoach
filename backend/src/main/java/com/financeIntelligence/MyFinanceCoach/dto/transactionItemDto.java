package com.financeIntelligence.MyFinanceCoach.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class transactionItemDto {

  private String date;
  private BigDecimal amount;
  private String category;
  private String description;
}
