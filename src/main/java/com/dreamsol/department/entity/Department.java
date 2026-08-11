package com.dreamsol.department.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "department")
public class Department
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "department_code", length = 20, nullable = false, unique = true)
    private String departmentCode;

    @Column(name = "department_name", length = 150, nullable = false)
    private String departmentName;

    @Column(name = "short_name", length = 50)
    private String shortName;

    @Column(name = "department_type", length = 50, nullable = false)
    private String departmentType;

    @Column(name = "parent_department_id")
    private Long parentDepartmentId;

    @Column(name = "department_head")
    private Long departmentHead;

    @Column(name = "branch_ids", columnDefinition = "json")
    private String branchIds;

    @Column(name = "business_unit_id")
    private Long businessUnitId;

    @Column(name = "cost_center", length = 50)
    private String costCenter;

    @Column(name = "department_email", length = 150)
    private String departmentEmail;

    @Column(name = "department_phone", length = 15)
    private String departmentPhone;

    @Column(name = "working_days", length = 100)
    private String workingDays;

    @Column(name = "working_shift_id")
    private Long workingShiftId;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "department_logo", length = 255)
    private String departmentLogo;

    @Column(name = "document_path", length = 255)
    private String documentPath;

    @Column(name = "tags", columnDefinition = "json")
    private String tags;

    @Column(name = "keywords", columnDefinition = "TEXT")
    private String keywords;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "status", nullable = false)
    private Boolean status;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_by")
    private Long updatedBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted;
}
