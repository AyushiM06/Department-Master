import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../../store/store";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import BusinessIcon from "@mui/icons-material/Business";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from "@mui/icons-material/Description";
import axios from "axios";
import {
  fetchDepartments,
  fetchDepartmentCounts,
  applyFilters,
  setSearch,
  setFromDate,
  setToDate,
  setDepartmentType,
  setBranches,
  setBusinessUnit,
  setStatus,
  setPagination,
  setSorting,
  setDepartmentFilter,
  setDateMode,
  resetFilters,
  fetchDepartmentDropdownData,
} from "../../../store/slices/departmentSlice";
import {
  Box,
  Button,
  Card,
  Chip,
  Drawer,
  Grid,
  Paper,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Alert,
  IconButton,
  Tooltip,
  CircularProgress,
  Popover,
  Divider,
} from "@mui/material";
import type { MRT_ColumnDef } from "material-react-table";
import DepartmentTable from "../../component/Material-react-table";
import {
  deleteDepartment,
  importDepartments,
  exportDepartments,
  exportDepartmentsByEmail,
  downloadDepartmentTemplate,
  downloadDepartmentAttachment,
  createDepartment,
  createImportEmailNotification,
  getAllUsers,
  getDepartmentExcelHeaders,
  getDepartmentActivityHeaders,
  getDepartmentHistory,
  searchDepartments,
  searchEmployees,
  type DepartmentSavePayload,
  type UserLookupResponse,
  type ExcelHeader,
} from "./departmentApi";
import DepartmentFilters from "./department-filter";
import AddDepartment from "./add-department";
import UpdateDepartment from "./update-department";
import {
  canAddDepartment as canAddDepartmentPermission,
  canUpdateDepartment as canUpdateDepartmentPermission,
  canDeleteDepartment as canDeleteDepartmentPermission,
  canImportExport as canImportExportPermission,
} from "../../../utils/rolePermissions";
const THEME = {
  primary: "#0F766E",
  primaryHover: "#115E59",
  darkTeal: "#173F3B",
  primaryLight: "#E6F4F2",
  background: "#F4F8F7",
  textSecondary: "#647A76",
  border: "#D7E6E3",
  shadow: "0 4px 18px rgba(23, 63, 59, 0.07)",
};
const TEXT_CELL = { color: "#475569", fontWeight: 600 };
const CHIP = { fontWeight: 700, borderRadius: 1.5 };
const IMPORT_PREVIEW_TABLE_OPTIONS = {
  enableSorting: false,
  enableGlobalFilter: false,
  enableColumnFilters: false,
  enableDensityToggle: false,
  enableFullScreenToggle: false,
  enableColumnActions: false,
  enableHiding: false,
  muiTablePaperProps: {
    sx: { border: "none", boxShadow: "none", borderRadius: 0 },
  },
  muiTableHeadCellProps: {
    sx: {
      backgroundColor: THEME.primary,
      color: "#FFFFFF",
      fontWeight: 800,
      fontSize: 12,
      whiteSpace: "nowrap",
      borderBottom: "none",
    },
  },
  muiTableBodyCellProps: {
    sx: {
      color: "#475569",
      fontSize: 12,
      fontWeight: 600,
      whiteSpace: "nowrap",
      borderBottom: `1px solid ${THEME.border}`,
    },
  },
  muiTableBodyRowProps: {
    sx: { "&:hover": { backgroundColor: THEME.primaryLight } },
  },
  muiTableContainerProps: {
    sx: {
      maxHeight: 300,
      overflowX: "auto",
      overflowY: "auto",
      "&::-webkit-scrollbar": { width: 7, height: 7 },
      "&::-webkit-scrollbar-track": { backgroundColor: "#F8FAFC" },
      "&::-webkit-scrollbar-thumb": {
        backgroundColor: "#7CCFC5",
        borderRadius: 10,
      },
      "&::-webkit-scrollbar-thumb:hover": { backgroundColor: THEME.primary },
    },
  },
};
type ImportRow = {
  rowNumber: number;
  departmentCode?: string;
  departmentName?: string;
  departmentHead?: string;
  departmentType?: string;
  branch?: string;
  businessUnit?: string;
  workingDays?: string[] | string | null;
  departmentEmail?: string;
  status?: string;
  createdBy?: string;
  createdOn?: string;
  updatedBy?: string;
  updatedOn?: string;
  type?: "CORRECT" | "INCORRECT" | "DUPLICATE";
  reason?: string;
};
type ImportResult = {
  totalRows: number;
  correctCount: number;
  incorrectCount: number;
  duplicateCount: number;
  correct: ImportRow[];
  incorrect: ImportRow[];
  duplicate: ImportRow[];
  saveData?: DepartmentSavePayload[];
  importFilePath?: string;
  importFileName?: string;
};
type DepartmentHistoryChange = {
  old: unknown;
  new: unknown;
};
type DepartmentHistory = {
  id: number;
  departmentId: number;
  departmentCode: string;
  action: "CREATED" | "UPDATED" | "INACTIVATED";
  performedBy: string;
  performedAt: string;
  changes: Record<string, DepartmentHistoryChange>;
};
export type DepartmentRow = {
  id: number;
  departmentCode: string;
  departmentName: string;
  shortName?: string | null;
  departmentType: string;
  parentDepartment?: number | null;
  departmentHead?: number | null;
  branches?: number[];
  businessUnit?: number | null;
  costCenter?: string | null;
  departmentEmail?: string | null;
  departmentPhone?: string | null;
  workingDays?: string[];
  workingShift?: number | null;
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
};
type DropdownOption = {
  label: string;
  value: string | number;
};
const formatDate = (value?: string | null) => {
  if (!value) return "NA";

  const normalizedValue =
    value.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(value) ? value : `${value}Z`;

  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};
const formatFilterDate = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  return `${day}-${month}-${year}`;
};
const FilterChip = ({
  label,
  color = "#475569",
  background = "#F1F5F9",
  onDelete,
}: {
  label: string;
  color?: string;
  background?: string;
  onDelete?: () => void;
}) => (
  <Chip
    label={label}
    size="small"
    onDelete={onDelete}
    sx={{
      ...CHIP,
      color,
      backgroundColor: background,
      "& .MuiChip-deleteIcon": { color, fontSize: 18, "&:hover": { color } },
    }}
  />
);
function DepartmentActivity() {
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((s: RootState) => s.department);
  const canAddDepartment = canAddDepartmentPermission();
  const canUpdateDepartment = canUpdateDepartmentPermission();
  const canDeleteDepartment = canDeleteDepartmentPermission();
  const canImportExport = canImportExportPermission();
  const {
    rows,
    totalElements,
    isLoading,
    activeCount,
    inactiveCount,
    search,
    fromDate,
    toDate,
    departmentType,
    branches,
    businessUnit,
    status,
    pagination,
    sorting,
    departmentFilter,
    dateMode,
  } = state;
  const [filtersChanged, setFiltersChanged] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] =
    useState<DepartmentRow | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<
    number | null
  >(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading] = useState(false);
  const [importResultOpen, setImportResultOpen] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [, setImporting] = useState(false);
  const [savingImported, setSavingImported] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [templateDownloadLoading, setTemplateDownloadLoading] = useState(false);
  const [isSearchApplied, setIsSearchApplied] = useState(false);
  const [branchPopoverAnchor, setBranchPopoverAnchor] =
    useState<HTMLElement | null>(null);
  const { dropdownData, dropdownLoading, dropdownLoaded } = state;
  const departmentTypeOptions = useMemo<DropdownOption[]>(
    () =>
      Array.isArray(dropdownData?.departmentTypes)
        ? dropdownData.departmentTypes.map((item) => ({
            label: String(item.name),
            value: String(item.name),
          }))
        : [],
    [dropdownData],
  );
  const branchOptions = useMemo<DropdownOption[]>(
    () =>
      Array.isArray(dropdownData?.branches)
        ? dropdownData.branches.map((item) => ({
            label: String(item.name),
            value: Number(item.id),
          }))
        : [],
    [dropdownData],
  );
  const businessUnitOptions = useMemo<DropdownOption[]>(
    () =>
      Array.isArray(dropdownData?.businessUnits)
        ? dropdownData.businessUnits.map((item) => ({
            label: String(item.name),
            value: Number(item.id),
          }))
        : [],
    [dropdownData],
  );
  const workingShiftOptions = useMemo<DropdownOption[]>(
    () =>
      Array.isArray(dropdownData?.workingShifts)
        ? dropdownData.workingShifts.map((item) => ({
            label: String(item.name),
            value: Number(item.id),
          }))
        : [],
    [dropdownData],
  );
  const [excelHeaders, setExcelHeaders] = useState<ExcelHeader[]>([]);
  const [activityHeaders, setActivityHeaders] = useState<
    Awaited<ReturnType<typeof getDepartmentActivityHeaders>>
  >([]);
  const [users, setUsers] = useState<UserLookupResponse[]>([]);
  const [departmentHeadOptions, setDepartmentHeadOptions] = useState<
    DropdownOption[]
  >([]);
  const [parentDepartmentOptions, setParentDepartmentOptions] = useState<
    DropdownOption[]
  >([]);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [departmentHistory, setDepartmentHistory] = useState<
    DepartmentHistory[]
  >([]);
  const [historyDepartment, setHistoryDepartment] =
    useState<DepartmentRow | null>(null);
  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(
      fetchDepartmentCounts({
        fromDate: dateMode === "DATE_FILTER" ? fromDate : null,
        toDate: dateMode === "DATE_FILTER" ? toDate : null,
      }),
    );
  }, [dispatch]);
  useEffect(() => {
    const loadExcelHeaders = async () => {
      try {
        const headers = await getDepartmentExcelHeaders();
        setExcelHeaders(headers);
      } catch {
        setExcelHeaders([]);
      }
    };
    loadExcelHeaders();
  }, []);
  useEffect(() => {
    const loadActivityHeaders = async () => {
      try {
        setActivityHeaders(await getDepartmentActivityHeaders());
      } catch {
        setActivityHeaders([]);
      }
    };
    loadActivityHeaders();
  }, []);
  useEffect(() => {
    if (!dropdownLoaded && !dropdownLoading) {
      dispatch(fetchDepartmentDropdownData());
    }
  }, [dispatch, dropdownLoaded, dropdownLoading]);
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch {
        setUsers([]);
      }
    };
    loadUsers();
  }, []);
  const userMap = useMemo(() => {
    return new Map<number, string>(
      users.map((user) => [user.id, user.username]),
    );
  }, [users]);
  useEffect(() => {
    const loadDepartmentHeads = async () => {
      try {
        const employees = await searchEmployees("");
        const options = Array.isArray(employees)
          ? employees
              .map((employee: { id: number; name: string }) => ({
                label: String(employee.name).trim(),
                value: Number(employee.id),
              }))
              .filter(
                (employee: DropdownOption) =>
                  employee.label && Number.isFinite(Number(employee.value)),
              )
          : [];
        setDepartmentHeadOptions(options);
      } catch (error) {
        setDepartmentHeadOptions([]);
      }
    };
    loadDepartmentHeads();
  }, []);
  useEffect(() => {
    const loadParentDepartments = async () => {
      try {
        const response = await searchDepartments({
          globalSearch: null,
          branches: null,
          page: 0,
          size: 1000,
          sortBy: "departmentName",
          direction: "asc",
        });
        const content = Array.isArray(response?.data?.content)
          ? response.data.content
          : [];
        const options: DropdownOption[] = content
          .filter(
            (department: any) =>
              department?.id != null && department?.departmentName,
          )
          .map((department: any) => ({
            label: String(department.departmentName).trim(),
            value: Number(department.id),
          }))
          .filter(
            (option: DropdownOption) =>
              option.label && Number.isFinite(Number(option.value)),
          );
        setParentDepartmentOptions(options);
      } catch (error) {
        setParentDepartmentOptions([]);
      }
    };
    loadParentDepartments();
  }, []);
  const getEmployeeName = (value: unknown) => {
    if (value === null || value === undefined || value === "") {
      return "NA";
    }
    const option = departmentHeadOptions.find(
      (item) => String(item.value) === String(value),
    );
    return option?.label ?? "NA";
  };
  const getUserName = (value?: string | number | null) => {
    if (value === null || value === undefined || value === "") {
      return "NA";
    }
    const userId = Number(value);
    if (!Number.isFinite(userId)) {
      return String(value);
    }
    return userMap.get(userId) ?? "Unknown User";
  };
  const findOption = (
    options: DropdownOption[],
    value: string | number | null | undefined,
  ) =>
    options.find((option) => String(option.value) === String(value))?.label ??
    String(value ?? "");
  const getDepartmentTypeName = (value?: string | null) =>
    findOption(departmentTypeOptions, value);
  const getBranchName = (value?: string | number | null) =>
    value === null || value === undefined || value === ""
      ? ""
      : findOption(branchOptions, value);
  const selectedBranches = branches
    .map((id) => ({ id, name: getBranchName(id) }))
    .filter((branch) => Boolean(branch.name));
  const visibleBranches = selectedBranches.slice(0, 3);
  const remainingBranches = selectedBranches.slice(3);
  const handleRemoveBranch = async (branchIdToRemove: number) => {
    await handleRemoveFilter(() => {
      dispatch(setBranches(branches.filter((id) => id !== branchIdToRemove)));
    });
  };
  const getBusinessUnitName = (value?: string | number | null) =>
    value === null || value === undefined || value === ""
      ? ""
      : findOption(businessUnitOptions, value);
  const resetPage = () =>
    dispatch(setPagination({ pageIndex: 0, pageSize: pagination.pageSize }));
  const handleSearchChange = (value: string) => {
    dispatch(setSearch(value));
    setIsSearchApplied(false);
  };
  const handleSearchClick = () => {
    if (isSearchApplied) {
      dispatch(setSearch(""));
      dispatch(applyFilters());
      setIsSearchApplied(false);
      resetPage();
      dispatch(fetchDepartments());
      return;
    }
    const value = search.trim();
    if (!value) {
      return;
    }
    dispatch(applyFilters());
    setIsSearchApplied(true);
    resetPage();
    dispatch(fetchDepartments());
  };
  const handleDepartmentTypeChange = (value: string) => {
    dispatch(setDepartmentType(value));
    setFiltersChanged(true);
  };
  const handleBranchChange = (value: number[]) => {
    dispatch(setBranches(value));
    setFiltersChanged(true);
  };
  const handleBusinessUnitChange = (value: string) => {
    dispatch(setBusinessUnit(value));
    setFiltersChanged(true);
  };
  const handleStatusChange = (value: boolean | "") => {
    dispatch(setStatus(value));
    setFiltersChanged(true);
  };
  const handleFromDateChange = (value: string) => {
    dispatch(setFromDate(value));
    setFiltersChanged(true);
  };
  const handleToDateChange = (value: string) => {
    dispatch(setToDate(value));
    setFiltersChanged(true);
  };
  const handleDateModeChange = async (
    mode: "DATE_FILTER" | "SINCE_BEGINNING",
  ) => {
    dispatch(setDateMode(mode));
    if (mode === "SINCE_BEGINNING") {
      await dispatch(fetchDepartmentCounts({ fromDate: null, toDate: null }));
      return;
    }
    await dispatch(fetchDepartmentCounts({ fromDate, toDate }));
    await dispatch(fetchDepartments());
  };
  const handleApplyFilters = async () => {
    if (!filtersChanged) {
      return;
    }
    try {
      dispatch(applyFilters());
      resetPage();
      await dispatch(fetchDepartments());
      await dispatch(
        fetchDepartmentCounts({
          fromDate: dateMode === "DATE_FILTER" ? fromDate : null,
          toDate: dateMode === "DATE_FILTER" ? toDate : null,
        }),
      );
      setFiltersChanged(false);
    } catch (error) {}
  };
  const handleReset = () => {
    dispatch(resetFilters());
    setIsSearchApplied(false);
    resetPage();
    dispatch(fetchDepartments());
  };
  const handleRemoveFilter = async (
    clearFilter: () => void,
    clearDepartmentTile = false,
  ) => {
    const hadUnappliedChanges = filtersChanged;
    clearFilter();
    if (clearDepartmentTile) {
      dispatch(setDepartmentFilter("all"));
    }
    if (hadUnappliedChanges) {
      setFiltersChanged(true);
      return;
    }
    dispatch(setPagination({ pageIndex: 0, pageSize: pagination.pageSize }));
    dispatch(applyFilters());
    await dispatch(fetchDepartments());
  };
  const handleTileClick = (filter: "all" | "active" | "inactive") => {
    const tileStatus =
      filter === "active" ? false : filter === "inactive" ? true : "";
    dispatch(setDepartmentFilter(filter));
    dispatch(setStatus(tileStatus));
    dispatch(applyFilters());
    setFiltersChanged(false);
    resetPage();
    dispatch(fetchDepartments());
  };
  const handlePaginationChange = (
    value:
      | typeof pagination
      | ((previous: typeof pagination) => typeof pagination),
  ) => {
    const next = typeof value === "function" ? value(pagination) : value;
    dispatch(setPagination(next));
    dispatch(fetchDepartments());
  };
  const handleSortingChange = (
    value: typeof sorting | ((previous: typeof sorting) => typeof sorting),
  ) => {
    const next = typeof value === "function" ? value(sorting) : value;
    dispatch(setSorting(next));
    resetPage();
    dispatch(fetchDepartments());
  };
  const handleAddDepartment = () => {
    if (!canAddDepartment) {
      return;
    }
    setSelectedDepartment(null);
    setIsUpdateFormOpen(false);
    setIsAddFormOpen(true);
  };
  const handleEditDepartment = (department: DepartmentRow) => {
    if (!canUpdateDepartment) {
      return;
    }
    setSelectedDepartment(department);
    setIsAddFormOpen(false);
    setIsUpdateFormOpen(true);
  };
  const handleDepartmentHistory = async (department: DepartmentRow) => {
    try {
      setHistoryDepartment(department);
      setHistoryDialogOpen(true);
      setHistoryLoading(true);
      setDepartmentHistory([]);
      const historyData = await getDepartmentHistory(department.id);
      setDepartmentHistory(Array.isArray(historyData) ? historyData : []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "History Load Failed",
        text: "Unable to load department history.",
        confirmButtonColor: THEME.primary,
      });
    } finally {
      setHistoryLoading(false);
    }
  };
  const closeHistoryDialog = () => {
    setHistoryDialogOpen(false);
    setHistoryDepartment(null);
    setDepartmentHistory([]);
  };
  const closeForm = async () => {
    setIsAddFormOpen(false);
    setIsUpdateFormOpen(false);
    setSelectedDepartment(null);
    await dispatch(fetchDepartments());
    await dispatch(
      fetchDepartmentCounts({
        fromDate: dateMode === "DATE_FILTER" ? fromDate : null,
        toDate: dateMode === "DATE_FILTER" ? toDate : null,
      }),
    );
  };
  const handleDelete = (id: number) => {
    if (!canDeleteDepartment) {
      return;
    }
    setSelectedDepartmentId(id);
    setDeleteDialogOpen(true);
  };
  const closeDelete = () => {
    setDeleteDialogOpen(false);
    setSelectedDepartmentId(null);
  };
  const handleConfirmDelete = async () => {
    if (!canDeleteDepartment || selectedDepartmentId === null) {
      return;
    }
    try {
      await deleteDepartment(selectedDepartmentId);
      closeDelete();
      await dispatch(fetchDepartments());
      await dispatch(
        fetchDepartmentCounts({
          fromDate: dateMode === "DATE_FILTER" ? fromDate : null,
          toDate: dateMode === "DATE_FILTER" ? toDate : null,
        }),
      );
    } catch (error) {
      closeDelete();
      alert("Could not inactive department. Please try again.");
    }
  };
  const openUploadDialog = () => {
    if (!canImportExport) {
      return;
    }
    if (savingImported || uploading) return;
    setSelectedFile(null);
    setImportResult(null);
    setUploadDialogOpen(true);
  };
  const closeUploadDialog = () => {
    if (uploading) return;
    setUploadDialogOpen(false);
    setSelectedFile(null);
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }
    const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (![".xlsx", ".xls"].includes(extension)) {
      Swal.fire({
        icon: "error",
        title: "Invalid File",
        text: "Only XLS and XLSX files are allowed.",
        confirmButtonColor: THEME.primary,
      });
      event.target.value = "";
      setSelectedFile(null);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      Swal.fire({
        icon: "error",
        title: "File Too Large",
        text: "Maximum Excel file size is 10MB.",
        confirmButtonColor: THEME.primary,
      });
      event.target.value = "";
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  };
  const handleUpload = async () => {
    if (!canImportExport) {
      return;
    }
    if (!selectedFile) {
      Swal.fire({
        icon: "warning",
        title: "No File Selected",
        text: "Please select an Excel file.",
        confirmButtonColor: THEME.primary,
      });
      return;
    }
    try {
      setImporting(true);
      const response = await importDepartments(selectedFile);
      const result: ImportResult = {
        totalRows: Number(response?.totalRows ?? 0),
        correctCount: Number(response?.correctCount ?? 0),
        incorrectCount: Number(response?.incorrectCount ?? 0),
        duplicateCount: Number(response?.duplicateCount ?? 0),
        correct: Array.isArray(response?.correct) ? response.correct : [],
        incorrect: Array.isArray(response?.incorrect) ? response.incorrect : [],
        duplicate: Array.isArray(response?.duplicate) ? response.duplicate : [],
        saveData: Array.isArray(response?.saveData) ? response.saveData : [],
        importFilePath: response?.importFilePath ?? undefined,
        importFileName: response?.importFileName ?? undefined,
      };
      setImportResult(result);
      if (result.correctCount > 0) {
      } else if (result.incorrectCount > 0) {
      } else if (result.duplicateCount > 0) {
      }
      setUploadDialogOpen(false);
      setImportResultOpen(true);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Import Failed",
        text: error?.response?.data?.message || "Failed to process Excel file.",
        confirmButtonColor: THEME.primary,
      });
    } finally {
      setImporting(false);
    }
  };
  const handleSaveImportedDepartments = async () => {
    if (!canImportExport) {
      return;
    }
    const correctData = importResult?.saveData ?? [];
    if (!correctData.length) {
      Swal.fire({
        icon: "warning",
        title: "No Records",
        text: "No correct records available to save.",
        confirmButtonColor: THEME.primary,
      });
      return;
    }
    try {
      setSavingImported(true);
      await createDepartment(correctData);
      if (importResult?.importFilePath && importResult?.importFileName) {
        await createImportEmailNotification(
          importResult.importFilePath,
          importResult.importFileName,
          importResult.totalRows,
          correctData.length,
          importResult.duplicateCount,
          importResult.incorrectCount,
        );
        window.dispatchEvent(new Event("department-import-notification"));
      }
      setImportResultOpen(false);
      setUploadDialogOpen(false);
      setImportResult(null);
      setSelectedFile(null);
      await dispatch(fetchDepartments());
      await dispatch(
        fetchDepartmentCounts({
          fromDate: dateMode === "DATE_FILTER" ? fromDate : null,
          toDate: dateMode === "DATE_FILTER" ? toDate : null,
        }),
      );
      Swal.fire({
        icon: "success",
        title: "Success",
        text: `${correctData.length} department(s) saved successfully.`,
        confirmButtonColor: THEME.primary,
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Save Failed",
        text:
          error?.response?.data?.message ||
          "Failed to save correct departments.",
        confirmButtonColor: THEME.primary,
      });
    } finally {
      setSavingImported(false);
    }
  };
  const handleDownload = async () => {
    if (!canImportExport) {
      return;
    }
    if (!fromDate || !toDate) {
      Swal.fire({
        icon: "warning",
        title: "Date Range Required",
        text: "Please select From Date and To Date before downloading departments.",
        confirmButtonColor: THEME.primary,
      });
      return;
    }
    const from = new Date(`${fromDate}, 00:00:00`);
    const to = new Date(`${toDate}, 00:00:00`);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      Swal.fire({
        icon: "error",
        title: "Invalid Date",
        text: "Please select a valid date range.",
        confirmButtonColor: THEME.primary,
      });
      return;
    }
    if (from > to) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Date Range",
        text: "From Date cannot be greater than To Date.",
        confirmButtonColor: THEME.primary,
      });
      return;
    }
    const differenceInDays =
      Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const exportFilters = {
      search: search.trim() || undefined,
      departmentType: departmentType || undefined,
      branches: branches.length > 0 ? branches : null,
      businessUnit: businessUnit !== "" ? Number(businessUnit) : null,
      status: status === "" ? null : status,
    };
    try {
      setDownloadLoading(true);
      if (differenceInDays <= 7) {
        const blob = await exportDepartments(fromDate, toDate, exportFilters);
        if (!blob?.size) {
          throw new Error("Downloaded file is empty.");
        }
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "departments.xlsx";
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.URL.revokeObjectURL(url);
        await Swal.fire({
          icon: "success",
          title: "Download Started",
          text: `Filtered department data for ${fromDate} to ${toDate} has been downloaded.`,
          confirmButtonColor: THEME.primary,
        });
        return;
      }
      const permission = await Swal.fire({
        icon: "warning",
        title: "Export Range Exceeds 7 Days",
        html: `
          <div style="font-size:14px; color:#475569;">
            The selected date range is
            <strong>${differenceInDays} days</strong>.
            <br/><br/>
            Would you like to receive the
            <strong>filtered Excel file</strong>
            by email?
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: "YES, SEND EMAIL",
        cancelButtonText: "NO",
        confirmButtonColor: THEME.primary,
        cancelButtonColor: "#64748B",
        reverseButtons: true,
      });
      if (!permission.isConfirmed) {
        return;
      }
      const response = await exportDepartmentsByEmail(
        fromDate,
        toDate,
        exportFilters,
      );
      await Swal.fire({
        icon: "success",
        title: "Excel Sent by Email",
        text:
          response?.message ||
          "The filtered Excel file has been sent to your email.",
        confirmButtonColor: THEME.primary,
      });
      window.dispatchEvent(new Event("department-import-notification"));
      window.dispatchEvent(new Event("department-export-notification"));
    } catch (error: any) {
      let message = "Unable to download department data.";
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data;
        if (responseData instanceof Blob) {
          try {
            const text = await responseData.text();
            const parsed = JSON.parse(text);
            message = parsed?.message || parsed?.error || message;
          } catch {
            message = "Unable to process department export.";
          }
        } else {
          message = responseData?.message || responseData?.error || message;
        }
      } else if (error instanceof Error) {
        message = error.message;
      }
      Swal.fire({
        icon: "error",
        title: "Download Failed",
        text: message,
        confirmButtonColor: THEME.primary,
      });
    } finally {
      setDownloadLoading(false);
    }
  };
  const handleDownloadTemplate = async () => {
    if (!canImportExport) {
      return;
    }
    try {
      setTemplateDownloadLoading(true);
      const blob = await downloadDepartmentTemplate();
      if (!blob?.size) {
        throw new Error("Downloaded template file is empty.");
      }
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "department-template.xlsx";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Download Failed",
        text: "Unable to download department template.",
        confirmButtonColor: THEME.primary,
      });
    } finally {
      setTemplateDownloadLoading(false);
    }
  };
  const handleAttachmentDownload = async (
    uuid: string | null | undefined,
    fileName: string | null | undefined,
  ) => {
    if (!uuid || !fileName) {
      return;
    }
    try {
      await downloadDepartmentAttachment(uuid, fileName);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Download Failed",
        text: "Unable to download attachment.",
        confirmButtonColor: THEME.primary,
      });
    }
  };
  const renderAttachmentCell = (
    uuid: string | null | undefined,
    fileName: string | null | undefined,
  ) =>
    uuid && fileName ? (
      <Tooltip title={`Download ${fileName}`}>
        <IconButton
          size="small"
          onClick={() => handleAttachmentDownload(uuid, fileName)}
          sx={{
            color: THEME.primary,
            bgcolor: "#F0FDFA",
            border: "1px solid #CCFBF1",
            borderRadius: 2,
            "&:hover": { bgcolor: "#CCFBF1" },
          }}
        >
          <DownloadIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    ) : (
      <Box sx={TEXT_CELL}>NA</Box>
    );
  const getActivityHeader = (field: string, fallback: string) =>
    activityHeaders.find((item) => item.field === field)?.header ?? fallback;
  const columns = useMemo<MRT_ColumnDef<DepartmentRow>[]>(
    () => [
      {
        id: "action",
        header: "Actions",
        enableSorting: false,
        enableHiding: false,
        size: 115,
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {canUpdateDepartment && (
              <Tooltip title="Edit Department">
                <IconButton
                  size="small"
                  onClick={() => handleEditDepartment(row.original)}
                  sx={{
                    color: THEME.primary,
                    bgcolor: "#F0FDFA",
                    border: "1px solid #CCFBF1",
                    borderRadius: 2,
                    "&:hover": { bgcolor: "#CCFBF1" },
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {canDeleteDepartment && !row.original.status && (
              <Tooltip title="Inactivate Department">
                <IconButton
                  size="small"
                  onClick={() => handleDelete(row.original.id)}
                  sx={{
                    color: "#DC2626",
                    bgcolor: "#FEF2F2",
                    border: "1px solid #FECACA",
                    borderRadius: 2,
                    "&:hover": { bgcolor: "#FEE2E2" },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ),
      },
      {
        accessorKey: "departmentCode",
        header: getActivityHeader("departmentCode", "Department Code"),
        size: 170,
        Cell: ({ row }) => (
          <Tooltip title="View Department History">
            <Chip
              label={String(row.original.departmentCode ?? "NA")}
              size="small"
              onClick={() => handleDepartmentHistory(row.original)}
              sx={{
                ...CHIP,
                bgcolor: "#F1F5F9",
                color: THEME.primary,
                border: "1px solid #CBD5E1",
                cursor: "pointer",
                "&:hover": {
                  bgcolor: THEME.primaryLight,
                  borderColor: THEME.primary,
                },
              }}
            />
          </Tooltip>
        ),
      },
      {
        accessorKey: "departmentName",
        header: getActivityHeader("departmentName", "Name"),
        size: 230,
        Cell: ({ cell }) => (
          <Box sx={{ fontWeight: 700, color: "#0F172A" }}>
            {String(cell.getValue() ?? "NA")}
          </Box>
        ),
      },
      {
        accessorKey: "departmentHead",
        header: getActivityHeader("departmentHead", "Department Head"),
        size: 180,
        Cell: ({ row }) => (
          <Box sx={TEXT_CELL}>
            {getEmployeeName(row.original.departmentHead)}
          </Box>
        ),
      },
      {
        accessorKey: "departmentType",
        header: getActivityHeader("departmentType", "Type"),
        size: 160,
        Cell: ({ cell }) => (
          <Chip
            label={String(cell.getValue() ?? "NA")}
            size="small"
            sx={{
              ...CHIP,
              bgcolor: "#ECFEFF",
              color: THEME.primary,
              border: "1px solid #A5F3FC",
            }}
          />
        ),
      },
      {
        accessorKey: "branches",
        header: getActivityHeader("branches", "Branch"),
        size: 190,
        enableSorting: true,
        Cell: ({ row }) => (
          <Box sx={{ ...TEXT_CELL, whiteSpace: "normal", lineHeight: 1.5 }}>
            {row.original.branches?.length
              ? row.original.branches
                  .map(getBranchName)
                  .filter(Boolean)
                  .join(", ")
              : "NA"}
          </Box>
        ),
      },
      {
        accessorKey: "businessUnit",
        header: getActivityHeader("businessUnit", "Business Unit"),
        size: 180,
        Cell: ({ row }) => (
          <Box sx={TEXT_CELL}>
            {getBusinessUnitName(row.original.businessUnit) || "NA"}
          </Box>
        ),
      },
      {
        accessorKey: "departmentEmail",
        header: getActivityHeader("departmentEmail", "Department Email"),
        size: 230,
        Cell: ({ cell }) => {
          const value = cell.getValue<string | null>();
          return (
            <Box sx={{ ...TEXT_CELL, fontSize: 13, whiteSpace: "nowrap" }}>
              {value?.trim() || "NA"}
            </Box>
          );
        },
      },
      {
        accessorKey: "departmentLogoUuid",
        header: "Logo",
        size: 160,
        enableSorting: false,
        Cell: ({ row }) =>
          renderAttachmentCell(
            row.original.departmentLogoUuid,
            row.original.departmentLogoFileName,
          ),
      },
      {
        accessorKey: "documentUuid",
        header: "Document",
        size: 160,
        enableSorting: false,
        Cell: ({ row }) =>
          renderAttachmentCell(
            row.original.documentUuid,
            row.original.documentFileName,
          ),
      },
      {
        accessorKey: "status",
        header: getActivityHeader("status", "Status"),
        size: 130,
        Cell: ({ cell }) => {
          const inactive = Boolean(cell.getValue<boolean>());
          return (
            <Chip
              label={inactive ? "Inactive" : "Active"}
              size="small"
              sx={{
                ...CHIP,
                minWidth: 82,
                bgcolor: inactive ? "#FEF2F2" : "#ECFDF5",
                color: inactive ? "#DC2626" : "#15803D",
                border: inactive ? "1px solid #FECACA" : "1px solid #BBF7D0",
              }}
            />
          );
        },
      },
      {
        accessorKey: "createdBy",
        header: getActivityHeader("createdBy", "Created By"),
        size: 160,
        Cell: ({ cell }) => (
          <Box sx={TEXT_CELL}>
            {getUserName(cell.getValue<string | number | null>())}
          </Box>
        ),
      },
      {
        accessorKey: "createdAt",
        header: getActivityHeader("createdAt", "Created On"),
        size: 150,
        Cell: ({ cell }) => (
          <Box sx={TEXT_CELL}>{formatDate(cell.getValue<string | null>())}</Box>
        ),
      },
      {
        accessorKey: "updatedBy",
        header: getActivityHeader("updatedBy", "Updated By"),
        size: 160,
        Cell: ({ cell }) => (
          <Box sx={TEXT_CELL}>
            {getUserName(cell.getValue<string | number | null>())}
          </Box>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: getActivityHeader("updatedAt", "Updated On"),
        size: 150,
        Cell: ({ cell }) => (
          <Box sx={TEXT_CELL}>{formatDate(cell.getValue<string | null>())}</Box>
        ),
      },
    ],
    [
      branchOptions,
      businessUnitOptions,
      departmentHeadOptions,
      userMap,
      canUpdateDepartment,
      canDeleteDepartment,
      activityHeaders,
    ],
  );
  const historyColumns = useMemo<MRT_ColumnDef<DepartmentHistory>[]>(() => {
    const formatHistoryValue = (value: unknown, field?: string): string => {
      if (value === null || value === undefined || value === "") {
        return "NA";
      }
      if (Array.isArray(value)) {
        return value.length > 0 ? value.join(", ") : "NA";
      }
      if (field === "status" && typeof value === "boolean") {
        return value ? "Inactive" : "Active";
      }
      return String(value);
    };
    const formatMappedValue = (
      value: unknown,
      options: DropdownOption[],
    ): string => {
      if (value === null || value === undefined || value === "") {
        return "NA";
      }
      if (Array.isArray(value)) {
        const names = value
          .map(
            (id) =>
              options.find((option) => String(option.value) === String(id))
                ?.label,
          )
          .filter((name): name is string => Boolean(name));
        return names.length > 0 ? names.join(", ") : "NA";
      }
      const option = options.find((item) => {
        if (String(item.value) === String(value)) {
          return true;
        }
        const optionId = Number(item.value);
        const historyId = Number(value);
        return (
          Number.isFinite(optionId) &&
          Number.isFinite(historyId) &&
          optionId === historyId
        );
      });
      return option?.label ?? String(value);
    };
    const formatParentDepartment = (value: unknown): string => {
      if (value === null || value === undefined || value === "") {
        return "NA";
      }
      const parentId = Number(value);
      if (!Number.isFinite(parentId)) {
        return String(value);
      }
      const parentDepartment = parentDepartmentOptions.find(
        (option) => Number(option.value) === parentId,
      );
      return parentDepartment?.label ?? "NA";
    };
    const renderFormattedChange = (
      newValue: string,
      action: string,
      isUnchanged: boolean,
    ) => {
      if (action === "CREATED") {
        return (
          <Typography
            sx={{
              fontSize: 13,
              color: "#15803D",
              fontWeight: 600,
            }}
          >
            {newValue}
          </Typography>
        );
      }
      if (isUnchanged) {
        return (
          <Typography
            sx={{
              fontSize: 13,
              color: "#334155",
              fontWeight: 500,
            }}
          >
            {newValue}
          </Typography>
        );
      }
      if (action === "UPDATED") {
        return (
          <Typography
            sx={{
              fontSize: 13,
              color: "#15803D",
              fontWeight: 600,
            }}
          >
            {newValue}
          </Typography>
        );
      }
      if (action === "INACTIVATED") {
        return (
          <Typography
            sx={{
              fontSize: 13,
              color: "#DC2626",
              fontWeight: 600,
            }}
          >
            {newValue}
          </Typography>
        );
      }
      return (
        <Typography
          sx={{
            fontSize: 13,
            color: "#334155",
            fontWeight: 500,
          }}
        >
          {newValue}
        </Typography>
      );
    };
    const NA_LABEL = (
      <Typography sx={{ fontSize: 13, color: "#94A3B8", fontWeight: 500 }}>
        NA
      </Typography>
    );
    const renderMappedHistoryChange = (
      change: DepartmentHistoryChange | undefined,
      action: string,
      options: DropdownOption[],
    ) => {
      if (!change) {
        return NA_LABEL;
      }
      const newValue = formatMappedValue(change.new, options);
      const isUnchanged =
        JSON.stringify(change.old) === JSON.stringify(change.new);
      return renderFormattedChange(newValue, action, isUnchanged);
    };
    const renderHistoryChange = (
      change: DepartmentHistoryChange | undefined,
      action: string,
      field?: string,
    ) => {
      if (!change) {
        return NA_LABEL;
      }
      const newValue = formatHistoryValue(change.new, field);
      const isUnchanged =
        JSON.stringify(change.old) === JSON.stringify(change.new);
      return renderFormattedChange(newValue, action, isUnchanged);
    };
    const renderParentDepartmentChange = (
      change: DepartmentHistoryChange | undefined,
      action: string,
    ) => {
      if (!change) {
        return NA_LABEL;
      }
      const newValue = formatParentDepartment(change.new);
      const isUnchanged =
        JSON.stringify(change.old) === JSON.stringify(change.new);
      return renderFormattedChange(newValue, action, isUnchanged);
    };
    return [
      {
        accessorKey: "performedAt",
        header: "Date & Time",
        size: 180,
        Cell: ({ cell }) => (
          <Box sx={TEXT_CELL}>{formatDate(cell.getValue<string | null>())}</Box>
        ),
      },
      {
        accessorKey: "action",
        header: "Action",
        size: 130,
        Cell: ({ cell }) => {
          const action = String(cell.getValue() ?? "NA").toUpperCase();
          const config =
            action === "CREATED"
              ? {
                  label: "Created",
                  color: "#15803D",
                  background: "#ECFDF5",
                  border: "#BBF7D0",
                }
              : action === "UPDATED"
                ? {
                    label: "Updated",
                    color: "#2563EB",
                    background: "#EFF6FF",
                    border: "#BFDBFE",
                  }
                : action === "INACTIVATED"
                  ? {
                      label: "Inactivated",
                      color: "#DC2626",
                      background: "#FEF2F2",
                      border: "#FECACA",
                    }
                  : {
                      label: action,
                      color: "#475569",
                      background: "#F1F5F9",
                      border: "#CBD5E1",
                    };
          return (
            <Chip
              label={config.label}
              size="small"
              sx={{
                ...CHIP,
                color: config.color,
                backgroundColor: config.background,
                border: `1px solid ${config.border}`,
              }}
            />
          );
        },
      },
      {
        accessorKey: "performedBy",
        header: "Actioned By",
        size: 160,
        Cell: ({ cell }) => (
          <Box sx={TEXT_CELL}>
            {getUserName(cell.getValue<string | number | null>())}
          </Box>
        ),
      },
      ...(
        [
          { id: "departmentName", header: "Name", size: 220, type: "simple" },
          { id: "shortName", header: "Short Name", size: 160, type: "simple" },
          { id: "departmentType", header: "Type", size: 170, type: "simple" },
          {
            id: "parentDepartment",
            header: "Parent Department",
            size: 220,
            type: "parent",
          },
          {
            id: "departmentHead",
            header: "Department Head",
            size: 180,
            type: "mapped",
            options: departmentHeadOptions,
          },
          {
            id: "branches",
            header: "Branch",
            size: 220,
            type: "mapped",
            options: branchOptions,
          },
          {
            id: "businessUnit",
            header: "Business Unit",
            size: 220,
            type: "mapped",
            options: businessUnitOptions,
          },
          {
            id: "costCenter",
            header: "Cost Center",
            size: 160,
            type: "simple",
          },
          {
            id: "departmentEmail",
            header: "Department Email",
            size: 230,
            type: "simple",
          },
          {
            id: "departmentPhone",
            header: "Department Phone",
            size: 180,
            type: "simple",
          },
          {
            id: "workingDays",
            header: "Working Days",
            size: 220,
            type: "simple",
          },
          {
            id: "workingShift",
            header: "Working Shift",
            size: 200,
            type: "mapped",
            options: workingShiftOptions,
          },
          {
            id: "description",
            header: "Description",
            size: 250,
            type: "simple",
          },
          {
            id: "departmentLogo",
            header: "Department Logo",
            size: 220,
            type: "simple",
          },
          {
            id: "documentPath",
            header: "Document Path",
            size: 240,
            type: "simple",
          },
          { id: "tags", header: "Tags", size: 220, type: "simple" },
          { id: "keywords", header: "Keywords", size: 220, type: "simple" },
          { id: "remarks", header: "Remarks", size: 240, type: "simple" },
          { id: "status", header: "Status", size: 150, type: "simple" },
        ] as {
          id: string;
          header: string;
          size: number;
          type: "simple" | "mapped" | "parent";
          options?: DropdownOption[];
        }[]
      ).map((field) => ({
        id: field.id,
        header: field.header,
        size: field.size,
        Cell: ({
          row,
        }: {
          row: {
            original: DepartmentHistory;
          };
        }) => {
          const change = row.original.changes?.[field.id];
          if (field.type === "parent") {
            return renderParentDepartmentChange(change, row.original.action);
          }
          if (field.type === "mapped") {
            return renderMappedHistoryChange(
              change,
              row.original.action,
              field.options!,
            );
          }
          return renderHistoryChange(change, row.original.action, field.id);
        },
      })),
    ];
  }, [
    parentDepartmentOptions,
    branchOptions,
    businessUnitOptions,
    workingShiftOptions,
    departmentHeadOptions,
    userMap,
  ]);
  const totalCount = activeCount + inactiveCount;
  const importColumns = useMemo<MRT_ColumnDef<ImportRow>[]>(() => {
    const columns: MRT_ColumnDef<ImportRow>[] = [
      {
        accessorKey: "rowNumber",
        header: "Row",
        size: 70,
        Cell: ({ cell }) => (
          <Box sx={{ color: THEME.darkTeal, fontWeight: 700 }}>
            {String(cell.getValue() ?? "NA")}
          </Box>
        ),
      },
    ];
    excelHeaders.forEach((excelHeader) => {
      const field = excelHeader.field as keyof ImportRow;
      columns.push({
        accessorKey: field,
        header: excelHeader.header,
        size: 170,
        Cell: ({ cell }) => {
          const value = cell.getValue();
          if (value === null || value === undefined || value === "") {
            return <Box sx={{ color: THEME.textSecondary }}>NA</Box>;
          }
          if (Array.isArray(value)) {
            return value.join(", ");
          }
          return String(value);
        },
      });
    });
    columns.push({
      accessorKey: "reason",
      header: "Reason",
      size: 280,
      Cell: ({ cell }) => {
        const value = String(cell.getValue() ?? "");
        return (
          <Box
            sx={{
              color: value ? THEME.textSecondary : THEME.textSecondary,
              fontWeight: 600,
              whiteSpace: "normal",
            }}
          >
            {value || "NA"}
          </Box>
        );
      },
    });
    return columns;
  }, [excelHeaders]);
  const correctRecordsCount = importResult?.saveData?.length ?? 0;
  const speedDialActions = [
    ...(canAddDepartment
      ? [
          {
            icon: <AddIcon />,
            name: "Add Department",
            onClick: handleAddDepartment,
          },
        ]
      : []),
    ...(canImportExport
      ? [
          {
            icon: <FileUploadIcon />,
            name: "Upload Departments",
            onClick: openUploadDialog,
          },
          {
            icon: <DescriptionIcon />,
            name: templateDownloadLoading
              ? "Downloading..."
              : "Download Template",
            onClick: handleDownloadTemplate,
          },
        ]
      : []),
  ];
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        pb: 10,
        bgcolor: THEME.background,
        overflowX: "visible",
        boxSizing: "border-box",
      }}
    >
      <Grid container sx={{ width: "100%", m: 0, boxSizing: "border-box" }}>
        <Grid size={12}>
          <Paper
            elevation={0}
            sx={{
              width: "100%",
              maxWidth: "100%",
              boxSizing: "border-box",
              bgcolor: "#FFF",
              borderRadius: 3,
              border: `1px solid ${THEME.border}`,
              boxShadow: THEME.shadow,
              p: { xs: 1.5, sm: 2, md: 2.5 },
              overflow: "visible",
            }}
          >
            <Box
              sx={{
                mb: 3,
                borderRadius: 3,
                overflow: "hidden",
                border: `1px solid ${THEME.border}`,
              }}
            >
              <Box
                sx={{
                  px: { xs: 2, sm: 3 },
                  py: 2.5,
                  background:
                    "linear-gradient(135deg, #E6F4F2 0%, #FFFFFF 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    minWidth: 0,
                  }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      minWidth: 44,
                      borderRadius: 2.5,
                      display: "grid",
                      placeItems: "center",
                      bgcolor: THEME.primary,
                      color: "#FFF",
                    }}
                  >
                    <BusinessIcon />
                  </Box>
                  <Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 800,
                        color: THEME.darkTeal,
                        fontSize: { xs: 20, sm: 24 },
                      }}
                    >
                      Department Management
                    </Typography>
                    <Typography
                      sx={{ mt: 0.5, color: THEME.textSecondary, fontSize: 14 }}
                    >
                      Manage department details, status and activities
                    </Typography>
                  </Box>
                </Box>
                <Tooltip title="Refresh Application">
                  <IconButton
                    onClick={() => window.location.reload()}
                    sx={{
                      width: 42,
                      height: 42,
                      minWidth: 42,
                      flexShrink: 0,
                      color: THEME.primary,
                      backgroundColor: THEME.primaryLight,
                      border: `1px solid ${THEME.border}`,
                      borderRadius: 2,
                      "&:hover": {
                        backgroundColor: THEME.primary,
                        color: "#FFFFFF",
                        borderColor: THEME.primary,
                      },
                    }}
                  >
                    <RestartAltIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid size={12}>
                <DepartmentFilters
                  search={search}
                  onSearchChange={handleSearchChange}
                  isSearchApplied={isSearchApplied}
                  onSearchClick={handleSearchClick}
                  departmentType={departmentType}
                  onDepartmentTypeChange={handleDepartmentTypeChange}
                  branches={branches}
                  onBranchesChange={handleBranchChange}
                  businessUnit={businessUnit}
                  onBusinessUnitChange={handleBusinessUnitChange}
                  status={status}
                  onStatusChange={handleStatusChange}
                  fromDate={fromDate}
                  toDate={toDate}
                  onFromDateChange={handleFromDateChange}
                  onToDateChange={handleToDateChange}
                  dateMode={dateMode}
                  onDateModeChange={handleDateModeChange}
                  onApply={handleApplyFilters}
                  onReset={handleReset}
                  totalCount={totalCount}
                  activeCount={activeCount}
                  inactiveCount={inactiveCount}
                  departmentFilter={departmentFilter}
                  onTileClick={handleTileClick}
                  departmentTypeOptions={departmentTypeOptions}
                  branchOptions={branchOptions}
                  businessUnitOptions={businessUnitOptions}
                  dropdownLoading={dropdownLoading}
                />
              </Grid>
            </Grid>
            <Box
              sx={{
                mb: 2,
                p: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexWrap: "wrap",
                border: `1px solid ${THEME.border}`,
                borderRadius: 2,
              }}
            >
              <Typography
                sx={{
                  color: THEME.textSecondary,
                  fontWeight: 700,
                  fontSize: 14,
                  mr: 1,
                }}
              >
                Filter By:
              </Typography>
              <Box
                sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", flex: 1 }}
              >
                {(fromDate || toDate) && (
                  <FilterChip
                    label={`Date: ${formatFilterDate(fromDate) || "Any"} To ${formatFilterDate(toDate) || "Any"}`}
                    color={THEME.primary}
                    background={THEME.primaryLight}
                  />
                )}
                {isSearchApplied && search && (
                  <FilterChip
                    label={`Search: ${search}`}
                    onDelete={() =>
                      handleRemoveFilter(() => {
                        dispatch(setSearch(""));
                        setIsSearchApplied(false);
                      })
                    }
                  />
                )}
                {departmentType && (
                  <FilterChip
                    label={`Department Type: ${getDepartmentTypeName(departmentType)}`}
                    onDelete={() =>
                      handleRemoveFilter(() => {
                        dispatch(setDepartmentType(""));
                      })
                    }
                  />
                )}
                {branches.length > 0 && (
                  <>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        flexWrap: "wrap",
                      }}
                    >
                      <Typography
                        sx={{
                          color: "#475569",
                          fontWeight: 700,
                          fontSize: 13,
                          mr: 0.25,
                        }}
                      >
                        Branch:
                      </Typography>
                      {visibleBranches.map((branch) => (
                        <Chip
                          key={branch.id}
                          label={branch.name}
                          size="small"
                          onDelete={() => handleRemoveBranch(branch.id)}
                          sx={{
                            ...CHIP,
                            color: "#475569",
                            backgroundColor: "#F1F5F9",
                            "& .MuiChip-deleteIcon": {
                              color: "#64748B",
                              fontSize: 17,
                              "&:hover": { color: "#DC2626" },
                            },
                          }}
                        />
                      ))}
                      {remainingBranches.length > 0 && (
                        <Chip
                          label={`+${remainingBranches.length}`}
                          size="small"
                          onClick={(event) =>
                            setBranchPopoverAnchor(event.currentTarget)
                          }
                          sx={{
                            ...CHIP,
                            color: THEME.primary,
                            backgroundColor: THEME.primaryLight,
                            cursor: "pointer",
                            border: `1px solid ${THEME.border}`,
                            fontWeight: 800,
                            "&:hover": { backgroundColor: "#CCFBF1" },
                          }}
                        />
                      )}
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleRemoveFilter(() => {
                            dispatch(setBranches([]));
                          })
                        }
                        sx={{
                          width: 22,
                          height: 22,
                          color: "#64748B",
                          "&:hover": {
                            color: "#DC2626",
                            backgroundColor: "#FEF2F2",
                          },
                        }}
                      >
                        <span style={{ fontSize: 17 }}>×</span>
                      </IconButton>
                    </Box>
                    <Popover
                      open={Boolean(branchPopoverAnchor)}
                      anchorEl={branchPopoverAnchor}
                      onClose={() => setBranchPopoverAnchor(null)}
                      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                      transformOrigin={{ vertical: "top", horizontal: "left" }}
                      slotProps={{
                        paper: {
                          sx: {
                            mt: 1,
                            width: 280,
                            maxWidth: "90vw",
                            borderRadius: 2,
                            border: `1px solid ${THEME.border}`,
                            boxShadow: "0 8px 24px rgba(23, 63, 59, 0.15)",
                            overflow: "hidden",
                          },
                        },
                      }}
                    >
                      <Box sx={{ p: 1.5 }}>
                        <Typography
                          sx={{
                            fontWeight: 800,
                            color: THEME.darkTeal,
                            fontSize: 14,
                          }}
                        >
                          Selected Branches
                        </Typography>
                        <Typography
                          sx={{
                            color: THEME.textSecondary,
                            fontSize: 12,
                            mt: 0.25,
                          }}
                        >
                          {branches.length} branch
                          {branches.length !== 1 ? "es" : ""} selected
                        </Typography>
                      </Box>
                      <Divider />
                      <Box sx={{ maxHeight: 300, overflowY: "auto", p: 1 }}>
                        {remainingBranches.map((branch) => (
                          <Box
                            key={branch.id}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 1,
                              px: 1,
                              py: 0.75,
                              borderRadius: 1.5,
                              "&:hover": { backgroundColor: "#F8FAFC" },
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: 13,
                                color: "#475569",
                                fontWeight: 600,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {branch.name}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveBranch(branch.id)}
                              sx={{
                                color: "#64748B",
                                flexShrink: 0,
                                "&:hover": {
                                  color: "#DC2626",
                                  backgroundColor: "#FEF2F2",
                                },
                              }}
                            >
                              <span style={{ fontSize: 17 }}>×</span>
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    </Popover>
                  </>
                )}
                {businessUnit !== null &&
                  businessUnit !== undefined &&
                  businessUnit !== "" && (
                    <FilterChip
                      label={`Business Unit: ${getBusinessUnitName(businessUnit)}`}
                      onDelete={() =>
                        handleRemoveFilter(() => {
                          dispatch(setBusinessUnit(""));
                        })
                      }
                    />
                  )}
                {status !== "" && status !== null && status !== undefined && (
                  <FilterChip
                    label={`Status: ${status ? "Inactive" : "Active"}`}
                    color={status ? "#DC2626" : "#15803D"}
                    background={status ? "#FEF2F2" : "#ECFDF5"}
                    onDelete={() =>
                      handleRemoveFilter(() => {
                        dispatch(setStatus(""));
                      }, true)
                    }
                  />
                )}
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  ml: "auto",
                }}
              >
                <FilterChip
                  label={`${totalElements} Department${totalElements !== 1 ? "s" : ""}`}
                  color={THEME.primary}
                  background={THEME.primaryLight}
                />
                {canImportExport && (
                  <IconButton
                    size="small"
                    onClick={handleDownload}
                    disabled={downloadLoading}
                    title="Download Departments"
                    sx={{
                      color: THEME.primary,
                      width: 34,
                      height: 34,
                      "&:hover": { backgroundColor: THEME.primaryLight },
                    }}
                  >
                    {downloadLoading ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <DownloadIcon fontSize="small" />
                    )}
                  </IconButton>
                )}
              </Box>
            </Box>
            <Card
              sx={{
                width: "100%",
                borderRadius: 3,
                overflow: "hidden",
                border: `1px solid ${THEME.border}`,
                boxShadow: "none",
              }}
            >
              <DepartmentTable
                rows={rows as DepartmentRow[]}
                columns={columns}
                totalElements={totalElements}
                pagination={pagination}
                setPagination={handlePaginationChange}
                sorting={sorting}
                setSorting={handleSortingChange}
                isLoading={isLoading}
                manualPagination
                manualSorting
              />
            </Card>
          </Paper>
        </Grid>
      </Grid>
      {speedDialActions.length > 0 && (
        <SpeedDial
          ariaLabel="Department actions"
          sx={{
            position: "fixed",
            right: { xs: 18, sm: 28 },
            bottom: 80,
            zIndex: 1300,
          }}
          icon={<SpeedDialIcon icon={<AddIcon />} />}
          FabProps={{
            sx: {
              width: 58,
              height: 58,
              bgcolor: THEME.primary,
              color: "#FFF",
              "&:hover": { bgcolor: THEME.primaryHover },
            },
          }}
        >
          {speedDialActions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              onClick={action.onClick}
              slotProps={{
                fab: {
                  disabled:
                    action.name === "Downloading..." ||
                    savingImported ||
                    uploading ||
                    downloadLoading ||
                    templateDownloadLoading,
                },
                tooltip: { title: action.name, placement: "left" },
              }}
            />
          ))}
        </SpeedDial>
      )}
      <Drawer
        anchor="right"
        open={isAddFormOpen || isUpdateFormOpen}
        onClose={(_, reason) => {
          if (reason === "backdropClick" || reason === "escapeKeyDown") {
            return;
          }
          setIsAddFormOpen(false);
          setIsUpdateFormOpen(false);
          setSelectedDepartment(null);
        }}
        sx={{
          zIndex: 1400,
          "& .MuiDrawer-paper": {
            width: { xs: "100%", sm: "90%", md: "75%", lg: "70%" },
            maxWidth: 1100,
            bgcolor: THEME.background,
            overflow: "hidden",
          },
        }}
      >
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <Box
            sx={{
              flexShrink: 0,
              position: "sticky",
              top: 0,
              zIndex: 1000,
              backgroundColor: "#0F766E",
              px: { xs: 2, sm: 3 },
              py: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
          >
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: "#FFFFFF", m: 0 }}
            >
              {isUpdateFormOpen ? "Update Department" : "Add Department"}
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              p: { xs: 1.5, sm: 2, md: 3 },
              boxSizing: "border-box",
            }}
          >
            {isAddFormOpen && (
              <AddDepartment
                onClose={closeForm}
                departmentTypeOptions={departmentTypeOptions}
                branchOptions={branchOptions}
                businessUnitOptions={businessUnitOptions}
                workingShiftOptions={workingShiftOptions}
                dropdownLoading={dropdownLoading}
              />
            )}
            {isUpdateFormOpen && selectedDepartment && (
              <UpdateDepartment
                department={selectedDepartment}
                onClose={closeForm}
              />
            )}
          </Box>
        </Box>
      </Drawer>
      <Dialog
        open={uploadDialogOpen}
        onClose={(_, reason) => {
          if (reason === "backdropClick" || reason === "escapeKeyDown") {
            return;
          }
          closeUploadDialog();
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, color: THEME.darkTeal }}>
          Upload Departments
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              border: `2px dashed ${THEME.border}`,
              borderRadius: 3,
              p: 4,
              textAlign: "center",
            }}
          >
            <FileUploadIcon sx={{ fontSize: 48, color: THEME.primary }} />
            <Typography sx={{ fontWeight: 700, color: THEME.darkTeal, mb: 1 }}>
              Select Excel File
            </Typography>
            <Typography
              sx={{ color: THEME.textSecondary, fontSize: 13, mb: 2 }}
            >
              Only .xls and .xlsx files are allowed
            </Typography>
            <Button component="label" variant="outlined" disabled={uploading}>
              Choose File
              <input
                hidden
                type="file"
                accept=".xls,.xlsx"
                onChange={handleFileChange}
              />
            </Button>
            {selectedFile && (
              <Typography
                sx={{ mt: 2, fontWeight: 600, wordBreak: "break-word" }}
              >
                {selectedFile.name}
              </Typography>
            )}
            <Typography
              sx={{ mt: 1, fontSize: 12, color: THEME.textSecondary }}
            >
              Maximum file size: 10MB
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={closeUploadDialog}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            startIcon={
              uploading ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <FileUploadIcon />
              )
            }
            sx={{
              bgcolor: THEME.primary,
              "&:hover": { bgcolor: THEME.primaryHover },
            }}
          >
            {uploading ? "Processing..." : "Upload & Preview"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={importResultOpen}
        onClose={(_, reason) => {
          if (reason === "backdropClick" || reason === "escapeKeyDown") {
            return;
          }
          if (!savingImported) {
            setImportResultOpen(false);
          }
        }}
        maxWidth="xl"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 2,
              overflow: "hidden",
              border: "1px solid #D7E6E3",
              boxShadow: "0 8px 30px rgba(15, 118, 110, 0.12)",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            color: "#FFFFFF",
            backgroundColor: THEME.primary,
            px: 3,
            py: 2,
          }}
        >
          Excel Data Review
        </DialogTitle>
        <DialogContent
          sx={{ backgroundColor: THEME.background, p: { xs: 1.5, sm: 2.5 } }}
        >
          {importResult && (
            <>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
                  gap: 1.5,
                  mb: 3,
                  mt: 3,
                }}
              >
                {[
                  {
                    key: "totalRows",
                    label: "Total",
                    labelColor: THEME.textSecondary,
                    valueColor: THEME.darkTeal,
                    border: THEME.border,
                    bg: "#FFFFFF",
                  },
                  {
                    key: "correctCount",
                    label: "Correct",
                    labelColor: "#15803D",
                    valueColor: "#166534",
                    border: "#BBF7D0",
                    bg: "#F0FDF4",
                  },
                  {
                    key: "incorrectCount",
                    label: "Incorrect",
                    labelColor: "#C2410C",
                    valueColor: "#9A3412",
                    border: "#FED7AA",
                    bg: "#FFF7ED",
                  },
                  {
                    key: "duplicateCount",
                    label: "Duplicate",
                    labelColor: "#7C3AED",
                    valueColor: "#6D28D9",
                    border: "#DDD6FE",
                    bg: "#F5F3FF",
                  },
                ].map((card) => (
                  <Paper
                    key={card.key}
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2.5,
                      border: `1px solid ${card.border}`,
                      backgroundColor: card.bg,
                    }}
                  >
                    <Typography
                      sx={{
                        color: card.labelColor,
                        fontSize: 12,
                        fontWeight: 700,
                        textTransform: "uppercase",
                      }}
                    >
                      {card.label}
                    </Typography>
                    <Typography
                      sx={{
                        mt: 0.5,
                        color: card.valueColor,
                        fontSize: 25,
                        fontWeight: 800,
                      }}
                    >
                      {importResult[card.key as keyof ImportResult] as number}
                    </Typography>
                  </Paper>
                ))}
              </Box>
              {[
                {
                  count: importResult.correctCount,
                  rows: importResult.correct,
                  key: "correct-import-table",
                  title: "Correct Data",
                  subtitle: "Ready to save",
                  titleColor: "#166534",
                  subtitleColor: "#15803D",
                  chipColor: "#15803D",
                  bg: "#F0FDF4",
                  border: "#BBF7D0",
                },
                {
                  count: importResult.incorrectCount,
                  rows: importResult.incorrect,
                  key: "incorrect-import-table",
                  title: "Incorrect Data",
                  subtitle: "Will not be saved",
                  titleColor: "#9A3412",
                  subtitleColor: "#C2410C",
                  chipColor: "#C2410C",
                  bg: "#FFF7ED",
                  border: "#FED7AA",
                },
                {
                  count: importResult.duplicateCount,
                  rows: importResult.duplicate,
                  key: "duplicate-import-table",
                  title: "Duplicate Data",
                  subtitle: "Will not be saved",
                  titleColor: "#6D28D9",
                  subtitleColor: "#7C3AED",
                  chipColor: "#7C3AED",
                  bg: "#F5F3FF",
                  border: "#DDD6FE",
                },
              ].map(
                (section) =>
                  section.count > 0 && (
                    <Box
                      key={section.key}
                      sx={{
                        mb: 2.5,
                        backgroundColor: "#FFFFFF",
                        border: `1px solid ${THEME.border}`,
                        borderRadius: 2.5,
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          px: 2,
                          py: 1.25,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 1,
                          backgroundColor: section.bg,
                          borderBottom: `1px solid ${section.border}`,
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 800,
                              color: section.titleColor,
                              fontSize: 14,
                            }}
                          >
                            {section.title}
                          </Typography>
                          <Chip
                            label={section.count}
                            size="small"
                            sx={{
                              minWidth: 32,
                              height: 24,
                              fontWeight: 800,
                              color: section.chipColor,
                              backgroundColor: "#FFFFFF",
                              border: `1px solid ${section.border}`,
                            }}
                          />
                        </Box>
                        <Typography
                          sx={{
                            fontSize: 12,
                            color: section.subtitleColor,
                            fontWeight: 600,
                          }}
                        >
                          {section.subtitle}
                        </Typography>
                      </Box>
                      <Box sx={{ p: 1 }}>
                        <DepartmentTable
                          key={section.key}
                          rows={section.rows}
                          columns={importColumns}
                          enablePagination={true}
                          manualSorting={false}
                          maxHeight={360}
                          tableOptions={IMPORT_PREVIEW_TABLE_OPTIONS}
                        />
                      </Box>
                    </Box>
                  ),
              )}
              <Alert
                severity={correctRecordsCount > 0 ? "success" : "warning"}
                sx={{
                  mt: 2,
                  borderRadius: 2,
                  border: `1px solid ${correctRecordsCount > 0 ? "#BBF7D0" : "#FDE68A"}`,
                }}
              >
                {correctRecordsCount > 0
                  ? `${correctRecordsCount} correct record(s) are ready to save. Incorrect and duplicate records will not be saved.`
                  : "No correct records are available to save."}
              </Alert>
            </>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            py: 2,
            gap: 1,
            backgroundColor: "#FFFFFF",
            borderTop: `1px solid ${THEME.border}`,
          }}
        >
          <Button
            variant="outlined"
            onClick={() => setImportResultOpen(false)}
            disabled={savingImported}
            sx={{
              minWidth: 100,
              color: THEME.primary,
              borderColor: THEME.primary,
              fontWeight: 700,
              borderRadius: 2,
              "&:hover": {
                borderColor: THEME.primaryHover,
                backgroundColor: THEME.primaryLight,
              },
            }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveImportedDepartments}
            disabled={
              !canImportExport || savingImported || correctRecordsCount === 0
            }
            startIcon={
              savingImported ? (
                <CircularProgress size={18} color="inherit" />
              ) : null
            }
            sx={{
              minWidth: 190,
              bgcolor: THEME.primary,
              fontWeight: 700,
              borderRadius: 2,
              "&:hover": { bgcolor: THEME.primaryHover },
            }}
          >
            {savingImported
              ? "Saving..."
              : `Save Correct Records${correctRecordsCount > 0 ? ` (${correctRecordsCount})` : ""}`}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={deleteDialogOpen}
        onClose={(_, reason) => {
          if (reason === "backdropClick" || reason === "escapeKeyDown") {
            return;
          }
          closeDelete();
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, color: THEME.darkTeal }}>
          Delete Department
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: THEME.textSecondary }}>
            Are you sure you want to inactive this department?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={closeDelete}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmDelete}
            sx={{ bgcolor: "#DC2626" }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={historyDialogOpen}
        onClose={closeHistoryDialog}
        maxWidth="xl"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              overflow: "hidden",
              border: `1px solid ${THEME.border}`,
              boxShadow: "0 12px 40px rgba(15, 118, 110, 0.15)",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: THEME.primary,
            color: "#FFFFFF",
            px: 3,
            py: 2,
          }}
        >
          <Typography sx={{ fontWeight: 800, fontSize: 20 }}>
            Department History
          </Typography>
          {historyDepartment && (
            <Typography
              sx={{ mt: 0.5, fontSize: 13, color: "#D1FAE5", fontWeight: 600 }}
            >
              {historyDepartment.departmentCode} -{" "}
              {historyDepartment.departmentName}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent
          sx={{ backgroundColor: THEME.background, p: { xs: 1.5, sm: 2.5 } }}
        >
          {historyLoading ? (
            <Box
              sx={{
                minHeight: 220,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              <CircularProgress size={32} sx={{ color: THEME.primary }} />
              <Typography sx={{ color: THEME.textSecondary, fontWeight: 600 }}>
                Loading department history...
              </Typography>
            </Box>
          ) : departmentHistory.length === 0 ? (
            <Box
              sx={{
                minHeight: 220,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 1,
              }}
            >
              <DescriptionIcon sx={{ fontSize: 42, color: "#94A3B8" }} />
              <Typography sx={{ fontWeight: 700, color: THEME.darkTeal }}>
                No History Found
              </Typography>
              <Typography sx={{ fontSize: 13, color: THEME.textSecondary }}>
                No activity has been recorded for this department.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <DepartmentTable<DepartmentHistory>
                rows={departmentHistory}
                columns={historyColumns}
                isLoading={historyLoading}
                enablePagination={true}
                manualPagination={false}
                manualSorting={false}
                maxHeight="calc(100vh - 300px)"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            py: 2,
            backgroundColor: "#FFFFFF",
            borderTop: `1px solid ${THEME.border}`,
          }}
        >
          <Button
            variant="outlined"
            onClick={closeHistoryDialog}
            sx={{
              color: THEME.primary,
              borderColor: THEME.primary,
              fontWeight: 700,
              borderRadius: 2,
              "&:hover": {
                borderColor: THEME.primaryHover,
                backgroundColor: THEME.primaryLight,
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
export default DepartmentActivity;
