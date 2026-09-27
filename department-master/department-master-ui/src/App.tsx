import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

import Login from "./app/pages/login";
import Dashboard from "./app/pages/dashboard";

import MainLayout from "./app/layout/main-layout";

import AddDepartment from "./app/pages/department/add-department";
import DepartmentList from "./app/pages/department/department-activity-board";

import { type UserRole, getCurrentUserRole } from "./utils/rolePermissions";

/* =========================================================
   BASIC LOGIN PROTECTION
========================================================= */

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/* =========================================================
   ROLE BASED ROUTE PROTECTION
========================================================= */

function RoleProtectedRoute({
  allowedRoles,
  children,
}: {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}) {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  const currentUserRole = getCurrentUserRole();

  if (!currentUserRole) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(currentUserRole)) {
    /*
     * Unauthorized user:
     * ADMIN -> dashboard
     * Other roles -> department
     */
    if (currentUserRole === "ADMIN") {
      return <Navigate to="/dashboard" replace />;
    }

    return <Navigate to="/department" replace />;
  }

  return children;
}

/* =========================================================
   APP
========================================================= */

function App() {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/dashboard"
          element={
            <RoleProtectedRoute allowedRoles={["ADMIN", "HOD", "USER"]}>
              <Dashboard />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/department"
          element={
            <RoleProtectedRoute
              allowedRoles={["ADMIN", "MANAGEMENT", "HOD", "USER"]}
            >
              <DepartmentList />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/department/create"
          element={
            <RoleProtectedRoute
              allowedRoles={["ADMIN", "MANAGEMENT", "HOD", "USER"]}
            >
              <AddDepartment onClose={() => navigate("/department")} />
            </RoleProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
