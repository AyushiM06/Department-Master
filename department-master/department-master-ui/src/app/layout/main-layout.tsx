import { useState } from "react";

import { Box, Typography } from "@mui/material";

import { Navigate, Outlet } from "react-router-dom";

import Navbar from "./navbar";
import Sidebar from "./sidebar";

function Layout() {
  const [open, setOpen] = useState(true);

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#F1F8F6",
      }}
    >
      <Navbar />

      <Sidebar open={open} onToggle={() => setOpen((prev) => !prev)} />

      <Box
        component="main"
        sx={{
          ml: open ? "230px" : "70px",
          pt: "88px",
          pb: "80px",
          px: 3,
          minHeight: "100vh",
          boxSizing: "border-box",
          transition: "margin-left 0.3s ease",
          backgroundColor: "#F1F8F6",
          overflowX: "hidden",
        }}
      >
        <Outlet />
      </Box>

      <Box
        component="footer"
        sx={{
          position: "fixed",
          bottom: 0,
          left: open ? "230px" : "70px",
          right: 0,
          height: "56px",
          backgroundColor: "#FFFFFF",
          borderTop: "1px solid #D5E5E0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1100,
          transition: "left 0.3s ease",
          boxShadow: "0 -2px 10px rgba(15, 118, 110, 0.06)",
        }}
      >
        <Typography
          sx={{
            fontSize: 13,
            color: "#64748B",
            fontWeight: 500,
          }}
        >
          © 2026 Department Management System
        </Typography>
      </Box>
    </Box>
  );
}

export default Layout;
