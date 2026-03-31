package com.financeIntelligence.MyFinanceCoach.Controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.financeIntelligence.MyFinanceCoach.Entity.Budget;
import com.financeIntelligence.MyFinanceCoach.Entity.User;
import com.financeIntelligence.MyFinanceCoach.dto.budgetRequestDto;
import com.financeIntelligence.MyFinanceCoach.repository.budgetRepo;
import com.financeIntelligence.MyFinanceCoach.repository.userRepo;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/budgets")
@RequiredArgsConstructor
public class budgetController {

      
    private final budgetRepo budgetRepository;
    private final userRepo userRepository;

    // Create or Update a budget
    @PostMapping
    public ResponseEntity<Budget> setBudget(@Valid @RequestBody budgetRequestDto request) {
        // Find user directly using the flat userId from the DTO
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + request.getUserId()));
        
        // Check if budget already exists for this category and month for this specific user
        Budget budget = budgetRepository
                .findByUserIdAndCategoryAndMonthYear(user.getId(), request.getCategory(), request.getMonthYear())
                .orElse(new Budget());

        // Map the data from the Request DTO to the Database Entity
        budget.setUser(user);
        budget.setCategory(request.getCategory());
        budget.setLimitAmount(request.getLimitAmount());
        budget.setMonthYear(request.getMonthYear());

        // Save and return the saved entity
        Budget savedBudget = budgetRepository.save(budget);
        return new ResponseEntity<>(savedBudget, HttpStatus.CREATED);
    }

    // Get all budgets for a user for a specific month
    @GetMapping("/user/{userId}/month/{monthYear}")
    public ResponseEntity<List<Budget>> getUserBudgets(@PathVariable UUID userId, @PathVariable String monthYear) {
        List<Budget> budgets = budgetRepository.findByUserIdAndMonthYear(userId, monthYear);
        return ResponseEntity.ok(budgets);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Budget>> getBudgetsByUserId(@PathVariable UUID userId) {
    // Assuming you have a budgetService or budgetRepository wired up
    List<Budget> userBudgets = budgetRepository.findByUserId(userId);
    return ResponseEntity.ok(userBudgets);
}
    // Delete a budget
@DeleteMapping("/{budgetId}")
public ResponseEntity<Void> deleteBudget(@PathVariable UUID budgetId) {
    if (budgetRepository.existsById(budgetId)) {
        budgetRepository.deleteById(budgetId);
        return ResponseEntity.noContent().build();
    }
    return ResponseEntity.notFound().build();
}
}

