package com.financeIntelligence.MyFinanceCoach.service;

import java.math.BigDecimal;

import org.springframework.stereotype.Service;

import com.financeIntelligence.MyFinanceCoach.Entity.User;
import com.financeIntelligence.MyFinanceCoach.dto.userRegistrationDto;
import com.financeIntelligence.MyFinanceCoach.repository.userRepo;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class userService {

  private final userRepo userrepo;
public User registerUser(userRegistrationDto request){
  //1 check if email already exists
  if(userrepo.findByEmail(request.getEmail()).isPresent()){
    throw new RuntimeException("A user with this email already exists !");
  }
  //2 Create new User Entity
  User newUser = new User();
  newUser.setName(request.getName());
  newUser.setEmail(request.getEmail());
  newUser.setPassword(request.getPassword());
  newUser.setMonthlyIncome(BigDecimal.ZERO);
  newUser.setEmergencyFundBalance(BigDecimal.ZERO);
  //3 Save to postgress
  return userrepo.save(newUser);
}
}
