import {
  Box,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";

import { useLocation, useNavigate } from "react-router-dom";

import {
  canViewDashboard,
  canViewDepartment,
  getCurrentUserRole,
} from "../../utils/rolePermissions";

interface SidebarProps {
  open: boolean;
  mobile: boolean;
  onToggle: () => void;
}

function Sidebar({ open, mobile, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const currentUserRole = getCurrentUserRole();
  const showDashboard = canViewDashboard();
  const showDepartment = canViewDepartment();

  const menu = [
    ...(showDashboard
      ? [
          {
            name: "Dashboard",
            path: "/dashboard",
            icon: <DashboardIcon />,
          },
        ]
      : []),

    ...(showDepartment
      ? [
          {
            name: "Department",
            path: "/department",
            icon: <AddBusinessIcon />,
          },
        ]
      : []),
  ];

  const logout = () => {
    localStorage.removeItem("isLoggedIn");

    localStorage.removeItem("token");
    localStorage.removeItem("role");

    sessionStorage.removeItem("basicAuth");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <Box
      sx={{
        width: mobile ? 0 : open ? 230 : 70,
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          width: mobile ? 230 : open ? 230 : 70,
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          pt: 8,
          backgroundColor: "#163B3A",
          borderRight: "1px solid #285654",
          transform: mobile && !open ? "translateX(-100%)" : "translateX(0)",
          transition: "width 0.3s ease, transform 0.3s ease",
          overflow: "hidden",
          zIndex: 1000,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: open ? "flex-end" : "center",
            px: open ? 1.5 : 0,
            pb: 1,
          }}
        >
          <IconButton
            onClick={onToggle}
            size="small"
            sx={{
              width: 32,
              height: 32,
              backgroundColor: "#20504D",
              color: "#D5E5E0",
              "&:hover": {
                backgroundColor: "#28635F",
              },
            }}
          >
            <MenuIcon
              sx={{
                fontSize: 18,
                color: "#D5E5E0",
              }}
            />
          </IconButton>
        </Box>

        <List
          sx={{
            px: 1,
          }}
        >
          {menu.map((item) => {
            const selected = location.pathname === item.path;

            return (
              <ListItemButton
                key={item.path}
                selected={selected}
                onClick={() => navigate(item.path)}
                sx={{
                  minHeight: 48,
                  mb: 1,
                  borderRadius: 2,
                  justifyContent: open ? "flex-start" : "center",

                  color: selected ? "#FFFFFF" : "#C7D9D7",

                  "&.Mui-selected": {
                    backgroundColor: "#0F766E",
                    color: "#FFFFFF",

                    boxShadow: "0 4px 12px rgba(15,118,110,0.25)",

                    "&:hover": {
                      backgroundColor: "#115E59",
                    },
                  },

                  "&:hover": {
                    backgroundColor: "#20504D",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: open ? 40 : "auto",
                    justifyContent: "center",
                    color: selected ? "#FFFFFF" : "#8CC8C2",
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                {open && (
                  <ListItemText
                    primary={
                      <Typography
                        sx={{
                          fontSize: 14,
                          fontWeight: selected ? 600 : 500,
                          color: selected ? "#FFFFFF" : "#C7D9D7",
                        }}
                      >
                        {item.name}
                      </Typography>
                    }
                  />
                )}
              </ListItemButton>
            );
          })}

          <ListItemButton
            onClick={logout}
            sx={{
              minHeight: 48,
              mb: 1,
              borderRadius: 2,
              justifyContent: open ? "flex-start" : "center",
              color: "#C7D9D7",

              "&:hover": {
                backgroundColor: "#20504D",
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: open ? 40 : "auto",
                justifyContent: "center",
                color: "#FCA5A5",
              }}
            >
              <LogoutIcon />
            </ListItemIcon>

            {open && (
              <ListItemText
                primary={
                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#C7D9D7",
                    }}
                  >
                    Logout
                  </Typography>
                }
              />
            )}
          </ListItemButton>
        </List>

        {open && currentUserRole && (
          <Box
            sx={{
              position: "absolute",
              bottom: 20,
              left: 12,
              right: 12,
              px: 1.5,
              py: 1,
              borderRadius: 2,
              backgroundColor: "#20504D",
              border: "1px solid #28635F",
            }}
          >
            <Typography
              sx={{
                fontSize: 11,
                color: "#8CC8C2",
                textTransform: "uppercase",
                mb: 0.25,
              }}
            >
              Logged in as
            </Typography>

            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 700,
                color: "#FFFFFF",
              }}
            >
              {currentUserRole}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Sidebar;
