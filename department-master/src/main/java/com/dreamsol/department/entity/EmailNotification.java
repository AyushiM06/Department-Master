package com.dreamsol.department.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class EmailNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false)
    private String recipient;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String body;

    @Column(nullable = false, length = 50)
    private String status;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private Long departmentId;

    @Column(length = 500)
    private String attachmentPath;

    private String attachmentFileName;

    private Integer totalRecords;

    private Integer savedRecords;

    private Integer duplicateRecords;

    private Integer invalidRecords;

    @Column(name = "is_read", nullable = false)
    private boolean read;
}