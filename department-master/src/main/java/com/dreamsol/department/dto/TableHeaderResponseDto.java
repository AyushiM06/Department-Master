package com.dreamsol.department.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TableHeaderResponseDto {

    private String field;
    private String header;
    private boolean visible;
    private boolean sortable;
    private boolean filterable;
    private int order;
}