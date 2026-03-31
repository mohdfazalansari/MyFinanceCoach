package com.financeIntelligence.MyFinanceCoach.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class mlRequestDto {

  private String description;
  private String merchant;
  private BigDecimal amount;
}
