package com.dreamsol.auth.service;

import com.dreamsol.common.security.CommonJwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final CommonJwtService commonJwtService;

    @Value("${jwt.expiration}")
    private long expiration;

    public JwtService(CommonJwtService commonJwtService) {
        this.commonJwtService = commonJwtService;
    }

    public String generateToken(Long userId, String username, String role) {
        return commonJwtService.generateToken(
                userId,
                username,
                role,
                expiration
        );
    }

    public String extractUsername(String token) {
        return commonJwtService.extractUsername(token);
    }

    public Long extractUserId(String token) {
        return commonJwtService.extractUserId(token);
    }

    public String extractRole(String token) {
        return commonJwtService.extractRole(token);
    }

    public boolean isTokenValid(String token) {
        return commonJwtService.isTokenValid(token);
    }
}