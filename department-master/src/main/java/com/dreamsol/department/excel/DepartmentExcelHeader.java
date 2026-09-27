package com.dreamsol.department.excel;
import com.dreamsol.common.excel.ExcelHeader;
import java.util.List;

public final class DepartmentExcelHeader {

    private DepartmentExcelHeader() {
    }

    public static final List<ExcelHeader> IMPORT_HEADERS = List.of(
            new ExcelHeader("departmentName", "Department Name", true),
            new ExcelHeader("departmentHead", "Department Head", false),
            new ExcelHeader("departmentType", "Department Type", true),
            new ExcelHeader("branch", "Branch", true),
            new ExcelHeader("businessUnit", "Business Unit", false),
            new ExcelHeader("workingDays", "Working Days", true),
            new ExcelHeader("departmentEmail", "Department Email", false),
            new ExcelHeader("status", "Status", false),
            new ExcelHeader("createdBy", "Created By", false),
            new ExcelHeader("createdOn", "Created On", false),
            new ExcelHeader("updatedBy", "Updated By", false),
            new ExcelHeader("updatedOn", "Updated On", false));

    public static final List<ExcelHeader> EXPORT_HEADERS = List.of(
            new ExcelHeader("departmentCode", "Department Code", false),
            new ExcelHeader("departmentName", "Department Name", true),
            new ExcelHeader("departmentHead", "Department Head", false),
            new ExcelHeader("departmentType", "Department Type", true),
            new ExcelHeader("branch", "Branch", true),
            new ExcelHeader("businessUnit", "Business Unit", false),
            new ExcelHeader("workingDays", "Working Days", true),
            new ExcelHeader("departmentEmail", "Department Email", false),
            new ExcelHeader("status", "Status", false),
            new ExcelHeader("createdBy", "Created By", false),
            new ExcelHeader("createdOn", "Created On", false),
            new ExcelHeader("updatedBy", "Updated By", false),
            new ExcelHeader("updatedOn", "Updated On", false));
}