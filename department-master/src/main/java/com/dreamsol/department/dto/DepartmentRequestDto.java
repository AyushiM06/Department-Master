package com.dreamsol.department.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Optional;

@Getter
@Setter
public class DepartmentRequestDto {

    private Long id;

    private String departmentName;

    private String shortName;

    private String departmentType;

    private Long parentDepartment;

    private Long departmentHead;

    private List<Long> branches;

    private Long businessUnit;

    private String costCenter;

    private String departmentEmail;

    private String departmentPhone;

    private List<String> workingDays;

    private Long workingShift;

    private String description;

    private String departmentLogo;

    private String documentPath;

    private List<String> tags;

    private boolean status;

    private String keywords;

    private String remarks;

    public void setDepartmentName(String departmentName) {
        this.departmentName = trim(departmentName);
    }

    public void setShortName(String shortName) {
        this.shortName = trim(shortName);
    }

    public void setDepartmentType(String departmentType) {
        this.departmentType = trim(departmentType);
    }

    public void setCostCenter(String costCenter) {
        this.costCenter = trim(costCenter);
    }

    public void setDepartmentEmail(String departmentEmail) {
        this.departmentEmail = trim(departmentEmail);
    }

    public void setDepartmentPhone(String departmentPhone) {
        this.departmentPhone = trim(departmentPhone);
    }

    public void setDescription(String description) {
        this.description = trim(description);
    }

    public void setDepartmentLogo(String departmentLogo) {
        this.departmentLogo = trim(departmentLogo);
    }

    public void setDocumentPath(String documentPath) {
        this.documentPath = trim(documentPath);
    }

    public void setKeywords(String keywords) {
        this.keywords = trim(keywords);
    }

    public void setRemarks(String remarks) {
        this.remarks = trim(remarks);
    }

    private String trim(String value) {
        return Optional.ofNullable(value)
                .map(String::trim)
                .orElse(null);
    }
}