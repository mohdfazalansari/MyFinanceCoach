package com.financeIntelligence.MyFinanceCoach.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class analyzeRequestDto {

  // We use @JsonProperty so Java can use camelCase, but the JSON sent to Python uses snake_case
   @JsonProperty("Monthly Income")
   private BigDecimal monthlyIncome;

   @JsonProperty("monthly_income")
    public BigDecimal getMonthlyIncomeSnakeCase() {
        return monthlyIncome;
    }

   @JsonProperty("emergency_fund_balance")
   private BigDecimal emergencyFundBalance;

   private Map<String , BigDecimal> budgets;

   private List<transactionItemDto> transactions;

}
