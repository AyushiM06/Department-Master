package com.dreamsol.department.controller;
import com.dreamsol.department.service.DepartmentExcelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDate;
import java.util.List;
@RestController
@RequestMapping("department/excel")
@RequiredArgsConstructor
public class DepartmentExcelController {
    private final DepartmentExcelService departmentExcelService;
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("import")
    public ResponseEntity<?> importDepartments(@RequestParam("file") MultipartFile file) {
        return departmentExcelService.importDepartments(file);
    }
    @GetMapping("export")
    public ResponseEntity<?> exportDepartments(@RequestParam(required = false) String search, @RequestParam(required = false) String departmentType, @RequestParam(required = false) List<Long> branches, @RequestParam(required = false) Long businessUnit, @RequestParam(required = false) Boolean status, @RequestParam LocalDate fromDate, @RequestParam LocalDate toDate) {
        return departmentExcelService.exportDepartments(search, departmentType, branches, businessUnit, status, fromDate, toDate);
    }
    @GetMapping("export/email")
    public ResponseEntity<?> exportDepartmentsByEmail(@RequestParam(required = false) String search, @RequestParam(required = false) String departmentType, @RequestParam(required = false) List<Long> branches, @RequestParam(required = false) Long businessUnit, @RequestParam(required = false) Boolean status, @RequestParam LocalDate fromDate, @RequestParam LocalDate toDate) {
        return departmentExcelService.exportDepartmentsByEmail(search, departmentType, branches, businessUnit, status, fromDate, toDate);
    }
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("template")
    public ResponseEntity<byte[]> downloadTemplate() {
        return departmentExcelService.downloadTemplate();
    }
}