package com.dreamsol.master.controller;

import com.dreamsol.master.dto.MasterDropdownResponseDto;
import com.dreamsol.master.service.MasterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/master")
@RequiredArgsConstructor
public class MasterController {

    private final MasterService masterService;

    @GetMapping("/dropdown-data")
    public ResponseEntity<Map<String, List<MasterDropdownResponseDto>>> getDropdownData() {
        return ResponseEntity.ok(masterService.getDropdownData());
    }
}