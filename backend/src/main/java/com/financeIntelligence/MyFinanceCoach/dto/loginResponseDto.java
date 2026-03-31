package com.financeIntelligence.MyFinanceCoach.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class loginResponseDto {

  private String token;
  private String userId;
  private String name;
}
