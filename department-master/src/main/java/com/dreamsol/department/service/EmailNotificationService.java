package com.dreamsol.department.service;

import com.dreamsol.common.email.CommonEmailService;
import com.dreamsol.department.entity.Department;
import com.dreamsol.department.entity.EmailNotification;
import com.dreamsol.department.repository.DepartmentRepository;
import com.dreamsol.department.repository.EmailNotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationService {

    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_SENT = "SENT";
    private static final String STATUS_FAILED = "FAILED";
    private static final String ACTION_ADD = "ADD";
    private static final String ACTION_UPDATE = "UPDATE";

    private final EmailNotificationRepository emailNotificationRepository;
    private final DepartmentRepository departmentRepository;
    private final ApplicationContext applicationContext;
    private final CommonEmailService commonEmailService;

    @Value("${department.notification.email}")
    private String notificationEmail;

    public ResponseEntity<?> createImportEmailNotification(String filePath, String fileName, Integer totalRecords, Integer savedRecords, Integer duplicateRecords, Integer invalidRecords) {
        try {
            EmailNotification notification = new EmailNotification();
            notification.setSubject("Department Excel Import");
            notification.setRecipient(notificationEmail);
            notification.setBody("Department Excel import completed successfully.\n\nExcel File: " + fileName + "\n\nTotal Records: " + totalRecords + "\nSaved Records: " + savedRecords + "\nDuplicate Records: " + duplicateRecords + "\nInvalid Records: " + invalidRecords + "\n\nRegards,\nDepartment Master System");
            notification.setStatus(STATUS_PENDING);
            notification.setCreatedAt(LocalDateTime.now());
            notification.setAttachmentPath(filePath);
            notification.setAttachmentFileName(fileName);
            notification.setTotalRecords(totalRecords);
            notification.setSavedRecords(savedRecords);
            notification.setDuplicateRecords(duplicateRecords);
            notification.setInvalidRecords(invalidRecords);
            EmailNotification savedNotification = emailNotificationRepository.save(notification);
            sendEmail(savedNotification);
            return ResponseEntity.ok(emailNotificationRepository.save(savedNotification));
        } catch (Exception ex) {
            log.error("Error while creating import email notification", ex);
            return ResponseEntity.internalServerError().body(Map.of("message", "Unable to create email notification"));
        }
    }

    public EmailNotification createExportEmailNotification(String filePath, String fileName, Integer totalRecords, LocalDate fromDate, LocalDate toDate) {
        try {
            EmailNotification notification = new EmailNotification();
            notification.setSubject("Department Excel Export - " + fromDate + " to " + toDate);
            notification.setRecipient(notificationEmail);
            notification.setBody("Department Excel export has been generated successfully.\n\nExcel File: " + fileName + "\nFrom Date: " + fromDate + "\nTo Date: " + toDate + "\nTotal Records: " + totalRecords + "\n\nThe selected date range is greater than 7 days, so the Excel file has been sent through email.\n\nRegards,\nDepartment Master System");
            notification.setStatus(STATUS_PENDING);
            notification.setCreatedAt(LocalDateTime.now());
            notification.setAttachmentPath(filePath);
            notification.setAttachmentFileName(fileName);
            notification.setTotalRecords(totalRecords);
            notification.setSavedRecords(null);
            notification.setDuplicateRecords(null);
            notification.setInvalidRecords(null);
            notification.setDepartmentId(null);
            EmailNotification savedNotification = emailNotificationRepository.save(notification);
            applicationContext.getBean(EmailNotificationService.class).sendExportEmailAsync(savedNotification.getId());
            return savedNotification;
        } catch (Exception ex) {
            log.error("Error while creating department export email notification", ex);
            throw new RuntimeException("Unable to create department export email notification", ex);
        }
    }

    public ResponseEntity<?> createExportEmailNotification(String filePath, String fileName, LocalDate fromDate, LocalDate toDate, Integer totalRecords) {
        try {
            EmailNotification notification = new EmailNotification();
            notification.setSubject("Department Excel Export");
            notification.setRecipient(notificationEmail);
            notification.setBody("Department Excel export has been generated successfully.\n\nExcel File: " + fileName + "\n\nDate Range: " + fromDate + " to " + toDate + "\nTotal Records: " + totalRecords + "\n\nRegards,\nDepartment Master System");
            notification.setStatus(STATUS_PENDING);
            notification.setCreatedAt(LocalDateTime.now());
            notification.setAttachmentPath(filePath);
            notification.setAttachmentFileName(fileName);
            notification.setTotalRecords(totalRecords);
            notification.setSavedRecords(null);
            notification.setDuplicateRecords(null);
            notification.setInvalidRecords(null);
            notification.setDepartmentId(null);
            EmailNotification savedNotification = emailNotificationRepository.save(notification);
            applicationContext.getBean(EmailNotificationService.class).sendExportEmailAsync(savedNotification.getId());
            return ResponseEntity.ok(savedNotification);
        } catch (Exception ex) {
            log.error("Error while creating department export email notification", ex);
            return ResponseEntity.internalServerError().body(Map.of("message", "Unable to create export email notification"));
        }
    }

    public ResponseEntity<?> getEmailNotifications() {
        try {
            return ResponseEntity.ok(emailNotificationRepository.findByOrderByCreatedAtDesc());
        } catch (Exception ex) {
            log.error("Error while fetching email notifications", ex);
            return ResponseEntity.internalServerError().build();
        }
    }

    public ResponseEntity<Resource> downloadEmailAttachment(Long id) {
        try {
            EmailNotification notification = emailNotificationRepository.findById(id).orElse(null);
            if (Objects.isNull(notification) || Objects.isNull(notification.getAttachmentPath())) return ResponseEntity.notFound().build();
            Path path = Paths.get(notification.getAttachmentPath());
            Resource resource = new UrlResource(path.toUri());
            if (!resource.exists() || !resource.isReadable()) return ResponseEntity.notFound().build();
            return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + notification.getAttachmentFileName() + "\"").body(resource);
        } catch (Exception ex) {
            log.error("Error while downloading email attachment", ex);
            return ResponseEntity.internalServerError().build();
        }
    }

    public ResponseEntity<?> markEmailNotificationAsRead(Long id) {
        Optional<EmailNotification> notification = emailNotificationRepository.findById(id);
        if (notification.isEmpty()) return ResponseEntity.notFound().build();
        EmailNotification email = notification.get();
        email.setRead(true);
        return ResponseEntity.ok(emailNotificationRepository.save(email));
    }

    public ResponseEntity<?> createDepartmentEmailNotification(List<Long> departmentIds, String action) {
        try {
            if (Objects.isNull(departmentIds) || departmentIds.isEmpty()) return ResponseEntity.badRequest().body(Map.of("message", "Department ID is required"));
            List<Long> validDepartmentIds = departmentIds.stream().filter(Objects::nonNull).distinct().toList();
            if (validDepartmentIds.isEmpty()) return ResponseEntity.badRequest().body(Map.of("message", "Valid department ID is required"));
            String normalizedAction = Objects.toString(action, "").trim().toUpperCase();
            if (!ACTION_ADD.equals(normalizedAction) && !ACTION_UPDATE.equals(normalizedAction)) return ResponseEntity.badRequest().body(Map.of("message", "Action must be ADD or UPDATE"));
            if (ACTION_UPDATE.equals(normalizedAction) && validDepartmentIds.size() != 1) return ResponseEntity.badRequest().body(Map.of("message", "Only one department can be updated at a time"));
            List<Department> departments = departmentRepository.findAllById(validDepartmentIds);
            if (departments.isEmpty() || departments.size() != validDepartmentIds.size()) return ResponseEntity.badRequest().body(Map.of("message", "One or more departments were not found"));
            int recordCount = departments.size();
            boolean isAdd = ACTION_ADD.equals(normalizedAction);
            String actionText = isAdd ? "added" : "updated";
            String actionLabel = isAdd ? "Added Records" : "Updated Records";
            StringBuilder body = new StringBuilder();
            body.append("Department").append(recordCount > 1 ? "s" : "").append(" have been ").append(actionText).append(" successfully.\n\n");
            body.append(actionLabel).append(": ").append(recordCount).append("\n\n");
            body.append("Department Details:\n\n");
            for (Department department : departments) {
                body.append("Department Code: ").append(Objects.toString(department.getDepartmentCode(), "")).append("\n");
                body.append("Department Name: ").append(Objects.toString(department.getDepartmentName(), "")).append("\n");
                body.append("Short Name: ").append(Objects.toString(department.getShortName(), "")).append("\n");
                body.append("Department Type: ").append(Objects.toString(department.getDepartmentType(), "")).append("\n");
                body.append("Department Email: ").append(Objects.toString(department.getDepartmentEmail(), "")).append("\n");
                body.append("Department Phone: ").append(Objects.toString(department.getDepartmentPhone(), "")).append("\n\n");
                body.append("----------------------------------------\n\n");
            }
            body.append("Regards,\nDepartment Master System");
            EmailNotification notification = new EmailNotification();
            notification.setSubject("Department " + normalizedAction);
            notification.setRecipient(notificationEmail);
            notification.setBody(body.toString());
            notification.setStatus(STATUS_PENDING);
            notification.setCreatedAt(LocalDateTime.now());
            notification.setAttachmentPath(null);
            notification.setAttachmentFileName(null);
            notification.setTotalRecords(null);
            notification.setSavedRecords(recordCount);
            notification.setDuplicateRecords(null);
            notification.setInvalidRecords(null);
            notification.setDepartmentId(null);
            EmailNotification savedNotification = emailNotificationRepository.save(notification);
            applicationContext.getBean(EmailNotificationService.class).sendDepartmentEmailAsync(savedNotification.getId());
            return ResponseEntity.ok(savedNotification);
        } catch (Exception ex) {
            log.error("Error while creating department email notification | departmentIds={} | action={}", departmentIds, action, ex);
            return ResponseEntity.internalServerError().body(Map.of("message", "Unable to create department email notification"));
        }
    }

    @Async("emailTaskExecutor")
    public void sendDepartmentEmailAsync(Long notificationId) {
        long start = System.currentTimeMillis();
        try {
            log.info("ASYNC EMAIL START | notificationId={}", notificationId);
            EmailNotification notification = emailNotificationRepository.findById(notificationId).orElse(null);
            if (Objects.isNull(notification)) {
                log.warn("Email notification not found | notificationId={}", notificationId);
                return;
            }
            sendEmail(notification);
            emailNotificationRepository.save(notification);
            log.info("ASYNC EMAIL COMPLETED | notificationId={} | time={} ms | status={}", notificationId, System.currentTimeMillis() - start, notification.getStatus());
        } catch (Exception ex) {
            log.error("Async department email failed | notificationId={}", notificationId, ex);
            emailNotificationRepository.findById(notificationId).ifPresent(notification -> {
                notification.setStatus(STATUS_FAILED);
                emailNotificationRepository.save(notification);
            });
        }
    }

    @Async("emailTaskExecutor")
    public void sendExportEmailAsync(Long notificationId) {
        long start = System.currentTimeMillis();
        try {
            log.info("ASYNC EXPORT EMAIL START | notificationId={}", notificationId);
            EmailNotification notification = emailNotificationRepository.findById(notificationId).orElse(null);
            if (Objects.isNull(notification)) {
                log.warn("Export email notification not found | notificationId={}", notificationId);
                return;
            }
            sendEmail(notification);
            emailNotificationRepository.save(notification);
            log.info("ASYNC EXPORT EMAIL COMPLETED | notificationId={} | time={} ms | status={}", notificationId, System.currentTimeMillis() - start, notification.getStatus());
        } catch (Exception ex) {
            log.error("Async export email failed | notificationId={}", notificationId, ex);
            emailNotificationRepository.findById(notificationId).ifPresent(notification -> {
                notification.setStatus(STATUS_FAILED);
                emailNotificationRepository.save(notification);
            });
        }
    }

    private void sendEmail(EmailNotification notification) {
        try {
            commonEmailService.send(notification.getRecipient(), notification.getSubject(), notification.getBody(), notification.getAttachmentPath(), notification.getAttachmentFileName());
            notification.setStatus(STATUS_SENT);
        } catch (Exception ex) {
            log.error("Email sending failed, notificationId={}", notification.getId(), ex);
            notification.setStatus(STATUS_FAILED);
        }
    }
}