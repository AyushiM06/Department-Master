package com.dreamsol.department.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DepartmentRequest
{
    @NotBlank(message = "Department code is required")
    @Size(max = 20, message = "Department code can not exceed 20 characters")
    @Pattern(regexp = "^[a-zA-Z0-9]+$", message = "Department code must be alphanumeric")
    private String departmentCode;

    @NotBlank(message = "Department name is required")
    @Size(max = 150, message = "Department name can not exceed 150 characters")
    @Pattern(regexp = "^[a-zA-Z ]+$", message = "Department name must contain alphabets only")
    private String departmentName;

    @Size(max = 50)
    private String shortName;

    @NotBlank(message = "Department type is required")
    @Size(max = 50)
    private String departmentType;

    private Long parentDepartmentId;

    private Long departmentHead;

    private String branchIds;

    private Long businessUnitId;

    @Size(max = 50)
    private String costCenter;

    @Email(message = "Invalid department email")
    @Size(max = 50)
    private String departmentEmail;

    @Size(max = 15)
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

}
