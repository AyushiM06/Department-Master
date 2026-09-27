package com.dreamsol.common.table;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TableHeader {

    private final String field;
    private final String header;
    private final boolean visible;
    private final boolean sortable;
    private final boolean filterable;
    private final int order;
}