export type UserRole =
  | "ADMIN"
  | "MANAGEMENT"
  | "HOD"
  | "USER";

const VALID_ROLES: UserRole[] = [
  "ADMIN",
  "MANAGEMENT",
  "HOD",
  "USER",
];

export const getCurrentUserRole = (): UserRole | null => {
  const storedRole =
    sessionStorage.getItem("role") ||
    localStorage.getItem("role");

  if (storedRole) {
    const role = storedRole.toUpperCase();

    if (VALID_ROLES.includes(role as UserRole)) {
      return role as UserRole;
    }
  }

  const token = sessionStorage.getItem("token");

  if (!token) {
    return null;
  }

  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return null;
    }

    const normalizedPayload = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const decodedPayload = JSON.parse(
      atob(normalizedPayload)
    );

    const role = String(
      decodedPayload?.role ?? ""
    ).toUpperCase();

    if (VALID_ROLES.includes(role as UserRole)) {
      return role as UserRole;
    }

    return null;
  } catch (error) {
    return null;
  }
};

export const isAdmin = (): boolean => {
  return getCurrentUserRole() === "ADMIN";
};

export const canViewDashboard = (): boolean => {
  return [
    "ADMIN",
    "HOD",
    "USER",
  ].includes(getCurrentUserRole() || "");
};

export const canViewDepartment = (): boolean => {
  return [
    "ADMIN",
    "MANAGEMENT",
    "HOD",
    "USER",
  ].includes(getCurrentUserRole() || "");
};

export const canAddDepartment = (): boolean => {
  return [
    "ADMIN",
    "MANAGEMENT",
    "HOD",
    "USER",
  ].includes(getCurrentUserRole() || "");
};

export const canUpdateDepartment = (): boolean => {
  return [
    "ADMIN",
    "HOD",
  ].includes(getCurrentUserRole() || "");
};

export const canDeleteDepartment = (): boolean => {
  return isAdmin();
};

export const canImportExport = (): boolean => {
  return isAdmin();
};

export const canManageUsers = (): boolean => {
  return isAdmin();
};