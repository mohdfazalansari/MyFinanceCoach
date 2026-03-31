package com.financeIntelligence.MyFinanceCoach.dto;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class subscriptionAlertDto {

  private String merchant;
  private BigDecimal amount;
  private String frequency;
  private String alertMessage;
}
