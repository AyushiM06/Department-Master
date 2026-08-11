package com.dreamsol.department.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class DepartmentResponse
{
    private Long id;

    private String departmentCode;

    private String departmentName;

    private String shortName;

    private String departmentType;

    private Long parentDepartmentId;

    private Long departmentHead;

    private String branchIds;

    private Long businessUnitId;

    private String costCenter;

    private String departmentEmail;

    private String departmentPhone;

    private String workingDays;

    private Long workingShiftId;

    private String description;

    private String departmentLogo;

    private String documentPath;

    private String tags;

    private String keywords;

    private String remarks;

    private Boolean status;

    private Long createdBy;

    private LocalDateTime createdAt;

    private Long updatedBy;

    private LocalDateTime updatedAt;
}
