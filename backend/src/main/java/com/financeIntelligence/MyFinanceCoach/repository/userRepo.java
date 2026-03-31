package com.financeIntelligence.MyFinanceCoach.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.financeIntelligence.MyFinanceCoach.Entity.User;



@Repository
public interface userRepo extends JpaRepository<User , UUID>{
  Optional<User> findByEmail(String email);  
} 
