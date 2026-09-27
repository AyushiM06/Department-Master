package com.dreamsol.department.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DepartmentTypeStatusResponseDto {

    private String name;
    private Long active;
    private Long inactive;
}