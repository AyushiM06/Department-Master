package com.dreamsol.department.dto;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

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
    @Pattern(regexp = "^[a-zA-Z]+(?: [a-zA-Z]+)*$", message = "Department name must contain alphabets only")
    private String departmentName;
    @Size(max = 50)
    @Pattern(regexp = "^[a-zA-Z]+(?: [a-zA-Z]+)*$", message = "Short name must contain alphabets with single spaces between words")
    private String shortName;
    @NotBlank(message = "Department type is required")
    @Size(max = 50)
    @Pattern(regexp = "^[a-zA-Z]+(?: [a-zA-Z]+)*$", message = "Department type must contain alphabets with single spaces between words")
    private String departmentType;
    private Long parentDepartmentId;
    private Long departmentHead;
    private List<Long> branchIds;
    private Long businessUnitId;
    @Size(max = 50)
    @Pattern(regexp = "^[a-zA-Z0-9]+(?: [a-zA-Z0-9]+)*$", message = "Cost center must not start or end with spaces")
    private String costCenter;
    @Email(message = "Invalid department email")
    @Size(max = 50)
    @Pattern(regexp = "^\\S+$", message = "Email must not contain spaces")
    private String departmentEmail;
    @Size(max = 15)
    @Pattern(regexp = "^[0-9]+$", message = "Department phone must contain only numbers")
    private String departmentPhone;
    private List<@Pattern(regexp = "^\\S(?:.*\\S)?$",
            message = "Value must not start or end with spaces") String> workingDays;
    private Long workingShiftId;
    @Pattern(regexp = "^\\S(?:.*\\S)?$", message = "Description must not start or end with spaces")
    private String description;
    @Pattern(regexp = "^\\S(?:.*\\S)?$", message = "Department logo must not start or end with spaces")
    private String departmentLogo;
    @Pattern(regexp = "^\\S(?:.*\\S)?$", message = "Document path must not start or end with spaces")
    private String documentPath;
    private List<@Pattern(regexp = "^\\S(?:.*\\S)?$",
            message = "Value must not start or end with spaces") String> tags;
    @Pattern(regexp = "^\\S(?:.*\\S)?$", message = "Keywords must not start or end with spaces")
    private String keywords;
    @Pattern(regexp = "^\\S(?:.*\\S)?$", message = "Remarks must not start or end with spaces")
    private String remarks;
    private Boolean status;
}
