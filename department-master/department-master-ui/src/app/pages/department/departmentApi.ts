import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8085/department";

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  config.headers = config.headers ?? {};
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const GATEWAY_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/department\/?$/, "") || "http://localhost:8085";

const gatewayApi = axios.create({ baseURL: GATEWAY_BASE_URL });

gatewayApi.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  config.headers = config.headers ?? {};
  if (token) config.headers.Authorization = `Bearer ${token}`;
  else delete config.headers.Authorization;
  return config;
});

export interface DepartmentDropdownResponseDto {
  id: number;
  name: string;
}

export interface DepartmentDropdownResponse {
  departmentTypes: DepartmentDropdownResponseDto[];
  branches: DepartmentDropdownResponseDto[];
  businessUnits: DepartmentDropdownResponseDto[];
  workingShifts: DepartmentDropdownResponseDto[];
}

export interface DepartmentPayload {
  id?: number;
  departmentName: string;
  shortName: string;
  departmentType: string;
  parentDepartment: number | null;
  departmentHead: number | null;
  branches: number[];
  businessUnit: number | null;
  costCenter: string;
  departmentEmail: string;
  departmentPhone: string | null;
  workingDays: string[];
  workingShift: number | null;
  description: string;
  departmentLogo: string | null;
  documentPath: string | null;
  tags: string[];
  keywords: string;
  remarks: string;
  status?: boolean;
}

export interface DepartmentSavePayload {
  id?: number;
  departmentName: string;
  shortName?: string;
  departmentType: string;
  parentDepartment?: number | null;
  departmentHead?: number | null;
  branches: number[];
  businessUnit?: number | null;
  costCenter?: string;
  departmentEmail?: string;
  departmentPhone?: string | null;
  workingDays?: string[];
  workingShift?: number | null;
  description?: string;
  departmentLogo?: string | null;
  documentPath?: string | null;
  tags?: string[];
  keywords?: string;
  remarks?: string;
  status?: boolean;
}

export interface DepartmentSearchRequest {
  globalSearch?: string | null;
  departmentType?: string | null;
  branches: number[] | null;
  businessUnit?: number | null;
  status?: boolean | null;
  statusFilterApplied?: boolean;
  fromDate?: string | null;
  toDate?: string | null;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: string;
}

export interface DepartmentImportRow {
  rowNumber: number;
  departmentCode?: string;
  departmentName?: string;
  departmentHead?: string;
  departmentType?: string;
  branch?: string;
  businessUnit?: string;
  workingDays?: string;
  departmentEmail?: string;
  status?: string;
  createdBy?: string;
  createdOn?: string;
  updatedBy?: string;
  updatedOn?: string;
  type: "CORRECT" | "INCORRECT" | "DUPLICATE";
  reason: string;
}

export interface DepartmentImportResponse {
  totalRows: number;
  correctCount: number;
  incorrectCount: number;
  duplicateCount: number;
  invalidCount?: number;
  correct: DepartmentImportRow[];
  incorrect: DepartmentImportRow[];
  duplicate: DepartmentImportRow[];
  saveData?: DepartmentSavePayload[];
  importFilePath?: string;
  importFileName?: string;
}

export interface DepartmentHistoryChange {
  old: unknown;
  new: unknown;
}

export interface DepartmentHistory {
  id: number;
  departmentId: number;
  departmentCode: string;
  action: "CREATED" | "UPDATED" | "INACTIVATED";
  performedBy: string;
  performedAt: string;
  changes: Record<string, DepartmentHistoryChange>;
}

export interface Employee {
  id: number;
  name: string;
  status: boolean;
}

export interface TableHeader {
  field: string;
  header: string;
  visible: boolean;
  sortable: boolean;
  filterable: boolean;
  order: number;
}

export interface ExcelHeader {
  field: string;
  header: string;
  type: "Mandatory" | "Optional";
}

export interface DashboardFilterRequest {
  fromDate: string;
  toDate: string;
  search?: string;
}

export interface UserLookupResponse {
  id: number;
  username: string;
}

export type EmailAttachment = {
  id: number;
  uuid: string;
  fileName: string;
  attachmentType: "LOGO" | "DOCUMENT";
};

export type EmailNotification = {
  id: number;
  departmentId: number | null;
  subject: string;
  recipient: string;
  body: string;
  status: string;
  createdAt: string;
  attachmentPath: string | null;
  attachmentFileName: string | null;
  totalRecords: number | null;
  savedRecords: number | null;
  duplicateRecords: number | null;
  invalidRecords: number | null;
  read: boolean;
};

export const getDepartmentDropdownData = async (): Promise<DepartmentDropdownResponse> => {
  const response = await gatewayApi.get("/master/dropdown-data");
  return {
    departmentTypes: Array.isArray(response.data?.departmentTypes) ? response.data.departmentTypes : [],
    branches: Array.isArray(response.data?.branches) ? response.data.branches : [],
    businessUnits: Array.isArray(response.data?.businessUnits) ? response.data.businessUnits : [],
    workingShifts: Array.isArray(response.data?.workingShifts) ? response.data.workingShifts : [],
  };
};

export const searchDepartments = async (payload: DepartmentSearchRequest) => {
  return await api.post("/fetch-departments", payload);
};

export const searchEmployees = async (searchText = "") => {
  const response = await gatewayApi.get("/employee/search", {
    params: {
      search: searchText.trim() || undefined,
    },
  });

  return response.data;
};

export const createEmployee = async (name: string) => {
  const response = await gatewayApi.post("/employee/save", null, {
    params: {
      name: name.trim(),
    },
  });

  return response.data;
};

export const getDepartmentById = async (id: number) => {
  const response = await api.get(`/${id}`);
  return response.data;
};

export const getDepartments = async (status: boolean, page: number, size: number, sortBy: string, sortDirection: string) => {
  const response = await api.get("/list", { params: { status, page, size, sortBy, direction: sortDirection } });
  return response.data;
};

export const createDepartment = async (data: DepartmentSavePayload[]) => {
  const payload = data.map((item) => ({ ...item, status: item.status ?? false }));
  const response = await api.post("/save", payload, { timeout: 30000 });
  return response.data;
};

export const updateDepartment = async (id: string | number, data: DepartmentPayload) => {
  const payload: DepartmentPayload = { ...data, id: Number(id), status: data.status ?? false };
  const response = await api.post("/save", [payload]);
  return response.data;
};

export const deleteDepartment = async (id: number) => {
  const response = await api.delete(`/delete/${id}`);
  return response.data;
};

export const getDepartmentCount = async (fromDate?: string | null, toDate?: string | null) => {
  const response = await api.get("/count", { params: { fromDate, toDate } });
  return response.data;
};

export interface DepartmentAttachmentUpload {
  departmentId: number;
  file: File;
  attachmentType: "LOGO" | "DOCUMENT";
}

export const uploadDepartmentAttachment = async (
  attachments: DepartmentAttachmentUpload[],
) => {
  const formData = new FormData();

  attachments.forEach((attachment) => {
    formData.append(
      "departmentIds",
      String(attachment.departmentId),
    );

    formData.append(
      "files",
      attachment.file,
    );

    formData.append(
      "attachmentTypes",
      attachment.attachmentType,
    );
  });

  const response = await api.post(
    "/upload",
    formData,
  );

  return response.data;
};

export const downloadDepartmentAttachment = async (uuid: string, fileName: string) => {
  const response = await api.get(`/download/${uuid}`, { responseType: "blob" });
  const blob = new Blob([response.data]);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const deleteDepartmentAttachment = async (uuid: string): Promise<void> => {
  await api.delete(`/attachments/${uuid}`);
};

export const importDepartments = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/excel/import", formData);
  return response.data;
};

export const exportDepartments = async (
  fromDate: string,
  toDate: string,
  filters: {
    search?: string;
    departmentType?: string;
    branches?: number[] | null;
    businessUnit?: number | null;
    status?: boolean | null;
  }
) => {
  const response = await api.get("/excel/export", {
    params: {
      fromDate,
      toDate,
      search: filters?.search || null,
      departmentType: filters?.departmentType || null,
      branches: filters?.branches && filters.branches.length > 0 ? filters.branches : null,
      businessUnit: filters?.businessUnit ?? null,
      status: filters?.status ?? null,
    },
    paramsSerializer: { indexes: false },
    responseType: "blob",
  });
  return response.data;
};

export const exportDepartmentsByEmail = async (
  fromDate: string,
  toDate: string,
  filters?: {
    search?: string;
    departmentType?: string;
    branches?: number[] | null;
    businessUnit?: number | null;
    status?: boolean | null;
  }
) => {
  const response = await api.get("/excel/export/email", {
    params: {
      fromDate,
      toDate,
      search: filters?.search || null,
      departmentType: filters?.departmentType || null,
      branches: filters?.branches && filters.branches.length > 0 ? filters.branches : null,
      businessUnit: filters?.businessUnit ?? null,
      status: filters?.status ?? null,
    },
    paramsSerializer: { indexes: false },
  });
  return response.data;
};

export const getDepartmentTableHeaders = async (): Promise<TableHeader[]> => {
  const response = await api.get<TableHeader[]>("/headers/table");
  return response.data;
};

export const getDepartmentExcelHeaders = async (): Promise<ExcelHeader[]> => {
  const response = await api.get<ExcelHeader[]>("/headers/excel");
  return response.data;
};

export const getEmailNotifications = async (): Promise<EmailNotification[]> => {
  const response = await api.get("/email-notifications");
  return response.data;
};

export const createImportEmailNotification = async (
  filePath: string,
  fileName: string,
  totalRecords: number,
  savedRecords: number,
  duplicateRecords: number,
  invalidRecords: number,
) => {
  const response = await api.post("/email-notifications/import", null, {
    params: { filePath, fileName, totalRecords, savedRecords, duplicateRecords, invalidRecords },
  });
  return response.data;
};

export const downloadEmailAttachment = async (notificationId: number) => {
  const response = await api.get(`/email-notifications/download/${notificationId}`, { responseType: "blob" });
  const blob = new Blob([response.data]);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "department-import.xlsx";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const markEmailNotificationAsRead = async (id: number): Promise<EmailNotification> => {
  const response = await api.put<EmailNotification>(`/email-notifications/${id}/read`);
  return response.data;
};


export const getDashboardStatistics = async (params?: { fromDate?: string; toDate?: string; search?: string }) => {
  const response = await api.get("/dashboard-statistics", { params });
  return response.data;
};

export const getAllUsers = async (): Promise<UserLookupResponse[]> => {
  const response = await gatewayApi.get<UserLookupResponse[]>("/users/lookup");
  return Array.isArray(response.data) ? response.data : [];
};

export const createDepartmentEmailNotification = async (
  departmentIds: number | number[],
  action: "ADD" | "UPDATE",
) => {
  const ids = Array.isArray(departmentIds) ? departmentIds : [departmentIds];
  const response = await api.post("/email-notifications/department", null, {
    params: { departmentIds: ids, action },
  });
  return response.data;
};

export const downloadDepartmentTemplate = async (): Promise<Blob> => {
  const response = await api.get("/excel/template", { responseType: "blob" });
  return response.data;
};

export const getDepartmentHistory = async (departmentId: number): Promise<DepartmentHistory[]> => {
  const response = await api.get<DepartmentHistory[]>(`/history/${departmentId}`);
  return response.data;
};