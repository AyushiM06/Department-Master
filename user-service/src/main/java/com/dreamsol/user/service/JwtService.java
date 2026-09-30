package com.dreamsol.user.service;

import com.dreamsol.common.security.CommonJwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class JwtService {

    private final CommonJwtService commonJwtService;

    public String extractUsername(String token) {
        return commonJwtService.extractUsername(token);
    }

    public String extractRole(String token) {
        return commonJwtService.extractRole(token);
    }

    public boolean isTokenValid(String token) {
        return commonJwtService.isTokenValid(token);
    }
}