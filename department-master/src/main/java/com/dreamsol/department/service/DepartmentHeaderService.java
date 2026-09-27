package com.dreamsol.department.service;

import com.dreamsol.common.excel.ExcelHeader;
import com.dreamsol.common.table.TableHeader;
import com.dreamsol.department.dto.ExcelHeaderResponseDto;
import com.dreamsol.department.dto.TableHeaderResponseDto;
import com.dreamsol.department.excel.DepartmentExcelHeader;
import com.dreamsol.department.table.DepartmentTableHeader;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class DepartmentHeaderService {

    public List<ExcelHeaderResponseDto> getDepartmentExcelHeaders() {
        return DepartmentExcelHeader.IMPORT_HEADERS.stream().map(this::toExcelResponse).toList();
    }

    public List<TableHeaderResponseDto> getDepartmentTableHeaders() {
        return DepartmentTableHeader.DASHBOARD.stream().map(this::toTableResponse).toList();
    }

    public Map<String, List<TableHeaderResponseDto>> getDashboardHeaders() {
        Map<String, List<TableHeaderResponseDto>> headers = new LinkedHashMap<>();
        headers.put("departmentDetails", toTableResponse(DepartmentTableHeader.DASHBOARD));
        return headers;
    }

    public List<TableHeaderResponseDto> getImportPreviewHeaders() {
        return DepartmentTableHeader.IMPORT_PREVIEW.stream().map(this::toTableResponse).toList();
    }

    public List<TableHeaderResponseDto> getActivityHeaders() {
        return DepartmentTableHeader.ACTIVITY.stream().map(this::toTableResponse).toList();
    }

    private List<TableHeaderResponseDto> toTableResponse(List<TableHeader> headers) {
        return headers.stream().map(this::toTableResponse).toList();
    }

    private TableHeaderResponseDto toTableResponse(TableHeader header) {
        return new TableHeaderResponseDto(header.getField(), header.getHeader(), header.isVisible(), header.isSortable(), header.isFilterable(), header.getOrder());
    }

    private ExcelHeaderResponseDto toExcelResponse(ExcelHeader header) {
        return new ExcelHeaderResponseDto(header.getField(), header.getHeader(), header.isMandatory() ? "Mandatory" : "Optional");
    }
}