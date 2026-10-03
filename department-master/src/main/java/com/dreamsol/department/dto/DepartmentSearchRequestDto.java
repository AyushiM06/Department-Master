package com.dreamsol.department.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class DepartmentSearchRequestDto {

    private String globalSearch;
    private String departmentType;
    private List<Long> branches;
    private Long businessUnit;
    private Boolean status;
    private LocalDateTime fromDate;
    private LocalDateTime toDate;
    private int page = 0;
    private int size = 10;
    private String sortBy = "departmentName";
    private String direction = "asc";
}