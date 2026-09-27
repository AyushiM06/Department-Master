package com.dreamsol.department.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentDetailResponseDto {

    private Long id;

    private String departmentCode;

    private String departmentName;

    private String shortName;

    private String departmentType;

    private Long parentDepartment;

    private String parentDepartmentName;

    private Long departmentHead;

    private List<Long> branches;

    private List<String> branchNames;

    private Long businessUnit;

    private String businessUnitName;

    private String costCenter;

    private String departmentEmail;

    private String departmentPhone;

    private List<String> workingDays;

    private Long workingShift;

    private String workingShiftName;

    private String description;

    private String departmentLogo;

    private String documentPath;

    private List<String> tags;

    private String keywords;

    private String remarks;

    private boolean status;

    private Long createdBy;

    private LocalDateTime createdAt;

    private Long updatedBy;

    private LocalDateTime updatedAt;
}