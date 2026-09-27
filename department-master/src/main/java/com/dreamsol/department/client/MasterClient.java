package com.dreamsol.department.client;

import com.dreamsol.department.dto.DepartmentDropdownResponseDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;
import java.util.Map;

@FeignClient(name = "master-service", url = "${master-service.url}")
public interface MasterClient {
    @GetMapping("/master/dropdown-data")
    Map<String, List<DepartmentDropdownResponseDto>> getDropdownData();
}