import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import { fetchDepartmentDropdownData } from "../../store/slices/departmentSlice";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Chip,
} from "@mui/material";

import BusinessIcon from "@mui/icons-material/Business";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";

import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

import { DepartmentStatTile } from "./department/department-filter";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";

import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5percent from "@amcharts/amcharts5/percent";
import * as am5radar from "@amcharts/amcharts5/radar";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

import type { MRT_ColumnDef } from "material-react-table";

import DepartmentTable, {
  type DepartmentPagination,
  type DepartmentSorting,
} from "../component/Material-react-table";

import {
  getDashboardStatistics,
  searchDepartments,
  getAllUsers,
  getDepartmentTableHeaders,
} from "../pages/department/departmentApi";

import type {
  UserLookupResponse,
  TableHeader,
} from "../pages/department/departmentApi";

type TableView = "graph" | "table";

type TypeData = {
  name: string;
  count: number;
};

type StatusData = TypeData;

type StackedData = {
  name: string;
  active: number;
  inactive: number;
};

type ActiveRateData = {
  metric: string;
  activeDepartments: number;
  totalDepartments: number;
  percentage: string;
};

type ViewKey =
  | "amBar"
  | "amDonut"
  | "amGauge"
  | "reBar"
  | "reDonut"
  | "reStacked"
  | "reGauge"
  | "apexArea"
  | "apexDonut"
  | "apexBar"
  | "apexGauge";

type DepartmentDetailRow = {
  id: number;
  departmentCode: string;
  departmentName: string;
  shortName?: string | null;
  departmentType: string;
  parentDepartment?: number | null;
  departmentHead?: number | null;
  branches?: number[] | null;
  businessUnit?: number | null;
  costCenter?: string | null;
  departmentEmail?: string | null;
  departmentPhone?: string | null;
  workingDays?: string[] | null;
  workingShift?: number | null;
  description?: string | null;
  departmentLogo?: string | null;
  documentPath?: string | null;
  tags?: string[] | null;
  keywords?: string | null;
  remarks?: string | null;
  status: boolean;
  createdBy?: string | number | null;
  createdAt?: string | null;
  updatedBy?: string | number | null;
  updatedAt?: string | null;
};

type DepartmentMasterItem = {
  id: number;
  name: string;
};

const emptyMasterData = {
  branches: [] as DepartmentMasterItem[],
  businessUnits: [] as DepartmentMasterItem[],
  workingShifts: [] as DepartmentMasterItem[],
  departments: [] as DepartmentMasterItem[],
};

const THEME = {
  primary: "#0F766E",
  primaryDark: "#115E59",
  darkTeal: "#173F3B",
  background: "#F4F8F7",
  textSecondary: "#64748B",
  border: "#D7E7E4",
  active: "#16A34A",
  inactive: "#DC2626",
};

const CHART_COLORS = [
  "#0F766E",
  "#0D9488",
  "#14B8A6",
  "#2DD4BF",
  "#5EEAD4",
  "#16A34A",
  "#115E59",
];

const PIE_COLORS = [THEME.active, THEME.inactive];

const cardSx = {
  borderRadius: 3,
  border: `1px solid ${THEME.border}`,
  boxShadow: "0 4px 18px rgba(23, 63, 59, 0.07)",
};

const chartCardSx = {
  ...cardSx,
  height: 460,
  overflow: "visible",
};

const chartBoxSx = {
  width: "100%",
  height: 310,
};

const TEXT_CELL = {
  color: "#475569",
  fontSize: 14,
  fontWeight: 500,
};

const CHIP = {
  fontWeight: 700,
  fontSize: 12,
  borderRadius: "8px",
};

const formatDate = (value?: string | null): string => {
  if (!value) return "NA";
  const rawValue = String(value).trim();
  if (!rawValue) return "NA";
  const date = new Date(rawValue.endsWith("Z") ? rawValue : `${rawValue}Z`);
  if (Number.isNaN(date.getTime())) return rawValue;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
};

const typeColumns: MRT_ColumnDef<TypeData, any>[] = [
  { accessorKey: "name", header: "Department Type" },
  { accessorKey: "count", header: "Count" },
];

const statusColumns: MRT_ColumnDef<StatusData, any>[] = [
  { accessorKey: "name", header: "Status" },
  { accessorKey: "count", header: "Count" },
];

const stackedColumns: MRT_ColumnDef<StackedData, any>[] = [
  { accessorKey: "name", header: "Department Type" },
  { accessorKey: "active", header: "Active" },
  { accessorKey: "inactive", header: "Inactive" },
];

const activeRateColumns: MRT_ColumnDef<ActiveRateData, any>[] = [
  { accessorKey: "metric", header: "Metric", size: 120 },
  { accessorKey: "activeDepartments", header: "Active", size: 80 },
  { accessorKey: "totalDepartments", header: "Total", size: 80 },
  { accessorKey: "percentage", header: "Rate", size: 70 },
];

function ViewToggle({
  value,
  onChange,
}: {
  value: TableView;
  onChange: (value: TableView) => void;
}) {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", mb: 1.5 }}>
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={(_, v) => v && onChange(v)}
        sx={{
          p: "4px",
          gap: "4px",
          borderRadius: "14px",
          background: "linear-gradient(135deg, #E6F4F2 0%, #F0FAF8 100%)",
          border: `1px solid ${THEME.border}`,
          boxShadow: "0 3px 12px rgba(15, 118, 110, 0.10)",
          "& .MuiToggleButton-root": {
            minWidth: 88,
            height: 34,
            px: 2.2,
            py: 0.5,
            border: "none",
            borderRadius: "10px !important",
            textTransform: "none",
            fontSize: 12,
            fontWeight: 800,
            color: THEME.textSecondary,
            transition: "all 0.2s ease",
            "&:hover": { backgroundColor: "#D9F0EC", color: THEME.primaryDark },
          },
          "& .MuiToggleButton-root.Mui-selected": {
            background: "linear-gradient(135deg, #0F766E 0%, #115E59 100%)",
            color: "#FFFFFF",
            boxShadow: "0 3px 8px rgba(15, 118, 110, 0.28)",
          },
          "& .MuiToggleButton-root.Mui-selected:hover": {
            backgroundColor: THEME.primaryDark,
            color: "#FFFFFF",
          },
        }}
      >
        <ToggleButton value="graph">
          <Box component="span" sx={{ mr: 0.7, fontSize: 13 }}>
            ◈
          </Box>
          Graph
        </ToggleButton>
        <ToggleButton value="table">
          <Box component="span" sx={{ mr: 0.7, fontSize: 13 }}>
            ▤
          </Box>
          Table
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}

function ChartCard({
  title,
  view,
  setView,
  graph,
  table,
}: {
  title: string;
  view: TableView;
  setView: (value: TableView) => void;
  graph: React.ReactNode;
  table: React.ReactNode;
}) {
  return (
    <Card sx={chartCardSx}>
      <CardContent
        sx={{ height: "100%", boxSizing: "border-box", overflow: "visible" }}
      >
        <Typography
          sx={{ fontSize: 18, fontWeight: 800, color: THEME.darkTeal, mb: 1 }}
        >
          {title}
        </Typography>
        <ViewToggle value={view} onChange={setView} />
        {view === "graph" ? graph : table}
      </CardContent>
    </Card>
  );
}

function DateField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: string;
  min?: string;
  max?: string;
  onChange: (value: string) => void;
}) {
  return (
    <Box>
      <Typography
        sx={{
          fontSize: 12,
          fontWeight: 700,
          color: THEME.textSecondary,
          mb: 0.7,
        }}
      >
        {label}
      </Typography>
      <Box
        component="input"
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange(e.target.value)
        }
        sx={{
          width: "100%",
          height: 42,
          px: 1.5,
          border: `1px solid ${THEME.border}`,
          borderRadius: 1.5,
          outline: "none",
          fontSize: 14,
          color: THEME.darkTeal,
          boxSizing: "border-box",
          "&:focus": { borderColor: THEME.primary },
        }}
      />
    </Box>
  );
}

const rechartsAxis = {
  tick: { fontSize: 12, fill: "#64748B" },
  axisLine: false,
  tickLine: false,
};
const rechartsTooltip = {
  borderRadius: 12,
  border: "1px solid #E2E8F0",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)",
};

function RechartsType({ data }: { data: TypeData[] }) {
  return (
    <RechartsBar data={data}>
      <Bar dataKey="count" name="Departments" radius={[8, 8, 2, 2]}>
        {data.map((_, i) => (
          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
        ))}
      </Bar>
    </RechartsBar>
  );
}

function RechartsBar({
  data,
  children,
}: {
  data: TypeData[];
  children: React.ReactNode;
}) {
  return (
    <Box sx={chartBoxSx}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 10, right: 15, left: 0, bottom: 10 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#D7E7E4"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={rechartsAxis.tick}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={rechartsAxis.tick}
            axisLine={false}
            tickLine={false}
          />
          <RechartsTooltip contentStyle={rechartsTooltip} />
          <RechartsLegend />
          {children}
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}

function RechartsStatus({ data }: { data: StatusData[] }) {
  return (
    <Box sx={chartBoxSx}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="name"
            cx="50%"
            cy="42%"
            innerRadius={68}
            outerRadius={108}
            paddingAngle={4}
            cornerRadius={8}
            label
          >
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={PIE_COLORS[i % PIE_COLORS.length]}
                stroke="#FFFFFF"
                strokeWidth={3}
              />
            ))}
          </Pie>
          <RechartsTooltip contentStyle={rechartsTooltip} />
          <RechartsLegend />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
}

function RechartsStacked({ data }: { data: StackedData[] }) {
  return (
    <RechartsBar data={data}>
      <Bar
        dataKey="active"
        name="Active"
        stackId="status"
        fill={THEME.active}
      />
      <Bar
        dataKey="inactive"
        name="Inactive"
        stackId="status"
        fill={THEME.inactive}
        radius={[6, 6, 0, 0]}
      />
    </RechartsBar>
  );
}

function RechartsGauge({ percentage }: { percentage: number }) {
  return (
    <Box sx={{ position: "relative", ...chartBoxSx, height: 300 }}>
      <ResponsiveContainer>
        <RadialBarChart
          cx="50%"
          cy="65%"
          innerRadius="65%"
          outerRadius="100%"
          barSize={24}
          startAngle={180}
          endAngle={0}
          data={[{ name: "Active Rate", value: percentage }]}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            dataKey="value"
            cornerRadius={12}
            background={{ fill: "#D7E7E4" }}
            angleAxisId={0}
            fill={THEME.active}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <Box
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 25,
          textAlign: "center",
        }}
      >
        <Typography sx={{ fontSize: 34, fontWeight: 800, color: THEME.active }}>
          {percentage}%
        </Typography>
        <Typography
          sx={{ fontSize: 13, color: THEME.textSecondary, fontWeight: 600 }}
        >
          Active Rate
        </Typography>
      </Box>
    </Box>
  );
}

function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { dropdownData, dropdownLoading, dropdownLoaded } = useSelector(
    (state: RootState) => state.department,
  );

  const defaultFrom = getOneWeekAgo();
  const defaultTo = getToday();

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  const [typeData, setTypeData] = useState<TypeData[]>([]);

  const [statusData, setStatusData] = useState<StatusData[]>([]);

  const [stackedData, setStackedData] = useState<StackedData[]>([]);

  const [fromDate, setFromDate] = useState(defaultFrom);

  const [toDate, setToDate] = useState(defaultTo);

  const [appliedFromDate, setAppliedFromDate] = useState(defaultFrom);

  const [appliedToDate, setAppliedToDate] = useState(defaultTo);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [views, setViews] = useState<Record<ViewKey, TableView>>({
    amBar: "graph",
    amDonut: "graph",
    amGauge: "graph",
    reBar: "graph",
    reDonut: "graph",
    reStacked: "graph",
    reGauge: "graph",
    apexArea: "graph",
    apexDonut: "graph",
    apexBar: "graph",
    apexGauge: "graph",
  });

  const [masterData, setMasterData] = useState(emptyMasterData);

  const [users, setUsers] = useState<UserLookupResponse[]>([]);

  const [departmentTableHeaders, setDepartmentTableHeaders] = useState<
    TableHeader[]
  >([]);

  const [departmentDialogOpen, setDepartmentDialogOpen] = useState(false);

  const [selectedDepartmentType, setSelectedDepartmentType] = useState("");

  const [departmentDetails, setDepartmentDetails] = useState<
    DepartmentDetailRow[]
  >([]);

  const [departmentDialogLoading, setDepartmentDialogLoading] = useState(false);

  const [departmentDialogError, setDepartmentDialogError] = useState("");

  const [departmentDialogPagination, setDepartmentDialogPagination] =
    useState<DepartmentPagination>({
      pageIndex: 0,
      pageSize: 10,
    });

  const [departmentDialogSorting, setDepartmentDialogSorting] =
    useState<DepartmentSorting>([]);

  const [departmentDialogTotalElements, setDepartmentDialogTotalElements] =
    useState(0);

  const [departmentDialogFilter, setDepartmentDialogFilter] = useState<{
    departmentType: string | null;
    status: boolean | null;
  }>({
    departmentType: null,
    status: null,
  });

  const setView = (key: ViewKey) => (value: TableView) =>
    setViews((prev) => ({
      ...prev,
      [key]: value,
    }));

  const loadUsers = async () => {
    try {
      const data = await getAllUsers();

      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setUsers([]);
    }
  };

  const loadDepartmentTableHeaders = async () => {
    try {
      const headers = await getDepartmentTableHeaders();

      setDepartmentTableHeaders([...headers].sort((a, b) => a.order - b.order));
    } catch (error) {}
  };

  const loadDepartmentNames = async () => {
    try {
      const response = await searchDepartments({
        globalSearch: null,
        departmentType: null,
        branches: null,
        businessUnit: null,
        status: null,
        fromDate: null,
        toDate: null,
        page: 0,
        size: 1000,
        sortBy: "departmentName",
        direction: "asc",
      });
      const result = response?.data ?? {};
      const content = Array.isArray(result?.content)
        ? result.content
        : Array.isArray(result?.rows)
          ? result.rows
          : [];
      setMasterData((prev) => ({
        ...prev,
        departments: content
          .filter((item: any) => item?.id != null)
          .map((item: any) => ({
            id: Number(item.id),
            name: String(item.departmentName ?? ""),
          })),
      }));
    } catch (err) {}
  };

  useEffect(() => {
    if (!dropdownLoaded && !dropdownLoading) {
      dispatch(fetchDepartmentDropdownData());
    }
  }, [dispatch, dropdownLoaded, dropdownLoading]);

  useEffect(() => {
    setMasterData((prev) => ({
      ...prev,
      branches: Array.isArray(dropdownData?.branches)
        ? dropdownData.branches.map((item) => ({
            id: Number(item.id),
            name: String(item.name ?? ""),
          }))
        : [],
      businessUnits: Array.isArray(dropdownData?.businessUnits)
        ? dropdownData.businessUnits.map((item) => ({
            id: Number(item.id),
            name: String(item.name ?? ""),
          }))
        : [],
      workingShifts: Array.isArray(dropdownData?.workingShifts)
        ? dropdownData.workingShifts.map((item) => ({
            id: Number(item.id),
            name: String(item.name ?? ""),
          }))
        : [],
    }));
  }, [dropdownData]);

  useEffect(() => {
    loadDepartmentNames();
    loadUsers();
  }, []);

  const getNameById = (items: DepartmentMasterItem[], id?: number | null) => {
    if (id == null) {
      return "NA";
    }

    const item = items.find((master) => master.id === Number(id));

    return item?.name || "NA";
  };

  const getBranchNames = (ids?: number[] | null) => {
    if (!Array.isArray(ids) || ids.length === 0) {
      return "NA";
    }

    return (
      ids
        .map((id) => getNameById(masterData.branches, id))
        .filter((name) => name !== "NA")
        .join(", ") || "NA"
    );
  };

  const getBusinessUnitName = (id?: number | null) => {
    return getNameById(masterData.businessUnits, id);
  };

  const getUserName = (id?: string | number | null) => {
    if (id === null || id === undefined || id === "") {
      return "NA";
    }

    const user = users.find((item) => Number(item.id) === Number(id));

    return user?.username || String(id);
  };

  const getDepartmentTableHeader = (field: string, fallback: string) => {
    return (
      departmentTableHeaders.find((item) => item.field === field)?.header ??
      fallback
    );
  };

  const header = (field: string, fallback: string) =>
    getDepartmentTableHeader(field, fallback);
  const textCell = (value: React.ReactNode, extra = {}) => (
    <Box sx={{ ...TEXT_CELL, ...extra }}>{value}</Box>
  );
  const userCell = (id?: string | number | null) => textCell(getUserName(id));
  const departmentDetailColumns = React.useMemo<
    MRT_ColumnDef<DepartmentDetailRow, any>[]
  >(
    () => [
      {
        accessorKey: "departmentCode",
        header: header("departmentCode", "Department Code"),
        size: 170,
        Cell: ({ cell }) => (
          <Chip
            label={String(cell.getValue() ?? "NA")}
            size="small"
            sx={{
              ...CHIP,
              bgcolor: "#E6F4F2",
              color: THEME.primaryDark,
              border: "1px solid #BFE3DE",
              minWidth: 95,
            }}
          />
        ),
      },
      {
        accessorKey: "departmentName",
        header: header("departmentName", "Department Name"),
        size: 230,
        Cell: ({ cell }) => (
          <Box sx={{ fontWeight: 700, color: "#0F172A" }}>
            {String(cell.getValue() ?? "NA")}
          </Box>
        ),
      },
      {
        accessorKey: "departmentType",
        header: header("departmentType", "Department Type"),
        size: 160,
        Cell: ({ cell }) => (
          <Chip
            label={String(cell.getValue() ?? "NA")}
            size="small"
            sx={{
              ...CHIP,
              bgcolor: "#F0FDFA",
              color: THEME.primaryDark,
              border: "1px solid #CCFBF1",
            }}
          />
        ),
      },
      {
        accessorKey: "departmentHead",
        header: header("departmentHead", "Department Head"),
        size: 180,
        Cell: ({ row }) => userCell(row.original.departmentHead),
      },
      {
        accessorKey: "branches",
        header: header("branches", "Branch"),
        size: 190,
        enableSorting: false,
        Cell: ({ row }) =>
          textCell(getBranchNames(row.original.branches), {
            whiteSpace: "normal",
            lineHeight: 1.5,
          }),
      },
      {
        accessorKey: "businessUnit",
        header: header("businessUnit", "Business Unit"),
        size: 180,
        Cell: ({ row }) =>
          textCell(getBusinessUnitName(row.original.businessUnit)),
      },
      {
        accessorKey: "departmentEmail",
        header: header("departmentEmail", "Email"),
        size: 230,
        Cell: ({ cell }) =>
          textCell(cell.getValue<string | null>()?.trim() || "NA", {
            fontSize: 13,
            whiteSpace: "nowrap",
          }),
      },
      {
        accessorKey: "status",
        header: header("status", "Status"),
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
        header: header("createdBy", "Created By"),
        size: 160,
        Cell: ({ cell }) => userCell(cell.getValue<string | number | null>()),
      },
      {
        accessorKey: "createdAt",
        header: header("createdAt", "Created At"),
        size: 180,
        Cell: ({ cell }) =>
          textCell(formatDate(cell.getValue<string | null>())),
      },
      {
        accessorKey: "updatedBy",
        header: header("updatedBy", "Updated By"),
        size: 160,
        Cell: ({ cell }) => userCell(cell.getValue<string | number | null>()),
      },
      {
        accessorKey: "updatedAt",
        header: header("updatedAt", "Updated At"),
        size: 180,
        Cell: ({ cell }) =>
          textCell(formatDate(cell.getValue<string | null>())),
      },
    ],
    [
      masterData.branches,
      masterData.businessUnits,
      users,
      departmentTableHeaders,
    ],
  );

  const fetchDepartmentDetails = async ({
    pageIndex,
    pageSize,
    sorting,
    departmentType,
    status,
  }: {
    pageIndex: number;
    pageSize: number;
    sorting: DepartmentSorting;
    departmentType: string | null;
    status: boolean | null;
  }) => {
    try {
      setDepartmentDialogLoading(true);

      setDepartmentDialogError("");

      const currentSort = sorting[0];

      const response = await searchDepartments({
        globalSearch: null,

        departmentType,

        branches: null,

        businessUnit: null,

        status,

        fromDate: appliedFromDate ? `${appliedFromDate}T00:00:00` : null,

        toDate: appliedToDate ? `${appliedToDate}T23:59:59` : null,

        page: pageIndex,

        size: pageSize,

        sortBy: currentSort?.id || "departmentName",

        direction: currentSort?.desc ? "desc" : "asc",
      });

      const result = response?.data ?? {};

      const content = Array.isArray(result?.content)
        ? result.content
        : Array.isArray(result?.rows)
          ? result.rows
          : [];

      setDepartmentDetails(content as DepartmentDetailRow[]);

      setDepartmentDialogTotalElements(
        Number(result?.totalElements ?? result?.total ?? content.length),
      );
    } catch (err: any) {
      setDepartmentDetails([]);

      setDepartmentDialogTotalElements(0);

      setDepartmentDialogError(
        err?.response?.data?.message || "Failed to load department details.",
      );
    } finally {
      setDepartmentDialogLoading(false);
    }
  };

  const loadDepartmentDetails = ({
    title,
    departmentType,
    status,
  }: {
    title: string;
    departmentType?: string | null;
    status?: boolean | null;
  }) => {
    setSelectedDepartmentType(title);

    setDepartmentDialogOpen(true);

    setDepartmentDialogLoading(true);

    setDepartmentDialogError("");

    setDepartmentDetails([]);

    setDepartmentDialogTotalElements(0);

    setDepartmentDialogFilter({
      departmentType: departmentType ?? null,

      status: status ?? null,
    });

    setDepartmentDialogPagination({
      pageIndex: 0,
      pageSize: 10,
    });

    setDepartmentDialogSorting([]);
  };

  useEffect(() => {
    if (!departmentDialogOpen) {
      return;
    }

    fetchDepartmentDetails({
      pageIndex: departmentDialogPagination.pageIndex,

      pageSize: departmentDialogPagination.pageSize,

      sorting: departmentDialogSorting,

      departmentType: departmentDialogFilter.departmentType,

      status: departmentDialogFilter.status,
    });
  }, [
    departmentDialogOpen,

    departmentDialogPagination.pageIndex,

    departmentDialogPagination.pageSize,

    departmentDialogSorting,

    departmentDialogFilter.departmentType,

    departmentDialogFilter.status,

    appliedFromDate,
    appliedToDate,
  ]);

  const handleDepartmentCountClick = async (row: TypeData) => {
    await loadDepartmentDetails({
      title: `${row.name} Departments`,

      departmentType: row.name,

      status: null,
    });
  };

  const handleStatusCountClick = async (row: StatusData) => {
    const statusValue = row.name.toLowerCase() === "active" ? false : true;

    await loadDepartmentDetails({
      title: `${row.name} Departments`,

      departmentType: null,

      status: statusValue,
    });
  };

  const handleStackedActiveClick = async (row: StackedData) => {
    await loadDepartmentDetails({
      title: `${row.name} - Active Departments`,

      departmentType: row.name,

      status: false,
    });
  };

  const handleStackedInactiveClick = async (row: StackedData) => {
    await loadDepartmentDetails({
      title: `${row.name} - Inactive Departments`,

      departmentType: row.name,

      status: true,
    });
  };

  const handleActiveRateClick = async () => {
    await loadDepartmentDetails({
      title: "Active Departments",

      departmentType: null,

      status: false,
    });
  };

  const closeDepartmentDialog = () => {
    if (departmentDialogLoading) {
      return;
    }

    setDepartmentDialogOpen(false);

    setSelectedDepartmentType("");

    setDepartmentDetails([]);

    setDepartmentDialogError("");

    setDepartmentDialogTotalElements(0);

    setDepartmentDialogPagination({
      pageIndex: 0,
      pageSize: 10,
    });

    setDepartmentDialogSorting([]);

    setDepartmentDialogFilter({
      departmentType: null,
      status: null,
    });
  };

  const amBarRef = useRef<HTMLDivElement>(null);

  const amDonutRef = useRef<HTMLDivElement>(null);

  const amGaugeRef = useRef<HTMLDivElement>(null);

  const loadDashboardData = async (from: string, to: string) => {
    try {
      setLoading(true);

      setError("");

      const response = await getDashboardStatistics({
        fromDate: from,
        toDate: to,
      });

      const data = response?.data ?? response ?? {};

      setStats({
        total: Number(data.totalDepartments ?? 0),

        active: Number(data.activeDepartments ?? 0),

        inactive: Number(data.inactiveDepartments ?? 0),
      });

      setTypeData(
        (Array.isArray(data.departmentTypeStats)
          ? data.departmentTypeStats
          : []
        ).map((item: any) => ({
          name: String(item.name ?? ""),

          count: Number(item.count ?? 0),
        })),
      );

      setStatusData(
        (Array.isArray(data.departmentStatusStats)
          ? data.departmentStatusStats
          : []
        ).map((item: any) => ({
          name: String(item.name ?? ""),

          count: Number(item.count ?? 0),
        })),
      );

      setStackedData(
        (Array.isArray(data.departmentTypeStatusStats)
          ? data.departmentTypeStatusStats
          : []
        ).map((item: any) => ({
          name: String(item.name ?? ""),

          active: Number(item.active ?? 0),

          inactive: Number(item.inactive ?? 0),
        })),
      );
    } catch (err) {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData(defaultFrom, defaultTo);
    loadDepartmentTableHeaders();
  }, []);

  const handleApply = () => {
    if (!fromDate || !toDate) {
      setError("Please select both From Date and To Date.");

      return;
    }

    if (fromDate > toDate) {
      setError("From Date cannot be greater than To Date.");

      return;
    }

    setAppliedFromDate(fromDate);

    setAppliedToDate(toDate);

    loadDashboardData(fromDate, toDate);
  };

  const handleReset = () => {
    const from = getOneWeekAgo();

    const to = getToday();

    setFromDate(from);

    setToDate(to);

    setAppliedFromDate(from);

    setAppliedToDate(to);

    loadDashboardData(from, to);
  };

  const activePercentage = stats.total
    ? Math.round((stats.active / stats.total) * 100)
    : 0;

  const activeRateData: ActiveRateData[] = [
    {
      metric: "Active Rate",

      activeDepartments: stats.active,

      totalDepartments: stats.total,

      percentage: `${activePercentage}%`,
    },
  ];

  const apexAreaOptions: ApexOptions = {
    chart: { type: "area", toolbar: { show: false }, zoom: { enabled: false } },
    colors: ["#0F766E"],
    stroke: { curve: "smooth", width: 3 },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    markers: {
      size: 5,
      strokeWidth: 2,
      strokeColors: "#FFFFFF",
      hover: { size: 7 },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: typeData.map((x) => x.name),
      labels: { style: { colors: "#64748B" } },
    },
    yaxis: {
      min: 0,
      forceNiceScale: true,
      labels: { style: { colors: "#64748B" } },
    },
    tooltip: { theme: "light", y: { formatter: (v) => `${v} departments` } },
    grid: { strokeDashArray: 4, borderColor: "#D7E7E4" },
  };
  const apexDonutOptions: ApexOptions = {
    chart: { type: "donut" },
    colors: ["#16A34A", "#DC2626"],
    labels: statusData.map((x) => x.name),
    legend: { position: "bottom", fontSize: "13px", fontWeight: 600 },
    dataLabels: { enabled: true },
    stroke: { width: 3, colors: ["#FFFFFF"] },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              fontSize: "14px",
              fontWeight: 600,
            },
          },
        },
      },
    },
  };
  const apexGaugeOptions: ApexOptions = {
    chart: { type: "radialBar", toolbar: { show: false } },
    colors: ["#16A34A"],
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: { size: "65%" },
        track: { background: "#D7E7E4", strokeWidth: "100%" },
        dataLabels: {
          name: {
            show: true,
            offsetY: 55,
            fontSize: "14px",
            fontWeight: 600,
            color: "#64748B",
          },
          value: {
            show: true,
            offsetY: -5,
            fontSize: "34px",
            fontWeight: 800,
            color: "#16A34A",
            formatter: (v) => `${Math.round(Number(v))}%`,
          },
        },
      },
    },
    labels: ["Active Rate"],
  };
  const apexBarOptions: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false } },
    colors: CHART_COLORS,
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 8,
        barHeight: "55%",
        distributed: true,
      },
    },
    xaxis: {
      categories: typeData.map((x) => x.name),
      labels: { style: { colors: "#64748B" } },
    },
    dataLabels: { enabled: true, style: { fontSize: "12px", fontWeight: 700 } },
    tooltip: { theme: "light", y: { formatter: (v) => `${v} departments` } },
    grid: { strokeDashArray: 4, borderColor: "#D7E7E4" },
  };

  useEffect(() => {
    if (views.amBar !== "graph" || !amBarRef.current) {
      return;
    }

    const root = am5.Root.new(amBarRef.current);

    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,

        panY: false,

        wheelX: "none",

        wheelY: "none",

        paddingLeft: 0,

        paddingRight: 10,
      }),
    );

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "name",

        renderer: am5xy.AxisRendererX.new(root, {
          minGridDistance: 30,
        }),
      }),
    );

    xAxis.get("renderer").labels.template.setAll({
      fontSize: 12,
    });

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        min: 0,

        renderer: am5xy.AxisRendererY.new(root, {}),
      }),
    );

    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: "Departments",

        xAxis,

        yAxis,

        valueYField: "count",

        categoryXField: "name",

        tooltip: am5.Tooltip.new(root, {
          labelText: "{categoryX}: {valueY}",
        }),
      }),
    );

    series.columns.template.setAll({
      cornerRadiusTL: 6,

      cornerRadiusTR: 6,

      strokeOpacity: 0,
    });

    xAxis.data.setAll(typeData);

    series.data.setAll(typeData);

    series.appear(800);

    chart.appear(800, 100);

    return () => root.dispose();
  }, [typeData, views.amBar]);

  useEffect(() => {
    if (views.amDonut !== "graph" || !amDonutRef.current) {
      return;
    }

    const root = am5.Root.new(amDonutRef.current);

    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        layout: root.verticalLayout,

        innerRadius: am5.percent(65),
      }),
    );

    const series = chart.series.push(
      am5percent.PieSeries.new(root, {
        valueField: "count",

        categoryField: "name",

        alignLabels: false,
      }),
    );

    series.labels.template.setAll({
      fontSize: 12,

      text: "{category}",
    });

    series.ticks.template.setAll({
      forceHidden: true,
    });

    series.data.setAll(statusData);

    series.appear(800, 100);

    return () => root.dispose();
  }, [statusData, views.amDonut]);

  useEffect(() => {
    if (views.amGauge !== "graph" || !amGaugeRef.current) {
      return;
    }

    const root = am5.Root.new(amGaugeRef.current);

    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5radar.RadarChart.new(root, {
        panX: false,

        panY: false,

        startAngle: 180,

        endAngle: 360,

        innerRadius: am5.percent(65),

        radius: am5.percent(72),

        centerX: am5.percent(50),

        centerY: am5.percent(58),

        x: am5.percent(50),

        y: am5.percent(50),
      }),
    );

    const axisRenderer = am5radar.AxisRendererCircular.new(root, {
      innerRadius: -14,

      strokeOpacity: 0,

      minGridDistance: 20,
    });

    axisRenderer.labels.template.setAll({
      forceHidden: true,
    });

    axisRenderer.grid.template.setAll({
      forceHidden: true,
    });

    const xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        min: 0,

        max: 100,

        strictMinMax: true,

        renderer: axisRenderer,
      }),
    );

    const backgroundRange = xAxis.createAxisRange(
      xAxis.makeDataItem({
        value: 0,

        endValue: 100,
      }),
    );

    backgroundRange.get("axisFill")?.setAll({
      visible: true,

      fill: am5.color(0xd7e7e4),

      fillOpacity: 0.8,
    });

    const gradientColors = [0x0f766e, 0x115e59, 0x0d9488, 0x14b8a6, 0x16a34a];

    const interpolateColor = (
      color1: number,
      color2: number,
      amount: number,
    ) => {
      const r1 = (color1 >> 16) & 255;

      const g1 = (color1 >> 8) & 255;

      const b1 = color1 & 255;

      const r2 = (color2 >> 16) & 255;

      const g2 = (color2 >> 8) & 255;

      const b2 = color2 & 255;

      const r = Math.round(r1 + (r2 - r1) * amount);

      const g = Math.round(g1 + (g2 - g1) * amount);

      const b = Math.round(b1 + (b2 - b1) * amount);

      return (r << 16) | (g << 8) | b;
    };

    const steps = 40;

    for (let i = 0; i < steps; i++) {
      const start = (activePercentage / steps) * i;

      const end = (activePercentage / steps) * (i + 1);

      if (end <= start) {
        continue;
      }

      const position = i / Math.max(steps - 1, 1);

      const scaled = position * (gradientColors.length - 1);

      const index = Math.min(gradientColors.length - 2, Math.floor(scaled));

      const localAmount = scaled - index;

      const color = interpolateColor(
        gradientColors[index],
        gradientColors[index + 1],
        localAmount,
      );

      const range = xAxis.createAxisRange(
        xAxis.makeDataItem({
          value: start,
          endValue: end,
        }),
      );

      range.get("axisFill")?.setAll({
        visible: true,
        fill: am5.color(color),
        fillOpacity: 1,
      });
    }

    chart.children.push(
      am5.Label.new(root, {
        x: am5.percent(50),
        y: am5.percent(54),
        centerX: am5.percent(50),
        centerY: am5.percent(50),
        text: `${activePercentage}%`,
        fontSize: 36,
        fontWeight: "800",
        fill: am5.color(0x16a34a),
      }),
    );

    chart.children.push(
      am5.Label.new(root, {
        x: am5.percent(50),
        y: am5.percent(68),
        centerX: am5.percent(50),
        centerY: am5.percent(50),
        text: "Active Rate",
        fontSize: 13,
        fontWeight: "600",
        fill: am5.color(0x64748b),
      }),
    );

    chart.children.push(
      am5.Label.new(root, {
        x: am5.percent(16),
        y: am5.percent(78),
        text: "0%",
        fontSize: 11,
        fontWeight: "600",
        fill: am5.color(0x94a3b8),
      }),
    );

    chart.children.push(
      am5.Label.new(root, {
        x: am5.percent(50),
        y: am5.percent(82),
        centerX: am5.percent(50),
        text: "50%",
        fontSize: 11,
        fontWeight: "600",
        fill: am5.color(0x94a3b8),
      }),
    );

    chart.children.push(
      am5.Label.new(root, {
        x: am5.percent(84),
        y: am5.percent(78),
        centerX: am5.percent(100),
        text: "100%",
        fontSize: 11,
        fontWeight: "600",
        fill: am5.color(0x94a3b8),
      }),
    );
    chart.appear(700, 100);
    return () => root.dispose();
  }, [activePercentage, views.amGauge]);

  const renderTable = (type: "type" | "status" | "stacked" | "rate") => {
    if (type === "status")
      return (
        <DepartmentTable<StatusData>
          rows={statusData}
          columns={statusColumns}
          onCountClick={handleStatusCountClick}
        />
      );
    if (type === "stacked")
      return (
        <DepartmentTable<StackedData>
          rows={stackedData}
          columns={stackedColumns}
          onActiveClick={handleStackedActiveClick}
          onInactiveClick={handleStackedInactiveClick}
        />
      );
    if (type === "rate")
      return (
        <DepartmentTable<ActiveRateData>
          rows={activeRateData}
          columns={activeRateColumns}
          onPercentageClick={handleActiveRateClick}
        />
      );
    return (
      <DepartmentTable<TypeData>
        rows={typeData}
        columns={typeColumns}
        onCountClick={handleDepartmentCountClick}
      />
    );
  };

  const charts = [
    {
      key: "amBar" as ViewKey,
      title: "Department Type",
      size: { xs: 12, lg: 7 },
      graph: <Box ref={amBarRef} sx={chartBoxSx} />,
      table: renderTable("type"),
    },
    {
      key: "amDonut" as ViewKey,
      title: "Department Status",
      size: { xs: 12, lg: 5 },
      graph: <Box ref={amDonutRef} sx={chartBoxSx} />,
      table: renderTable("status"),
    },
    {
      key: "amGauge" as ViewKey,
      title: "Active Rate",
      size: { xs: 12 },
      graph: (
        <Box
          ref={amGaugeRef}
          sx={{ width: "100%", height: 300, overflow: "visible" }}
        />
      ),
      table: renderTable("rate"),
    },
    {
      key: "reBar" as ViewKey,
      title: "Department Type",
      size: { xs: 12, lg: 7 },
      graph: <RechartsType data={typeData} />,
      table: renderTable("type"),
    },
    {
      key: "reDonut" as ViewKey,
      title: "Department Status",
      size: { xs: 12, lg: 5 },
      graph: <RechartsStatus data={statusData} />,
      table: renderTable("status"),
    },
    {
      key: "reStacked" as ViewKey,
      title: "Active vs Inactive",
      size: { xs: 12 },
      graph: <RechartsStacked data={stackedData} />,
      table: renderTable("stacked"),
    },
    {
      key: "reGauge" as ViewKey,
      title: "Active Rate",
      size: { xs: 12 },
      graph: <RechartsGauge percentage={activePercentage} />,
      table: renderTable("rate"),
    },
    {
      key: "apexArea" as ViewKey,
      title: "Department Area",
      size: { xs: 12, lg: 7 },
      graph: (
        <Chart
          options={apexAreaOptions}
          series={[{ name: "Departments", data: typeData.map((x) => x.count) }]}
          type="area"
          height={310}
          width="100%"
        />
      ),
      table: renderTable("type"),
    },
    {
      key: "apexDonut" as ViewKey,
      title: "Status Donut",
      size: { xs: 12, lg: 5 },
      graph: (
        <Chart
          options={apexDonutOptions}
          series={statusData.map((x) => x.count)}
          type="donut"
          height={310}
          width="100%"
        />
      ),
      table: renderTable("status"),
    },
    {
      key: "apexBar" as ViewKey,
      title: "Horizontal Bar",
      size: { xs: 12, lg: 7 },
      graph: (
        <Chart
          options={apexBarOptions}
          series={[{ name: "Departments", data: typeData.map((x) => x.count) }]}
          type="bar"
          height={310}
          width="100%"
        />
      ),
      table: renderTable("type"),
    },
    {
      key: "apexGauge" as ViewKey,
      title: "Speedometer",
      size: { xs: 12, lg: 5 },
      graph: (
        <Box
          sx={{
            width: "100%",
            minWidth: 0,
            display: "flex",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <Chart
            options={apexGaugeOptions}
            series={[activePercentage]}
            type="radialBar"
            height={310}
            width="100%"
          />
        </Box>
      ),
      table: (
        <Box sx={{ width: "100%", minWidth: 0, overflow: "hidden" }}>
          {renderTable("rate")}
        </Box>
      ),
    },
  ];

  const renderCharts = (items: typeof charts, mb: number) => (
    <Grid container spacing={2} sx={{ mb }}>
      {items.map((item) => (
        <Grid key={item.key} size={item.size}>
          <ChartCard
            title={item.title}
            view={views[item.key]}
            setView={setView(item.key)}
            graph={item.graph}
            table={item.table}
          />
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100%",
        backgroundColor: THEME.background,
        p: { xs: 2, md: 3 },
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: { xs: 24, md: 28 },
              fontWeight: 800,
              color: THEME.darkTeal,
            }}
          >
            Department Insights
          </Typography>
          <Typography
            sx={{ fontSize: 14, color: THEME.textSecondary, mt: 0.5 }}
          >
            Insights into departments and their status
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => loadDashboardData(appliedFromDate, appliedToDate)}
          disabled={loading}
          sx={{
            borderColor: THEME.border,
            color: THEME.primary,
            fontWeight: 700,
            "&:hover": {
              borderColor: THEME.primary,
              backgroundColor: THEME.primary,
            },
          }}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Card
          sx={{
            mb: 3,
            borderRadius: 2,
            border: "1px solid #FECACA",
            boxShadow: "none",
          }}
        >
          <CardContent>
            <Typography sx={{ color: THEME.inactive, fontWeight: 600 }}>
              {error}
            </Typography>
          </CardContent>
        </Card>
      )}

      <Card sx={{ ...cardSx, mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "1fr 1fr auto",
              },
              gap: 2,
              alignItems: "end",
            }}
          >
            <DateField
              label="From Date"
              value={fromDate}
              max={toDate}
              onChange={setFromDate}
            />
            <DateField
              label="To Date"
              value={toDate}
              min={fromDate}
              max={getToday()}
              onChange={setToDate}
            />
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                height: 42,
                justifyContent: { xs: "flex-start", md: "flex-end" },
              }}
            >
              <Button
                variant="contained"
                onClick={handleApply}
                sx={{
                  height: 42,
                  minWidth: 100,
                  px: 2.5,
                  backgroundColor: THEME.primary,
                  fontWeight: 700,
                  borderRadius: 1.5,
                  textTransform: "none",
                  "&:hover": { backgroundColor: THEME.primaryDark },
                }}
              >
                Apply
              </Button>
              <Button
                variant="outlined"
                onClick={handleReset}
                sx={{
                  height: 42,
                  minWidth: 100,
                  px: 2.5,
                  borderColor: THEME.border,
                  color: THEME.primary,
                  fontWeight: 700,
                  borderRadius: 1.5,
                  textTransform: "none",
                  "&:hover": {
                    borderColor: THEME.primary,
                    backgroundColor: "#E6F4F2",
                  },
                }}
              >
                Reset
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          ["Total Departments", stats.total, <BusinessIcon />, "total"],
          ["Active", stats.active, <CheckCircleIcon />, "active"],
          ["Inactive", stats.inactive, <CancelIcon />, "inactive"],
        ].map(([label, value, icon, type]) => (
          <Grid key={String(type)} size={{ xs: 12, sm: 4 }}>
            <DepartmentStatTile
              label={String(label)}
              value={Number(value)}
              icon={icon as React.ReactNode}
              type={type as "total" | "active" | "inactive"}
              selected={false}
              onClick={() => {}}
            />
          </Grid>
        ))}
      </Grid>

      {renderCharts(charts.slice(0, 3), 4)}
      {renderCharts(charts.slice(3, 7), 4)}
      {renderCharts(charts.slice(7), 4)}

      <Dialog
        open={departmentDialogOpen}
        onClose={(_, reason) => {
          if (reason === "backdropClick" || reason === "escapeKeyDown") return;
          closeDepartmentDialog();
        }}
        maxWidth="xl"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: 2, overflow: "hidden", maxHeight: "90vh" },
          },
        }}
      >
        <DialogTitle
          sx={{
            p: 1.5,
            backgroundColor: THEME.primary,
            color: "#FFFFFF",
            fontSize: 16,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {selectedDepartmentType || "Department"}
          <IconButton
            onClick={closeDepartmentDialog}
            disabled={departmentDialogLoading}
            sx={{ color: "#FFFFFF" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 1, backgroundColor: "#FFFFFF" }}>
          {departmentDialogLoading && departmentDetails.length === 0 ? (
            <Box
              sx={{
                height: 420,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress sx={{ color: THEME.primary }} />
            </Box>
          ) : departmentDialogError ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography sx={{ color: THEME.inactive, fontWeight: 700 }}>
                {departmentDialogError}
              </Typography>
            </Box>
          ) : (
            <DepartmentTable<DepartmentDetailRow>
              rows={departmentDetails}
              columns={departmentDetailColumns}
              totalElements={departmentDialogTotalElements}
              pagination={departmentDialogPagination}
              setPagination={setDepartmentDialogPagination}
              sorting={departmentDialogSorting}
              setSorting={setDepartmentDialogSorting}
              isLoading={departmentDialogLoading}
              enablePagination
              manualPagination
              manualSorting
              maxHeight="52vh"
            />
          )}
        </DialogContent>
      </Dialog>

      {loading && (
        <Box
          sx={{
            position: "fixed",
            right: 24,
            bottom: 24,
            zIndex: 1000,
            width: 42,
            height: 42,
            borderRadius: "50%",
            backgroundColor: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 18px rgba(0,0,0,0.15)",
          }}
        >
          <CircularProgress size={24} sx={{ color: THEME.primary }} />
        </Box>
      )}
    </Box>
  );
}

const formatDateForFilter = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const getToday = () => formatDateForFilter(new Date());
const getOneWeekAgo = () => {
  const date = new Date();
  date.setDate(date.getDate() - 6);
  return formatDateForFilter(date);
};

export default Dashboard;
