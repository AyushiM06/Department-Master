package com.dreamsol.department.controller;

import com.dreamsol.department.dto.DepartmentRequestDto;
import com.dreamsol.department.dto.DepartmentSearchRequestDto;
import com.dreamsol.department.repository.DepartmentRepository;
import com.dreamsol.department.service.DepartmentService;
import com.dreamsol.department.service.DepartmentHistoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("department")
@RequiredArgsConstructor
@Slf4j
public class DepartmentController {
    private final DepartmentService departmentService;
    private final DepartmentRepository departmentRepository;
    private final DepartmentHistoryService departmentHistoryService;

    @PreAuthorize("hasAnyRole('ADMIN','MANAGEMENT','HOD','USER')")
    @PostMapping("save")
    public ResponseEntity<?> saveOrUpdate(@RequestBody List<DepartmentRequestDto> requests) {
        return departmentService.saveOrUpdate(requests);
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGEMENT','HOD','USER')")
    @GetMapping("list")
    public ResponseEntity<?> getAllDepartments(@RequestParam(required = false) boolean status, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size, @RequestParam(defaultValue = "id") String sortBy, @RequestParam(defaultValue = "desc") String direction) {
        return departmentService.getAllDepartments(status, page, size, sortBy, direction);
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGEMENT','HOD','USER')")
    @GetMapping("{id}")
    public ResponseEntity<?> getDepartmentById(@PathVariable Long id) {
        return departmentService.getDepartmentById(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("delete/{id}")
    public ResponseEntity<?> deleteDepartment(@PathVariable Long id) {
        return departmentService.deleteDepartment(id);
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGEMENT','HOD','USER')")
    @GetMapping("count")
    public ResponseEntity<?> getDepartmentCount(@RequestParam(required = false) String fromDate, @RequestParam(required = false) String toDate) {
        LocalDateTime from = fromDate != null && !fromDate.isBlank() ? LocalDateTime.parse(fromDate + "T00:00:00") : null;
        LocalDateTime to = toDate != null && !toDate.isBlank() ? LocalDateTime.parse(toDate + "T23:59:59") : null;
        return departmentService.getDepartmentCount(from, to);
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGEMENT','HOD','USER')")
    @PostMapping("fetch-departments")
    public ResponseEntity<?> searchDepartments(@RequestBody DepartmentSearchRequestDto request) {
        return departmentService.searchDepartments(request);
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGEMENT','HOD','USER')")
    @PostMapping("upload")
    public ResponseEntity<?> uploadAttachment(@RequestParam List<Long> departmentIds, @RequestParam List<MultipartFile> files, @RequestParam List<String> attachmentTypes) {
        return departmentService.uploadAttachment(departmentIds, files, attachmentTypes);
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGEMENT','HOD','USER')")
    @GetMapping("download/{uuid}")
    public ResponseEntity<Resource> downloadAttachment(@PathVariable String uuid) {
        return departmentService.downloadAttachment(uuid);
    }

    @DeleteMapping("attachments/{uuid}")
    public ResponseEntity<?> deleteAttachment(@PathVariable String uuid) {
        return departmentService.deleteAttachment(uuid);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("internal/import-save")
    public ResponseEntity<?> importSave(@RequestBody List<DepartmentRequestDto> requests) {
        return departmentService.saveOrUpdate(requests);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("internal/export-data")
    public ResponseEntity<?> exportData() {
        return ResponseEntity.ok(departmentRepository.findDepartmentsForExport());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("dashboard-statistics")
    public ResponseEntity<?> getDashboardStatistics(@RequestParam String fromDate, @RequestParam String toDate, @RequestParam(required = false) String search) {
        LocalDateTime from = LocalDateTime.parse(fromDate + "T00:00:00");
        LocalDateTime to = LocalDateTime.parse(toDate + "T23:59:59");
        return departmentService.getDashboardStatistics(from, to, search);
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGEMENT','HOD','USER')")
    @GetMapping("history/{departmentId}")
    public ResponseEntity<?> getDepartmentHistory(@PathVariable Long departmentId) {
        return ResponseEntity.ok(departmentHistoryService.getDepartmentHistory(departmentId));
    }
}