package com.financeIntelligence.MyFinanceCoach.Entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "transactions")
@NoArgsConstructor
@AllArgsConstructor
@Data

public class Transaction {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(nullable = false)
  private BigDecimal amount;

  @Column(nullable = false)
  private LocalDateTime transactionDate;

  private String merchant;

  private String description;

  private String category;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private TransactionType type;

  public enum TransactionType{
    INCOME, EXPENSE
  }

}
