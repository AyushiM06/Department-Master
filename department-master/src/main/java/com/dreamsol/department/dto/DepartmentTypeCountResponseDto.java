package com.dreamsol.department.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DepartmentTypeCountResponseDto {

    private String name;
    private Long count;
}