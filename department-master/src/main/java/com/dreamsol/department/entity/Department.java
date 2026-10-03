package com.dreamsol.department.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PreUpdate;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(length = 20, unique = true, updatable = false)
    private String departmentCode;
    @Column(length = 150, nullable = false)
    private String departmentName;
    @Column(length = 50)
    private String shortName;
    @Column(length = 50, nullable = false)
    private String departmentType;
    private Long parentDepartment;
    private Long departmentHead;
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json", nullable = false)
    private List<Long> branches;
    private Long businessUnit;
    @Column(length = 50)
    private String costCenter;
    @Column(length = 150)
    private String departmentEmail;
    @Column(length = 15, unique = true)
    private String departmentPhone;
    @Column(length = 100)
    private List<String> workingDays;
    private Long workingShift;
    @Column(columnDefinition = "TEXT")
    private String description;
    private String departmentLogo;
    private String documentPath;
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private List<String> tags;
    @Column(columnDefinition = "TEXT")
    private String keywords;
    @Column(columnDefinition = "TEXT")
    private String remarks;
    private boolean status;
    private Long createdBy;
    @CreationTimestamp
    @JsonFormat(pattern = "dd-MM-yy")
    private LocalDateTime createdAt;
    private Long updatedBy;
    @JsonFormat(pattern = "dd-MM-yy")
    private LocalDateTime updatedAt;
    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}