package com.dreamsol.department.controller;

import com.dreamsol.department.dto.ExcelHeaderResponseDto;
import com.dreamsol.department.dto.TableHeaderResponseDto;
import com.dreamsol.department.service.DepartmentHeaderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("department/headers")
@RequiredArgsConstructor
public class DepartmentHeaderController {

    private final DepartmentHeaderService departmentHeaderService;

    @PreAuthorize("hasAnyRole('ADMIN','MANAGEMENT','HOD','USER')")
    @GetMapping("excel")
    public ResponseEntity<List<ExcelHeaderResponseDto>> getDepartmentExcelHeaders() {
        return ResponseEntity.ok(departmentHeaderService.getDepartmentExcelHeaders());
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGEMENT','HOD','USER')")
    @GetMapping("table")
    public ResponseEntity<List<TableHeaderResponseDto>> getDepartmentTableHeaders() {
        return ResponseEntity.ok(departmentHeaderService.getDepartmentTableHeaders());
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGEMENT','HOD','USER')")
    @GetMapping("dashboard")
    public ResponseEntity<Map<String, List<TableHeaderResponseDto>>> getDashboardHeaders() {
        return ResponseEntity.ok(departmentHeaderService.getDashboardHeaders());
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGEMENT','HOD','USER')")
    @GetMapping("import-preview")
    public ResponseEntity<List<TableHeaderResponseDto>> getImportPreviewHeaders() {
        return ResponseEntity.ok(departmentHeaderService.getImportPreviewHeaders());
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGEMENT','HOD','USER')")
    @GetMapping("activity")
    public ResponseEntity<List<TableHeaderResponseDto>> getActivityHeaders() {
        return ResponseEntity.ok(departmentHeaderService.getActivityHeaders());
    }
}