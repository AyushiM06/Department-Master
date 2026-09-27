import { useState } from "react";
import type React from "react";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Card,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  InputAdornment,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import SearchIcon from "@mui/icons-material/Search";
import BusinessIcon from "@mui/icons-material/Business";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { type Dayjs } from "dayjs";
import Dropdown from "../../component/Dropdown";
import MultiSelect from "../../component/MultiSelect";

const THEME = {
  primary: "#0F766E",
  primaryHover: "#115E59",
  darkTeal: "#173F3B",
  primaryLight: "#E6F4F2",
  textSecondary: "#647A76",
  border: "#D7E6E3",
  white: "#FFFFFF",
};

export interface FilterOption {
  label: string;
  value: string | number;
}

interface DepartmentFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  isSearchApplied: boolean;
  onSearchClick: () => void;
  departmentType: string;
  onDepartmentTypeChange: (value: string) => void;
  branches: number[];
  onBranchesChange: (value: number[]) => void;
  businessUnit: string;
  onBusinessUnitChange: (value: string) => void;
  status: boolean | "";
  onStatusChange: (value: boolean | "") => void;
  fromDate: string;
  toDate: string;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onApply: () => void;
  onReset: () => void;
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  departmentFilter: "all" | "active" | "inactive";
  onTileClick: (filter: "all" | "active" | "inactive") => void;
  dateMode: "DATE_FILTER" | "SINCE_BEGINNING";
  onDateModeChange: (mode: "DATE_FILTER" | "SINCE_BEGINNING") => void;
  departmentTypeOptions: FilterOption[];
  branchOptions: FilterOption[];
  businessUnitOptions: FilterOption[];
  dropdownLoading: boolean;
}

interface StatTileProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  type: "total" | "active" | "inactive";
}

const TILE_COLORS = {
  total: {
    background: "#174A46",
    hoverBackground: "#1E5C57",
    border: "#276C66",
    iconBackground: "#0F766E",
    iconColor: "#FFFFFF",
    text: "#FFFFFF",
    subText: "#D5EFEC",
    selectedBorder: "#5EEAD4",
    selectedShadow: "rgba(15, 118, 110, 0.35)",
  },
  active: {
    background: "#14532D",
    hoverBackground: "#166534",
    border: "#237A43",
    iconBackground: "#16A34A",
    iconColor: "#FFFFFF",
    text: "#FFFFFF",
    subText: "#D1FAE5",
    selectedBorder: "#4ADE80",
    selectedShadow: "rgba(22, 163, 74, 0.35)",
  },
  inactive: {
    background: "#7F1D1D",
    hoverBackground: "#991B1B",
    border: "#A52A2A",
    iconBackground: "#DC2626",
    iconColor: "#FFFFFF",
    text: "#FFFFFF",
    subText: "#FEE2E2",
    selectedBorder: "#F87171",
    selectedShadow: "rgba(220, 38, 38, 0.35)",
  },
};

export function DepartmentStatTile({
  label,
  value,
  icon,
  selected,
  onClick,
  type,
}: StatTileProps) {
  const colors = TILE_COLORS[type];
  return (
    <Card
      onClick={onClick}
      sx={{
        width: "100%",
        height: { xs: 110, sm: 125 },
        minHeight: 0,
        boxSizing: "border-box",
        borderRadius: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
        border: `1px solid ${colors.border}`,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
        cursor: "pointer",
        transition:
          "transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        ...(selected && {
          border: `2px solid ${colors.selectedBorder}`,
          boxShadow: `0 7px 20px ${colors.selectedShadow}`,
        }),
        "&:hover": {
          transform: "translateY(-4px)",
          backgroundColor: colors.hoverBackground,
          borderColor: colors.selectedBorder,
          boxShadow: `0 9px 22px ${colors.selectedShadow}`,
        },
      }}
    >
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: 0.7,
          px: 1,
        }}
      >
        <Box
          sx={{
            width: { xs: 38, sm: 44 },
            height: { xs: 38, sm: 44 },
            borderRadius: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.iconBackground,
            color: colors.iconColor,
            flexShrink: 0,
            boxShadow: "0 3px 8px rgba(0, 0, 0, 0.18)",
            "& svg": { fontSize: { xs: 20, sm: 23 } },
          }}
        >
          {icon}
        </Box>
        <Typography
          sx={{
            fontSize: { xs: 11, sm: 12 },
            color: colors.subText,
            fontWeight: 700,
            textAlign: "center",
            lineHeight: 1.2,
            letterSpacing: "0.2px",
          }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: 23, sm: 26 },
            fontWeight: 800,
            color: colors.text,
            lineHeight: 1,
            textAlign: "center",
            letterSpacing: "0.3px",
          }}
        >
          {Number.isFinite(value) ? value : 0}
        </Typography>
      </Box>
    </Card>
  );
}

function DepartmentFilters({
  search,
  onSearchChange,
  isSearchApplied,
  onSearchClick,
  departmentType,
  onDepartmentTypeChange,
  branches,
  onBranchesChange,
  businessUnit,
  onBusinessUnitChange,
  status,
  onStatusChange,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onApply,
  onReset,
  totalCount,
  activeCount,
  inactiveCount,
  departmentFilter,
  onTileClick,
  dateMode,
  onDateModeChange,
  departmentTypeOptions,
  branchOptions,
  businessUnitOptions,
  dropdownLoading,
}: DepartmentFiltersProps) {
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [fromDateValue, setFromDateValue] = useState<Dayjs | null>(
    fromDate ? dayjs(fromDate) : dayjs().subtract(6, "day"),
  );
  const [toDateValue, setToDateValue] = useState<Dayjs | null>(
    toDate ? dayjs(toDate) : dayjs(),
  );
  const [fromDateError, setFromDateError] = useState("");
  const [toDateError, setToDateError] = useState("");

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      backgroundColor: THEME.white,
      "&:hover fieldset": { borderColor: THEME.primary },
      "&.Mui-focused fieldset": { borderColor: THEME.primary },
    },
    "& .MuiInputLabel-root.Mui-focused": { color: THEME.primary },
  };

  const formatDate = (date: Dayjs | null) =>
    date?.isValid() ? date.format("YYYY-MM-DD") : "";

  const handleFromDateChange = (value: Dayjs | null) => {
    setFromDateValue(value);
    if (!value) {
      setFromDateError("");
      onFromDateChange("");
      return;
    }
    if (!value.isValid()) {
      setFromDateError("Please enter a valid date.");
      onFromDateChange("");
      return;
    }
    if (toDateValue && value.isAfter(toDateValue, "day")) {
      setFromDateError("From date cannot be after To date.");
      onFromDateChange("");
      return;
    }
    setFromDateError("");
    onFromDateChange(formatDate(value));
  };

  const handleToDateChange = (value: Dayjs | null) => {
    setToDateValue(value);
    if (!value) {
      setToDateError("");
      onToDateChange("");
      return;
    }
    if (!value.isValid()) {
      setToDateError("Please enter a valid date.");
      onToDateChange("");
      return;
    }
    if (fromDateValue && value.isBefore(fromDateValue, "day")) {
      setToDateError("To date cannot be before From date.");
      onToDateChange("");
      return;
    }
    setToDateError("");
    onToDateChange(formatDate(value));
  };

  const handleApply = () => {
    if (fromDateError || toDateError) return;
    setShowMoreFilters(false);
    onApply();
  };

  const handleReset = () => {
    const today = dayjs();
    const oneWeekAgo = today.subtract(6, "day");
    setFromDateValue(oneWeekAgo);
    setToDateValue(today);
    setFromDateError("");
    setToDateError("");
    setShowMoreFilters(false);
    onFromDateChange(oneWeekAgo.format("YYYY-MM-DD"));
    onToDateChange(today.format("YYYY-MM-DD"));
    onReset();
  };

  const numericBranchOptions = branchOptions.map((option) => ({
    label: option.label,
    value: Number(option.value),
  }));

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid container spacing={3} sx={{ width: "100%", minWidth: 0 }}>
        <Grid size={{ xs: 12, lg: 6 }} sx={{ minWidth: 0 }}>
          <Box
            sx={{
              width: "100%",
              height: "100%",
              boxSizing: "border-box",
              borderRadius: 3,
              p: { xs: 2, sm: 2.5, md: 3 },
              border: `1px solid ${THEME.border}`,
              backgroundColor: THEME.white,
            }}
          >
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: THEME.primaryLight,
                  color: THEME.primary,
                }}
              >
                <FilterAltIcon fontSize="small" />
              </Box>
              <Box>
                <Typography
                  sx={{ fontWeight: 800, color: THEME.darkTeal, fontSize: 16 }}
                >
                  Search Filters
                </Typography>
                <Typography
                  sx={{ fontSize: 12, color: THEME.textSecondary, mt: 0.2 }}
                >
                  Search and filter departments
                </Typography>
              </Box>
            </Box>
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Search"
                  placeholder="Search department code, name, head"
                  value={search}
                  onChange={(event) => onSearchChange(event.target.value)}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={onSearchClick}
                            size="small"
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: 2,
                              color: THEME.primary,
                              "&:hover": {
                                backgroundColor: THEME.primaryLight,
                              },
                            }}
                          >
                            {isSearchApplied ? (
                              <CloseIcon fontSize="small" />
                            ) : (
                              <SearchIcon fontSize="small" />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={fieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <DatePicker
                  label="Created From"
                  value={fromDateValue}
                  onChange={handleFromDateChange}
                  format="DD-MM-YYYY"
                  maxDate={toDateValue ?? undefined}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      error: Boolean(fromDateError),
                      helperText: fromDateError,
                      sx: fieldSx,
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <DatePicker
                  label="Created To"
                  value={toDateValue}
                  onChange={handleToDateChange}
                  format="DD-MM-YYYY"
                  minDate={fromDateValue ?? undefined}
                  maxDate={dayjs()}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      error: Boolean(toDateError),
                      helperText: toDateError,
                      sx: fieldSx,
                    },
                  }}
                />
              </Grid>
            </Grid>

            {showMoreFilters && (
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Dropdown
                    label="Department Type"
                    name="departmentType"
                    value={departmentType}
                    onChange={(event) =>
                      onDepartmentTypeChange(String(event.target.value ?? ""))
                    }
                    options={departmentTypeOptions}
                    disabled={dropdownLoading}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <MultiSelect
                    label="Branch"
                    name="branches"
                    options={numericBranchOptions}
                    value={branches}
                    onChange={(event) => {
                      const value = event.target.value;
                      onBranchesChange(
                        Array.isArray(value)
                          ? value.map(Number)
                          : String(value)
                              .split(",")
                              .filter(Boolean)
                              .map(Number),
                      );
                    }}
                    disabled={dropdownLoading}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Dropdown
                    label="Business Unit"
                    name="businessUnit"
                    value={businessUnit}
                    onChange={(event) =>
                      onBusinessUnitChange(String(event.target.value ?? ""))
                    }
                    options={businessUnitOptions}
                    disabled={dropdownLoading}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl>
                    <FormLabel
                      sx={{ fontSize: 12, color: THEME.textSecondary, mb: 0.5 }}
                    >
                      Status
                    </FormLabel>
                    <RadioGroup
                      row
                      value={status === "" ? "" : String(status)}
                      onChange={(event) => {
                        const value = event.target.value;
                        onStatusChange(value === "" ? "" : value === "true");
                      }}
                      sx={{
                        "& .MuiRadio-root": {
                          color: "#94A3B8",
                          "&.Mui-checked": { color: THEME.primary },
                        },
                        "& .MuiFormControlLabel-label": { fontSize: 13 },
                      }}
                    >
                      <FormControlLabel
                        value="false"
                        control={<Radio size="small" />}
                        label="Active"
                      />
                      <FormControlLabel
                        value="true"
                        control={<Radio size="small" />}
                        label="Inactive"
                      />
                    </RadioGroup>
                  </FormControl>
                </Grid>
              </Grid>
            )}

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1.5,
                mt: 2.5,
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="contained"
                startIcon={<FilterAltIcon />}
                onClick={handleApply}
                disabled={Boolean(fromDateError || toDateError)}
                sx={{
                  minWidth: 160,
                  backgroundColor: THEME.primary,
                  borderRadius: 2,
                  fontWeight: 700,
                  textTransform: "none",
                  "&:hover": { backgroundColor: THEME.primaryHover },
                }}
              >
                Apply Filters
              </Button>
              <Button
                variant="outlined"
                startIcon={
                  showMoreFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />
                }
                onClick={() => setShowMoreFilters((value) => !value)}
                sx={{
                  minWidth: 160,
                  color: THEME.primary,
                  borderColor: THEME.primary,
                  borderRadius: 2,
                  fontWeight: 700,
                  textTransform: "none",
                  "&:hover": {
                    borderColor: THEME.primaryHover,
                    backgroundColor: THEME.primaryLight,
                  },
                }}
              >
                {showMoreFilters ? "Hide Filters" : "More Filters"}
              </Button>
              <Button
                variant="outlined"
                startIcon={<RestartAltIcon />}
                onClick={handleReset}
                sx={{
                  minWidth: 120,
                  color: THEME.primary,
                  borderColor: THEME.primary,
                  borderRadius: 2,
                  fontWeight: 700,
                  textTransform: "none",
                  "&:hover": {
                    borderColor: THEME.primaryHover,
                    backgroundColor: THEME.primaryLight,
                  },
                }}
              >
                Reset
              </Button>
            </Box>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }} sx={{ minWidth: 0 }}>
          <Grid
            container
            spacing={2}
            sx={{ width: "100%", height: "100%", minWidth: 0 }}
          >
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 1,
                mb: 1.8,
              }}
            >
              <Box
                onClick={() => onDateModeChange("DATE_FILTER")}
                sx={{
                  height: 34,
                  minWidth: 136,
                  px: 2,
                  borderRadius: 2,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border:
                    dateMode === "DATE_FILTER"
                      ? `1px solid ${THEME.primary}`
                      : `1px solid ${THEME.border}`,
                  backgroundColor:
                    dateMode === "DATE_FILTER" ? THEME.primary : THEME.white,
                  color:
                    dateMode === "DATE_FILTER"
                      ? THEME.white
                      : THEME.textSecondary,
                  fontWeight: 700,
                  fontSize: 15,
                  whiteSpace: "nowrap",
                  boxShadow:
                    dateMode === "DATE_FILTER"
                      ? "0 3px 8px rgba(15, 118, 110, 0.25)"
                      : "none",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: THEME.primaryHover,
                    color: THEME.white,
                    borderColor: THEME.primaryHover,
                  },
                }}
              >
                As Per Date Filter
              </Box>
              <Box
                onClick={() => onDateModeChange("SINCE_BEGINNING")}
                sx={{
                  height: 34,
                  minWidth: 124,
                  px: 2,
                  borderRadius: 2,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border:
                    dateMode === "SINCE_BEGINNING"
                      ? `1px solid ${THEME.primary}`
                      : `1px solid ${THEME.border}`,
                  backgroundColor:
                    dateMode === "SINCE_BEGINNING"
                      ? THEME.primary
                      : THEME.white,
                  color:
                    dateMode === "SINCE_BEGINNING"
                      ? THEME.white
                      : THEME.textSecondary,
                  fontWeight: 700,
                  fontSize: 15,
                  whiteSpace: "nowrap",
                  boxShadow:
                    dateMode === "SINCE_BEGINNING"
                      ? "0 3px 8px rgba(15, 118, 110, 0.25)"
                      : "none",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: THEME.primaryHover,
                    color: THEME.white,
                    borderColor: THEME.primaryHover,
                  },
                }}
              >
                Since Beginning
              </Box>
            </Box>
            <Grid size={{ xs: 12, sm: 4 }}>
              <DepartmentStatTile
                label="Total Departments"
                value={totalCount}
                icon={<BusinessIcon />}
                type="total"
                selected={departmentFilter === "all"}
                onClick={() => onTileClick("all")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <DepartmentStatTile
                label="Active"
                value={activeCount}
                icon={<CheckCircleIcon />}
                type="active"
                selected={departmentFilter === "active"}
                onClick={() => onTileClick("active")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <DepartmentStatTile
                label="Inactive"
                value={inactiveCount}
                icon={<CancelIcon />}
                type="inactive"
                selected={departmentFilter === "inactive"}
                onClick={() => onTileClick("inactive")}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
}

export default DepartmentFilters;
