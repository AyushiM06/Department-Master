package com.dreamsol.department.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentHistoryResponseDto {

    private Long id;

    private Long departmentId;

    private String departmentCode;

    private String action;

    private String performedBy;

    private LocalDateTime performedAt;

    private Map<String, Map<String, Object>> changes;
}