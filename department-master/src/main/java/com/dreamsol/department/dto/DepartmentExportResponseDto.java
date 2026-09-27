package com.dreamsol.department.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@AllArgsConstructor
public class DepartmentExportResponseDto {

    private String departmentCode;
    private String departmentName;
    private Long departmentHead;
    private String departmentType;
    private List<Long> branches;
    private Long businessUnit;
    private List<String> workingDays;
    private String departmentEmail;
    private boolean status;
    private Long createdBy;
    private LocalDateTime createdAt;
    private Long updatedBy;
    private LocalDateTime updatedAt;
}