package com.dreamsol.user.service;

import com.dreamsol.user.dto.UserRequestDto;
import com.dreamsol.user.dto.UserResponseDto;
import com.dreamsol.user.entity.User;
import com.dreamsol.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.dreamsol.user.dto.UserLookupResponseDto;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponseDto createUser(UserRequestDto request) {
        String username = request.getUsername().trim();
        if (userRepository.existsByUsername(username))
            throw new RuntimeException("Username already exists");
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole().trim().toUpperCase());
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        User savedUser = userRepository.save(user);
        return mapToResponse(savedUser);
    }

    public List<UserResponseDto> getAllUsers() {
        return userRepository.findAllByOrderByIdDesc().stream().map(this::mapToResponse).toList();
    }

    public List<UserLookupResponseDto> getUsersForLookup() {
        return userRepository.findAllByOrderByIdDesc().stream().map(user -> new UserLookupResponseDto(user.getId(), user.getUsername())).toList();
    }

    public UserResponseDto getUserById(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        return mapToResponse(user);
    }

    public UserResponseDto getUserByUsername(String username) {
        User user = userRepository.findByUsernameAndStatusFalse(username).orElseThrow(() -> new RuntimeException("User not found"));
        return mapToResponse(user);
    }

    public UserResponseDto updateUser(Long id, UserRequestDto request) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        String username = request.getUsername().trim();
        if (!user.getUsername().equals(username) && userRepository.existsByUsername(username))
            throw new RuntimeException("Username already exists");
        user.setUsername(username);
        user.setRole(request.getRole().trim().toUpperCase());
        if (request.getPassword() != null && !request.getPassword().isBlank())
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        User updatedUser = userRepository.save(user);
        return mapToResponse(updatedUser);
    }

    public void deactivateUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(true);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    public void activateUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(false);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    private UserResponseDto mapToResponse(User user) {
        return new UserResponseDto(user.getId(), user.getUsername(), user.getPassword(), user.getRole(), user.isStatus(), user.getCreatedAt(), user.getUpdatedAt());
    }
}