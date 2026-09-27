package com.dreamsol.department.client;

import com.dreamsol.department.dto.UserLookupResponseDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@FeignClient(name = "user-service", url = "${user-service.url}")
public interface UserClient {
    @GetMapping("/users/lookup")
    List<UserLookupResponseDto> getUsersForLookup();
}