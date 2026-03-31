package com.financeIntelligence.MyFinanceCoach.dto;
import lombok.Data;


@Data
public class mlResponseDto {

  private String category;
  private double confidenceScore;
}
