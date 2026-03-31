package com.financeIntelligence.MyFinanceCoach.Controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.financeIntelligence.MyFinanceCoach.Entity.User;
import com.financeIntelligence.MyFinanceCoach.dto.loginRequestDto;
import com.financeIntelligence.MyFinanceCoach.dto.loginResponseDto;
import com.financeIntelligence.MyFinanceCoach.dto.userRegistrationDto;
import com.financeIntelligence.MyFinanceCoach.repository.userRepo;
import com.financeIntelligence.MyFinanceCoach.service.jwtService;
import com.financeIntelligence.MyFinanceCoach.service.userService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class userController {
  private final userService userservice ;
  private final jwtService jwtservice;
  private final userRepo userrepo;

  @PostMapping("/register")
  public ResponseEntity<User> registerUser(@RequestBody userRegistrationDto request){
    User savedUser = userservice.registerUser(request);
    return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
  }

  @PostMapping("/login")
   public ResponseEntity<?> loginUser(@RequestBody loginRequestDto request) {
        
        // 1. Find the user by email in PostgreSQL
        User user = userrepo.findByEmail(request.getEmail())
                .orElse(null);

        // 2. Check if user exists and if the password matches
        if (user == null || !user.getPassword().equals(request.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
        }

        // 3. Generate the real encrypted JWT Token!
        String token = jwtservice.generateToken(user.getEmail(), user.getId().toString());

        // 4. Send the Token, User ID, and Name back to the React frontend
        loginResponseDto response = new loginResponseDto(
                token, 
                user.getId().toString(), 
                user.getName()
        );
        
        return ResponseEntity.ok(response);
    }
  }

