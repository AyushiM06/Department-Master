package com.dreamsol.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserRequestDto {

    @NotBlank(message = "Username is required")
    @Size(max = 100, message = "Username cannot exceed 100 characters")
    private String username;
    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
    private String password;
    @NotBlank(message = "Role is required")
    @Pattern(regexp = "ADMIN|MANAGEMENT|HOD|USER", message = "Role must be ADMIN, MANAGEMENT, HOD or USER")
    private String role;
}