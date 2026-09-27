package com.dreamsol.common.excel;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ExcelHeader {

    private final String field;
    private final String header;
    private final boolean mandatory;
}