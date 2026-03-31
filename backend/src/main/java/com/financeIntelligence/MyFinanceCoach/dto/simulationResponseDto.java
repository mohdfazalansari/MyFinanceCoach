package com.financeIntelligence.MyFinanceCoach.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class simulationResponseDto {

  private BigDecimal currentSaving;
  private BigDecimal projectedSaving;
  private BigDecimal expectedSaving;
  private String impactDirection;
  private String summaryMesssage;
}
