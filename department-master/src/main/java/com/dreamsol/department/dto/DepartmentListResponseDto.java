package com.dreamsol.department.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class DepartmentListResponseDto {

    private Long id;
    private String departmentCode;
    private String departmentName;
    private String shortName;
    private String departmentType;
    private Long departmentHead;
    private List<Long> branches;
    private Long businessUnit;
    private String departmentEmail;
    private String departmentPhone;
    private List<String> workingDays;
    private boolean status;
    private Long createdBy;
    private LocalDateTime createdAt;
    private Long updatedBy;
    private LocalDateTime updatedAt;
    private String departmentLogoUuid;
    private String departmentLogoFileName;
    private String documentUuid;
    private String documentFileName;
    private Long parentDepartment;
    private String costCenter;
    private Long workingShift;
    private String description;
    private String departmentLogo;
    private String documentPath;
    private List<String> tags;
    private String keywords;
    private String remarks;

    public DepartmentListResponseDto(
            Long id,
            String departmentCode,
            String departmentName,
            String shortName,
            String departmentType,
            Long departmentHead,
            List<Long> branches,
            Long businessUnit,
            String departmentEmail,
            String departmentPhone,
            List<String> workingDays,
            boolean status,
            Long createdBy,
            LocalDateTime createdAt,
            Long updatedBy,
            LocalDateTime updatedAt
    ) {
        this.id = id;
        this.departmentCode = departmentCode;
        this.departmentName = departmentName;
        this.shortName = shortName;
        this.departmentType = departmentType;
        this.departmentHead = departmentHead;
        this.branches = branches;
        this.businessUnit = businessUnit;
        this.departmentEmail = departmentEmail;
        this.departmentPhone = departmentPhone;
        this.workingDays = workingDays;
        this.status = status;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.updatedBy = updatedBy;
        this.updatedAt = updatedAt;
    }
}