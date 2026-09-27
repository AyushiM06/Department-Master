package com.dreamsol.department.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DepartmentStatusCountResponseDto {

    private Long activeCount;
    private Long inactiveCount;
}