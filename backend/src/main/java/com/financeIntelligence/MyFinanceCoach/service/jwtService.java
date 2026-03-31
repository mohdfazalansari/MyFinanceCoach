package com.financeIntelligence.MyFinanceCoach.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;


@Service
public class jwtService {
 // Generates a highly secure, random secret key for our server
    private static final Key SECRET_KEY = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    
    // Token is valid for 24 hours (in milliseconds)
    private static final long EXPIRATION_TIME = 86400000; 

    public String generateToken(String email, String userId) {
        return Jwts.builder()
                .setSubject(email)
                .claim("userId", userId) // We hide the userId inside the token!
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SECRET_KEY)
                .compact();
    }
}
