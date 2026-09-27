import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { DepartmentRow } from "../../app/component/Material-react-table";
import {
  searchDepartments,
  getDepartmentCount,
  getDepartmentDropdownData,
  type DepartmentDropdownResponse,
} from "../../app/pages/department/departmentApi";

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface SortingState {
  id: string;
  desc: boolean;
}

export interface DepartmentFilterValues {
  search: string;
  fromDate: string;
  toDate: string;
  departmentType: string;
  branches: number[];
  businessUnit: string;
  status: boolean | "";
  departmentFilter: "all" | "active" | "inactive";
  dateMode: DateMode;
}

export type DateMode = "DATE_FILTER" | "SINCE_BEGINNING";

export interface DepartmentState extends DepartmentFilterValues {
  appliedFilters: DepartmentFilterValues;
  pagination: PaginationState;
  sorting: SortingState[];
  rows: DepartmentRow[];
  totalElements: number;
  activeCount: number;
  inactiveCount: number;
  isLoading: boolean;
  error: string | null;
  dropdownData: DepartmentDropdownResponse | null;
  dropdownLoading: boolean;
  dropdownLoaded: boolean;
  dropdownError: string | null;
}

const getDefaultDateRange = () => {
  const today = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(today.getDate() - 6);
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  return { fromDate: formatDate(oneWeekAgo), toDate: formatDate(today) };
};

const defaultDateRange = getDefaultDateRange();

const initialFilterValues: DepartmentFilterValues = {
  search: "",
  fromDate: defaultDateRange.fromDate,
  toDate: defaultDateRange.toDate,
  departmentType: "",
  branches: [],
  businessUnit: "",
  status: false,
  departmentFilter: "active",
  dateMode: "DATE_FILTER",
};

const initialState: DepartmentState = {
  ...initialFilterValues,
  appliedFilters: { ...initialFilterValues, branches: [] },
  pagination: { pageIndex: 0, pageSize: 10 },
  sorting: [{ id: "updatedAt", desc: true }],
  rows: [],
  totalElements: 0,
  activeCount: 0,
  inactiveCount: 0,
  isLoading: false,
  error: null,
  dropdownData: null,
  dropdownLoading: false,
  dropdownLoaded: false,
  dropdownError: null,
};

interface SearchDepartmentsPayload {
  globalSearch: string | null;
  departmentType: string | null;
  branches: number[] | null;
  businessUnit: number | null;
  status: boolean | null;
  fromDate: string | null;
  toDate: string | null;
  page: number;
  size: number;
  sortBy: string;
  direction: "asc" | "desc";
}

export const fetchDepartments = createAsyncThunk(
  "department/fetchDepartments",
  async (_unused: void, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { department: DepartmentState };
      const department = state.department;
      const filters = department.appliedFilters;
      const sort = department.sorting?.[0];
      const sortBy = sort?.id || "departmentName";
      const direction: "asc" | "desc" = sort?.desc ? "desc" : "asc";
      let finalStatus: boolean | null = null;

      if (filters.status !== "") {
        finalStatus = filters.status;
      } else if (filters.departmentFilter === "active") {
        finalStatus = false;
      } else if (filters.departmentFilter === "inactive") {
        finalStatus = true;
      } else if (filters.departmentFilter === "all") {
        finalStatus = null;
      }

      const selectedBranches = Array.isArray(filters.branches)
        ? filters.branches.map(Number).filter((id) => Number.isFinite(id))
        : [];

      const payload: SearchDepartmentsPayload = {
        globalSearch: filters.search.trim() || null,
        departmentType: filters.departmentType.trim() || null,
        branches: selectedBranches.length > 0 ? selectedBranches : null,
        businessUnit:
          filters.businessUnit !== "" ? Number(filters.businessUnit) : null,
        status: finalStatus,
        fromDate:
          filters.dateMode === "DATE_FILTER" && filters.fromDate
            ? `${filters.fromDate}T00:00:00`
            : null,
        toDate:
          filters.dateMode === "DATE_FILTER" && filters.toDate
            ? `${filters.toDate}T23:59:59`
            : null,
        page: department.pagination.pageIndex,
        size: department.pagination.pageSize,
        sortBy,
        direction,
      };

      console.log("DEPARTMENT SEARCH REQUEST:", payload);
      const response = await searchDepartments(payload);
      console.log("DEPARTMENT SEARCH RESPONSE:", response?.data);

      const pageData = response?.data?.data ?? response?.data ?? {};
      const content = Array.isArray(pageData?.content) ? pageData.content : [];
      const total = Number(pageData?.totalElements ?? 0);

      return {
        rows: content as DepartmentRow[],
        totalElements: Number.isFinite(total) ? total : 0,
      };
    } catch (error: any) {
      console.error("FETCH DEPARTMENTS ERROR:", error);
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to load departments",
      );
    }
  },
);

let departmentDropdownRequestInFlight = false;

export const fetchDepartmentDropdownData = createAsyncThunk(
  "department/fetchDepartmentDropdownData",
  async (_unused: void, { rejectWithValue }) => {
    departmentDropdownRequestInFlight = true;
    try {
      console.log("🔥 DROPDOWN API CALLING...");
      const response = await getDepartmentDropdownData();
      console.log("✅ DEPARTMENT DROPDOWN API RESPONSE:", response);
      return response;
    } catch (error: any) {
      console.error("❌ FETCH DEPARTMENT DROPDOWN ERROR:", error);
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to load department dropdown data",
      );
    } finally {
      departmentDropdownRequestInFlight = false;
    }
  },
  {
    condition: (_unused, { getState }) => {
      const state = getState() as { department: DepartmentState };
      const department = state.department;
      if (department.dropdownLoaded) {
        console.log("⛔ DROPDOWN ALREADY LOADED - API CALL SKIPPED");
        return false;
      }
      if (department.dropdownLoading || departmentDropdownRequestInFlight) {
        console.log(
          "⛔ DROPDOWN REQUEST ALREADY IN PROGRESS - API CALL SKIPPED",
        );
        return false;
      }
      return true;
    },
  },
);

export const fetchDepartmentCounts = createAsyncThunk(
  "department/fetchDepartmentCounts",
  async (
    payload: { fromDate?: string | null; toDate?: string | null } = {},
    { rejectWithValue },
  ) => {
    try {
      const response = await getDepartmentCount(
        payload.fromDate ?? null,
        payload.toDate ?? null,
      );
      return response;
    } catch (error: any) {
      console.error("FAILED TO FETCH DEPARTMENT COUNTS:", error);
      return rejectWithValue(
        error?.response?.data || "Failed to fetch department counts",
      );
    }
  },
);

const departmentSlice = createSlice({
  name: "department",
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
    setFromDate: (state, action: PayloadAction<string>) => {
      state.fromDate = action.payload;
      state.appliedFilters.fromDate = action.payload;
    },
    setToDate: (state, action: PayloadAction<string>) => {
      state.toDate = action.payload;
      state.appliedFilters.toDate = action.payload;
    },
    setDepartmentType: (state, action: PayloadAction<string>) => {
      state.departmentType = action.payload;
      state.appliedFilters.departmentType = action.payload;
    },
    setBranches: (state, action: PayloadAction<number[]>) => {
      state.branches = [...action.payload];
      state.appliedFilters.branches = [...action.payload];
    },
    setBusinessUnit: (state, action: PayloadAction<string>) => {
      state.businessUnit = action.payload;
      state.appliedFilters.businessUnit = action.payload;
    },
    setStatus: (state, action: PayloadAction<boolean | "">) => {
      state.status = action.payload;
      state.appliedFilters.status = action.payload;
    },
    applyFilters: (state) => {
      state.appliedFilters = {
        search: state.search,
        fromDate: state.fromDate,
        toDate: state.toDate,
        departmentType: state.departmentType,
        branches: [...state.branches],
        businessUnit: state.businessUnit,
        status: state.status,
        departmentFilter: state.departmentFilter,
        dateMode: state.dateMode,
      };
      state.pagination = {
        pageIndex: 0,
        pageSize: state.pagination.pageSize,
      };
    },
    setPagination: (state, action: PayloadAction<PaginationState>) => {
      state.pagination = action.payload;
    },
    setSorting: (state, action: PayloadAction<SortingState[]>) => {
      state.sorting = action.payload;
    },
    setDepartmentFilter: (
      state,
      action: PayloadAction<"all" | "active" | "inactive">,
    ) => {
      state.departmentFilter = action.payload;
      state.appliedFilters.departmentFilter = action.payload;
      state.pagination = {
        pageIndex: 0,
        pageSize: state.pagination.pageSize,
      };
    },
    setDateMode: (
      state,
      action: PayloadAction<"DATE_FILTER" | "SINCE_BEGINNING">,
    ) => {
      state.dateMode = action.payload;
      state.appliedFilters.dateMode = action.payload;
      state.pagination = {
        pageIndex: 0,
        pageSize: state.pagination.pageSize,
      };
    },
    resetFilters: (state) => {
      const resetValues = {
        ...initialFilterValues,
        branches: [],
      };

      state.search = resetValues.search;
      state.fromDate = resetValues.fromDate;
      state.toDate = resetValues.toDate;
      state.departmentType = resetValues.departmentType;
      state.branches = [];
      state.businessUnit = resetValues.businessUnit;
      state.status = resetValues.status;
      state.departmentFilter = resetValues.departmentFilter;
      state.dateMode = resetValues.dateMode;
      state.appliedFilters = {
        ...resetValues,
        branches: [],
      };
      state.pagination = {
        pageIndex: 0,
        pageSize: 10,
      };
      state.sorting = [{ id: "updatedAt", desc: true }];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchDepartmentDropdownData.pending, (state) => {
      state.dropdownLoading = true;
      state.dropdownError = null;
    });
    builder.addCase(fetchDepartmentDropdownData.fulfilled, (state, action) => {
      state.dropdownLoading = false;
      state.dropdownLoaded = true;
      state.dropdownData = action.payload;
      state.dropdownError = null;
    });
    builder.addCase(fetchDepartmentDropdownData.rejected, (state, action) => {
      state.dropdownLoading = false;
      state.dropdownLoaded = false;
      state.dropdownData = null;
      state.dropdownError =
        (action.payload as string) || "Failed to load department dropdown data";
    });
    builder.addCase(fetchDepartments.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchDepartments.fulfilled, (state, action) => {
      state.isLoading = false;
      state.rows = action.payload.rows;
      state.totalElements = action.payload.totalElements;
      state.error = null;
    });
    builder.addCase(fetchDepartments.rejected, (state, action) => {
      state.isLoading = false;
      state.rows = [];
      state.totalElements = 0;
      state.error = (action.payload as string) || "Failed to load departments";
    });
    builder.addCase(fetchDepartmentCounts.pending, (state) => {
      state.error = null;
    });
    builder.addCase(fetchDepartmentCounts.fulfilled, (state, action) => {
      state.activeCount = action.payload.activeCount;
      state.inactiveCount = action.payload.inactiveCount;
    });
    builder.addCase(fetchDepartmentCounts.rejected, (state, action) => {
      state.activeCount = 0;
      state.inactiveCount = 0;
      state.error =
        (action.payload as string) || "Failed to load department counts";
    });
  },
});

export const {
  setSearch,
  setFromDate,
  setToDate,
  setDepartmentType,
  setBranches,
  setBusinessUnit,
  setStatus,
  applyFilters,
  setPagination,
  setSorting,
  setDepartmentFilter,
  setDateMode,
  resetFilters,
} = departmentSlice.actions;

export default departmentSlice.reducer;
