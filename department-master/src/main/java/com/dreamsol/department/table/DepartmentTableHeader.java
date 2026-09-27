package com.dreamsol.department.table;
import com.dreamsol.common.table.TableHeader;
import java.util.List;
public final class DepartmentTableHeader {
    private DepartmentTableHeader() {}
    public static final List<TableHeader> DASHBOARD = List.of(
            new TableHeader("departmentCode", "Department Code", true, true, true, 1),
            new TableHeader("departmentName", "Department Name", true, true, true, 2),
            new TableHeader("departmentType", "Department Type", true, true, true, 3),
            new TableHeader("departmentHead", "Department Head", true, true, true, 4),
            new TableHeader("branches", "Branch", true, true, true, 5),
            new TableHeader("businessUnit", "Business Unit", true, true, true, 6),
            new TableHeader("departmentEmail", "Email", true, true, true, 7),
            new TableHeader("status", "Status", true, true, true, 8),
            new TableHeader("createdBy", "Created By", true, true, false, 9),
            new TableHeader("createdAt", "Created At", true, true, false, 10),
            new TableHeader("updatedBy", "Updated By", true, true, false, 11),
            new TableHeader("updatedAt", "Updated At", true, true, false, 12)
    );
    public static final List<TableHeader> IMPORT_PREVIEW = List.of(
            new TableHeader("departmentCode", "Department Code", true, false, false, 1),
            new TableHeader("departmentName", "Department Name", true, false, false, 2),
            new TableHeader("departmentHead", "Department Head", true, false, false, 3),
            new TableHeader("departmentType", "Department Type", true, false, false, 4),
            new TableHeader("branch", "Branch", true, false, false, 5),
            new TableHeader("businessUnit", "Business Unit", true, false, false, 6),
            new TableHeader("workingDays", "Working Days", true, false, false, 7),
            new TableHeader("departmentEmail", "Email", true, false, false, 8),
            new TableHeader("status", "Status", true, false, false, 9)
    );
    public static final List<TableHeader> ACTIVITY = List.of(
            new TableHeader("departmentCode", "Department Code", true, true, true, 1),
            new TableHeader("departmentName", "Department Name", true, true, true, 2),
            new TableHeader("departmentType", "Department Type", true, true, true, 3),
            new TableHeader("departmentHead", "Department Head", true, true, true, 4),
            new TableHeader("branches", "Branch", true, true, true, 5),
            new TableHeader("businessUnit", "Business Unit", true, true, true, 6),
            new TableHeader("departmentEmail", "Email", true, true, true, 7),
            new TableHeader("status", "Status", true, true, true, 8),
            new TableHeader("createdBy", "Created By", true, true, false, 9),
            new TableHeader("createdAt", "Created At", true, true, false, 10),
            new TableHeader("updatedBy", "Updated By", true, true, false, 11),
            new TableHeader("updatedAt", "Updated At", true, true, false, 12)
    );
}