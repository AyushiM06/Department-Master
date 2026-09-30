package com.dreamsol.auth.client;

import com.dreamsol.auth.dto.UserResponseDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-service")
public interface UserClient {
    @GetMapping("/users/by-username/{username}")
    UserResponseDto getUser(@PathVariable String username);
}

