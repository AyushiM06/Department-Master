package com.dreamsol.department.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class DepartmentImportRequestDto {

    private String departmentName;
    private String departmentType;
    private String departmentEmail;
    private List<Long> branches;
    private Long departmentHead;
    private Long businessUnit;
    private List<String> workingDays;
    private Boolean status;
}