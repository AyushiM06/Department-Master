package com.dreamsol.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class UserResponseDto {

    private Long id;
    private String username;
    private String password;
    private String role;
    private boolean status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}