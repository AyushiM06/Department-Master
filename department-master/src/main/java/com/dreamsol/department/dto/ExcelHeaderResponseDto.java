package com.dreamsol.department.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ExcelHeaderResponseDto {

    private String field;
    private String header;
    private String type;
}