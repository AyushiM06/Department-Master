import { useMemo, useState } from "react";
import { Box, Button } from "@mui/material";

import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_PaginationState,
  type MRT_SortingState,
  type MRT_TableOptions,
} from "material-react-table";

export interface DepartmentRow {
  id: number;

  departmentCode: string;

  departmentName: string;

  shortName?: string | null;

  departmentType: string;

  parentDepartmentId?: number | null;

  parentDepartmentName?: string | null;

  departmentHead?: number | null;

  branchIds?: number[];

  branchNames?: string[];

  businessUnitId?: number | null;

  businessUnitName?: string | null;

  costCenter?: string | null;

  departmentEmail?: string | null;

  departmentPhone?: string | null;

  workingDays?: string[];

  workingShiftId?: number | null;

  workingShiftName?: string | null;

  description?: string | null;

  departmentLogo?: string | null;

  documentPath?: string | null;

  departmentLogoUuid?: string | null;

  departmentLogoFileName?: string | null;

  documentUuid?: string | null;

  documentFileName?: string | null;

  tags?: string[];

  keywords?: string | null;

  remarks?: string | null;

  status: boolean;

  createdBy?: string | null;

  createdAt?: string | null;

  updatedBy?: string | null;

  updatedAt?: string | null;
}

export type DepartmentPagination = MRT_PaginationState;

export type DepartmentSorting = MRT_SortingState;

export interface DepartmentTableProps<T extends object> {
  rows: T[];
  columns: MRT_ColumnDef<T, any>[];

  totalElements?: number;

  pagination?: MRT_PaginationState;

  setPagination?: (
    updater:
      | MRT_PaginationState
      | ((prev: MRT_PaginationState) => MRT_PaginationState),
  ) => void;

  sorting?: MRT_SortingState;

  setSorting?: (
    updater: MRT_SortingState | ((prev: MRT_SortingState) => MRT_SortingState),
  ) => void;

  isLoading?: boolean;

  enablePagination?: boolean;

  manualPagination?: boolean;

  manualSorting?: boolean;

  maxHeight?: string | number;

  onCountClick?: (row: T) => void | Promise<void>;

  onPercentageClick?: (row: T) => void | Promise<void>;

  onActiveClick?: (row: T) => void | Promise<void>;

  onInactiveClick?: (row: T) => void | Promise<void>;

  onDepartmentCodeClick?: (row: T) => void | Promise<void>;

  tableOptions?: Partial<MRT_TableOptions<T>>;
}

function DepartmentTable<T extends object>({
  rows,
  columns,
  totalElements,
  pagination,
  setPagination,
  sorting,
  setSorting,
  isLoading = false,
  enablePagination = true,
  manualPagination = true,
  manualSorting = true,
  maxHeight = "calc(100vh - 360px)",
  onCountClick,
  onPercentageClick,
  onActiveClick,
  onInactiveClick,
  onDepartmentCodeClick,
  tableOptions,
}: DepartmentTableProps<T>) {
  const [internalSorting, setInternalSorting] = useState<MRT_SortingState>([]);

  const isControlledSorting = !!setSorting;

  const activeSorting: MRT_SortingState = isControlledSorting
    ? (sorting ?? [])
    : internalSorting;

  const handleSortingChange = (
    updater: MRT_SortingState | ((prev: MRT_SortingState) => MRT_SortingState),
  ) => {
    const nextSorting =
      typeof updater === "function" ? updater(activeSorting) : updater;

    if (isControlledSorting) {
      setSorting?.(nextSorting);
    } else {
      setInternalSorting(nextSorting);
    }
  };

  const tableColumns = useMemo<MRT_ColumnDef<T, any>[]>(() => {
    return columns.map((column) => {
      const accessorKey = (column as any).accessorKey;
      if (onDepartmentCodeClick && accessorKey === "departmentCode") {
        return {
          ...column,

          Cell: ({ row }: any) => (
            <Button
              variant="text"
              onClick={() => onDepartmentCodeClick(row.original)}
              sx={{
                minWidth: 0,
                p: 0,
                color: "#0F766E",
                fontWeight: 800,
                textDecoration: "underline",
                textTransform: "none",
                fontSize: 13,

                "&:hover": {
                  backgroundColor: "transparent",
                  color: "#115E59",
                },
              }}
            >
              {row.original.departmentCode}
            </Button>
          ),
        };
      }
      if (onCountClick && accessorKey === "count") {
        return {
          ...column,

          Cell: ({ row }: any) => (
            <Button
              variant="text"
              onClick={() => onCountClick(row.original)}
              sx={{
                minWidth: 0,
                p: 0,
                color: "#0F766E",
                fontWeight: 800,
                textDecoration: "underline",
                textTransform: "none",
                fontSize: 13,

                "&:hover": {
                  backgroundColor: "transparent",
                  color: "#115E59",
                },
              }}
            >
              {row.original.count}
            </Button>
          ),
        };
      }

      if (onActiveClick && accessorKey === "active") {
        return {
          ...column,

          Cell: ({ row }: any) => (
            <Button
              variant="text"
              onClick={() => onActiveClick(row.original)}
              sx={{
                minWidth: 0,
                p: 0,
                color: "#15803D",
                fontWeight: 800,
                textDecoration: "underline",
                textTransform: "none",
                fontSize: 13,

                "&:hover": {
                  backgroundColor: "transparent",
                  color: "#166534",
                },
              }}
            >
              {row.original.active}
            </Button>
          ),
        };
      }

      if (onInactiveClick && accessorKey === "inactive") {
        return {
          ...column,

          Cell: ({ row }: any) => (
            <Button
              variant="text"
              onClick={() => onInactiveClick(row.original)}
              sx={{
                minWidth: 0,
                p: 0,
                color: "#DC2626",
                fontWeight: 800,
                textDecoration: "underline",
                textTransform: "none",
                fontSize: 13,

                "&:hover": {
                  backgroundColor: "transparent",
                  color: "#B91C1C",
                },
              }}
            >
              {row.original.inactive}
            </Button>
          ),
        };
      }

      if (onPercentageClick && accessorKey === "percentage") {
        return {
          ...column,

          Cell: ({ row }: any) => (
            <Button
              variant="text"
              onClick={() => onPercentageClick(row.original)}
              sx={{
                minWidth: 0,
                p: 0,
                color: "#15803D",
                fontWeight: 800,
                textDecoration: "underline",
                textTransform: "none",
                fontSize: 13,

                "&:hover": {
                  backgroundColor: "transparent",
                  color: "#166534",
                },
              }}
            >
              {row.original.percentage}
            </Button>
          ),
        };
      }

      return column;
    });
  }, [
    columns,
    onCountClick,
    onPercentageClick,
    onActiveClick,
    onInactiveClick,
    onDepartmentCodeClick,
  ]);

  const table = useMaterialReactTable<T>({
    ...tableOptions,

    columns: tableColumns,

    data: rows,

    enablePagination,

    manualPagination: enablePagination && manualPagination,

    rowCount:
      enablePagination && manualPagination
        ? (totalElements ?? rows.length)
        : rows.length,

    enableSorting: true,

    manualSorting,

    state: {
      ...(pagination
        ? {
            pagination,
          }
        : {}),

      sorting: activeSorting,

      isLoading,
    },

    ...(setPagination
      ? {
          onPaginationChange: setPagination,
        }
      : {}),

    onSortingChange: handleSortingChange,

    enableGlobalFilter: false,

    enableColumnFilters: false,

    enableDensityToggle: false,

    enableFullScreenToggle: false,

    enableColumnActions: false,

    enableHiding: false,

    enableColumnResizing: false,

    layoutMode: tableOptions?.layoutMode ?? "semantic",

    muiPaginationProps: {
      rowsPerPageOptions: [5, 10, 20, 50],

      showFirstButton: true,

      showLastButton: true,

      ...tableOptions?.muiPaginationProps,
    },

    muiTablePaperProps: {
      ...tableOptions?.muiTablePaperProps,

      sx: {
        boxShadow: "none",

        borderRadius: 0,

        backgroundColor: "#FFFFFF",

        width: "100%",

        maxWidth: "100%",

        minWidth: 0,

        overflow: "hidden",

        ...(tableOptions?.muiTablePaperProps as any)?.sx,
      },
    },

    muiTableProps: {
      ...tableOptions?.muiTableProps,

      sx: {
        width: "100%",

        minWidth: "max-content",

        borderCollapse: "separate",

        borderSpacing: 0,

        ...(tableOptions?.muiTableProps as any)?.sx,
      },
    },

    muiTableHeadCellProps: {
      ...tableOptions?.muiTableHeadCellProps,

      sx: {
        backgroundColor: "#0F766E",

        color: "#FFFFFF",

        fontWeight: 800,

        fontSize: 13,

        borderBottom: "1px solid #115E59",

        py: 1.5,

        px: 2,

        whiteSpace: "nowrap",

        minWidth: 100,

        overflow: "hidden",

        textOverflow: "ellipsis",

        "& .MuiTableSortLabel-root": {
          color: "#FFFFFF !important",
        },

        "& .MuiTableSortLabel-icon": {
          color: "#FFFFFF !important",

          opacity: 0.9,
        },

        "& .MuiIconButton-root": {
          color: "#FFFFFF",
        },

        "& .MuiIconButton-root:hover": {
          backgroundColor: "rgba(255,255,255,0.12)",
        },

        "&:first-of-type": {
          borderTopLeftRadius: 0,
        },

        "&:last-of-type": {
          borderTopRightRadius: 0,
        },

        ...(tableOptions?.muiTableHeadCellProps as any)?.sx,
      },
    },

    muiTableBodyCellProps: {
      ...tableOptions?.muiTableBodyCellProps,

      sx: {
        fontSize: 14,

        color: "#334155",

        backgroundColor: "#FFFFFF",

        borderBottom: "1px solid #D7E6E3",

        py: 1.5,

        px: 2,

        minWidth: 100,

        overflow: "hidden",

        textOverflow: "ellipsis",

        whiteSpace: "nowrap",

        ...(tableOptions?.muiTableBodyCellProps as any)?.sx,
      },
    },

    muiTableBodyRowProps: {
      ...tableOptions?.muiTableBodyRowProps,

      sx: {
        transition: "background-color 0.15s ease",

        "&:hover td": {
          backgroundColor: "#F0FDFA",
        },

        "&:last-child td": {
          borderBottom: "none",
        },

        ...(tableOptions?.muiTableBodyRowProps as any)?.sx,
      },
    },

    muiTableContainerProps: {
      ...tableOptions?.muiTableContainerProps,

      sx: {
        width: "100%",

        maxWidth: "100%",

        minWidth: 0,

        maxHeight,

        overflowX: "auto",

        overflowY: "auto",

        position: "relative",

        boxSizing: "border-box",

        backgroundColor: "#FFFFFF",

        "&::-webkit-scrollbar": {
          width: "8px",

          height: "8px",
        },

        "&::-webkit-scrollbar-track": {
          background: "#E6F4F2",
        },

        "&::-webkit-scrollbar-thumb": {
          background: "#99F6E4",

          borderRadius: "10px",
        },

        "&::-webkit-scrollbar-thumb:hover": {
          background: "#5EEAD4",
        },

        scrollbarWidth: "thin",

        ...(tableOptions?.muiTableContainerProps as any)?.sx,
      },
    },
  });

  return (
    <Box
      sx={{
        width: "100%",

        maxWidth: "100%",

        minWidth: 0,

        overflow: "hidden",

        position: "relative",

        backgroundColor: "#FFFFFF",
      }}
    >
      <MaterialReactTable table={table} />
    </Box>
  );
}

export default DepartmentTable;
