package com.financeIntelligence.MyFinanceCoach.dto;


import java.math.BigDecimal;
import java.util.Map;

import lombok.Data;

@Data
public class simulationRequestDto {

  private BigDecimal newSimulatedIncome;

  private Map<String, BigDecimal> simulatedCategoryChanges;
}
