package com.dreamsol.department.controller;

import com.dreamsol.department.service.EmailNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/department/email-notifications")
@RequiredArgsConstructor
public class EmailNotificationController {

    private final EmailNotificationService emailNotificationService;

    @GetMapping
    public ResponseEntity<?> getEmailNotifications() {
        return emailNotificationService.getEmailNotifications();
    }

    @PostMapping("/import")
    public ResponseEntity<?> createImportEmailNotification(@RequestParam String filePath, @RequestParam String fileName, @RequestParam Integer totalRecords, @RequestParam Integer savedRecords, @RequestParam Integer duplicateRecords, @RequestParam Integer invalidRecords) {
        return emailNotificationService.createImportEmailNotification(filePath, fileName, totalRecords, savedRecords, duplicateRecords, invalidRecords);
    }

    @PostMapping("/department")
    public ResponseEntity<?> createDepartmentEmailNotification(@RequestParam List<Long> departmentIds, @RequestParam String action) {
        return emailNotificationService.createDepartmentEmailNotification(departmentIds, action);
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadEmailAttachment(@PathVariable Long id) {
        return emailNotificationService.downloadEmailAttachment(id);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markEmailNotificationAsRead(@PathVariable Long id) {
        return emailNotificationService.markEmailNotificationAsRead(id);
    }
}