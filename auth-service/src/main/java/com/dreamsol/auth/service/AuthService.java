package com.dreamsol.auth.service;

import com.dreamsol.auth.client.UserClient;
import com.dreamsol.auth.dto.LoginRequestDto;
import com.dreamsol.auth.dto.LoginResponseDto;
import com.dreamsol.auth.dto.UserResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserClient userClient;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public LoginResponseDto login(LoginRequestDto request) {
        UserResponseDto user = userClient.getUser(request.getUsername());
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword()))
            throw new RuntimeException("Invalid username or password");
        String token = jwtService.generateToken(user.getId(), user.getUsername(), user.getRole());
        return new LoginResponseDto(token, "Bearer");
    }
}