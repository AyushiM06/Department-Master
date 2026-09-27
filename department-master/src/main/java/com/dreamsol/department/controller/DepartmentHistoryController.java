package com.dreamsol.department.controller;

import com.dreamsol.department.service.DepartmentHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/department/history")
@RequiredArgsConstructor
public class DepartmentHistoryController {

    private final DepartmentHistoryService departmentHistoryService;

    @GetMapping("/{departmentId}")
    public ResponseEntity<?> getDepartmentHistory(@PathVariable Long departmentId) {
        return ResponseEntity.ok(departmentHistoryService.getDepartmentHistory(departmentId));
    }
}