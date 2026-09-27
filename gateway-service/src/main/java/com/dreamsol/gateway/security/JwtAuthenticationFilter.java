package com.dreamsol.gateway.security;

import com.dreamsol.gateway.service.JwtService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Objects;

@Component
public class JwtAuthenticationFilter implements WebFilter {
    private final JwtService jwtService;
    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String path = exchange.getRequest().getPath().value();
        if (path.equals("/api/auth/login"))
            return chain.filter(exchange);
        String authorizationHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (Objects.isNull(authorizationHeader) || authorizationHeader.isBlank())
            return unauthorized(exchange, "Authorization token is missing");
        if (!authorizationHeader.startsWith("Bearer "))
            return unauthorized(exchange, "Invalid Authorization header");
        String token = authorizationHeader.substring(7).trim();
        if (token.isBlank())
            return unauthorized(exchange, "JWT token is missing");
        if (!jwtService.isTokenValid(token))
            return unauthorized(exchange, "Invalid or expired JWT token");
        String username;
        try {
            username = jwtService.extractUsername(token);
        } catch (Exception ex) {
            return unauthorized(exchange, "Unable to read username from JWT");
        }
        String role;
        try {
            role = jwtService.extractRole(token);
        } catch (Exception ex) {
            return unauthorized(exchange, "Unable to read role from JWT");
        }
        if (Objects.isNull(username) || username.isBlank())
            return unauthorized(exchange, "Username is missing from JWT");
        if (Objects.isNull(role) || role.isBlank())
            return unauthorized(exchange, "Role is missing from JWT");
        role = role.trim().toUpperCase();
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(username, null, List.of(new SimpleGrantedAuthority("ROLE_" + role)));
        return chain.filter(exchange).contextWrite(ReactiveSecurityContextHolder.withAuthentication(authentication));
    }
    private Mono<Void> unauthorized(ServerWebExchange exchange, String message) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        exchange.getResponse().getHeaders().add(HttpHeaders.CONTENT_TYPE, "application/json");
        String responseBody = "{\"status\":401,\"message\":\"" + message + "\"}";
        byte[] bytes = responseBody.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        org.springframework.core.io.buffer.DataBuffer buffer = exchange.getResponse().bufferFactory().wrap(bytes);
        return exchange.getResponse().writeWith(Mono.just(buffer));
    }
}