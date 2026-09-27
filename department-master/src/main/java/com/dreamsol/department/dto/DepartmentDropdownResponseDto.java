package com.dreamsol.department.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@RequiredArgsConstructor
public class DepartmentDropdownResponseDto {
    private Long id;
    private String name;
}