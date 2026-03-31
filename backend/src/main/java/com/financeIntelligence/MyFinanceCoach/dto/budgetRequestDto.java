package com.financeIntelligence.MyFinanceCoach.dto;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class budgetRequestDto {
 @NotNull(message = "User ID is required")
    private UUID userId;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Limit amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    private BigDecimal limitAmount;

    @NotBlank(message = "Month-Year is required (e.g., 2026-03)")
    private String monthYear;
}
