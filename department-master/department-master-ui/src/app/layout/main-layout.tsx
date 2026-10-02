import { useEffect, useState } from "react";
import { Box, IconButton, Typography, useMediaQuery } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Navigate, Outlet } from "react-router-dom";
import Navbar from "./navbar";
import Sidebar from "./sidebar";

function Layout() {
  const isMobile = useMediaQuery("(max-width:599px)");
  const [open, setOpen] = useState(() => window.innerWidth >= 600);
  useEffect(() => {
    if (isMobile) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [isMobile]);
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
        backgroundColor: "#F1F8F6",
      }}
    >
      <Navbar />
      <Sidebar
        open={open}
        mobile={isMobile}
        onToggle={() => setOpen((prev) => !prev)}
      />
      <Box
        component="main"
        sx={{
          ml: isMobile ? 0 : open ? "230px" : "70px",
          width: isMobile ? "100%" : `calc(100% - ${open ? "230px" : "70px"})`,
          maxWidth: isMobile
            ? "100%"
            : `calc(100% - ${open ? "230px" : "70px"})`,
          minWidth: 0,
          pt: {
            xs: "78px",
            sm: "88px",
          },
          pb: {
            xs: "70px",
            sm: "80px",
          },
          px: {
            xs: 1,
            sm: 2,
            md: 3,
          },
          boxSizing: "border-box",
          transition: "margin-left 0.3s ease, width 0.3s ease",
          backgroundColor: "#F1F8F6",
          overflowX: "hidden",
        }}
      >
        {isMobile && !open && (
          <IconButton
            onClick={() => setOpen(true)}
            sx={{
              position: "fixed",
              top: 72,
              left: 10,
              zIndex: 1250,
              width: 42,
              height: 42,
              backgroundColor: "#163B3A",
              color: "#FFFFFF",
              boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
              "&:hover": {
                backgroundColor: "#20504D",
              },
            }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Box
          sx={{
            width: "100%",
            minWidth: 0,
            maxWidth: "100%",
            boxSizing: "border-box",
          }}
        >
          <Outlet />
        </Box>
      </Box>
      <Box
        component="footer"
        sx={{
          position: "fixed",
          bottom: 0,
          left: isMobile ? 0 : open ? "230px" : "70px",
          right: 0,
          width: isMobile ? "100%" : `calc(100% - ${open ? "230px" : "70px"})`,
          height: {
            xs: "56px",
            sm: "56px",
          },
          backgroundColor: "#FFFFFF",
          borderTop: "1px solid #D5E5E0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
          boxSizing: "border-box",
          zIndex: 1100,
          transition: "left 0.3s ease, width 0.3s ease",
          boxShadow: "0 -2px 10px rgba(15, 118, 110, 0.06)",
        }}
      >
        <Typography
          sx={{
            fontSize: {
              xs: 12,
              sm: 13,
            },
            color: "#64748B",
            fontWeight: 500,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          © 2026 Department Management System
        </Typography>
      </Box>
    </Box>
  );
}

export default Layout;
