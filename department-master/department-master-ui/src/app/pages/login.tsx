import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import { isAxiosError } from "axios";
import axiosInstance from "../../api/axiosInstance";

import type { UserRole } from "../../utils/rolePermissions";

const COLORS = {
  primary: "#0F766E",
  dark: "#173F3B",
  background: "#F4F8F7",
  white: "#FFFFFF",
  border: "#D7E7E4",
  text: "#173F3B",
  secondaryText: "#64748B",
};

const getRoleFromToken = (token: string): UserRole | null => {
  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return null;
    }

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");

    const decodedPayload = JSON.parse(atob(normalizedPayload));

    const role = String(decodedPayload?.role ?? "").toUpperCase();

    if (
      role === "ADMIN" ||
      role === "MANAGEMENT" ||
      role === "HOD" ||
      role === "USER"
    ) {
      return role as UserRole;
    }

    return null;
  } catch (error) {
    return null;
  }
};

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Username and password are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.post("/api/auth/login", {
        username: username.trim(),
        password,
      });

      const token = response.data?.token;

      if (!token) {
        setError("Login failed. Token not received.");
        return;
      }

      sessionStorage.setItem("token", token);

      localStorage.setItem("isLoggedIn", "true");

      const role = getRoleFromToken(token);

      if (!role) {
        sessionStorage.removeItem("token");
        localStorage.removeItem("isLoggedIn");

        setError("Login failed. Invalid user role.");

        return;
      }
      sessionStorage.setItem("role", role);
      if (role === "ADMIN") {
        navigate("/dashboard", {
          replace: true,
        });
      } else {
        navigate("/department", {
          replace: true,
        });
      }
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response?.status === 401) {
          setError("Invalid username or password");
        } else if (error.response?.status === 400) {
          setError(
            error.response?.data?.message ||
              "Username and password are required",
          );
        } else {
          setError("Unable to connect to authentication server");
        }
      } else {
        setError("Unable to connect to authentication server");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: `linear-gradient(135deg, ${COLORS.dark} 0%, ${COLORS.primary} 100%)`,
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 420,
          p: {
            xs: 3,
            sm: 4,
          },
          borderRadius: 3,
          backgroundColor: COLORS.white,
          border: `1px solid ${COLORS.border}`,
          boxShadow: "0 20px 50px rgba(23,63,59,0.20)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 2,
          }}
        >
          <Box
            sx={{
              width: 58,
              height: 58,
              borderRadius: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: COLORS.primary,
              color: COLORS.white,
              fontSize: 28,
              boxShadow: "0 8px 20px rgba(15,118,110,0.25)",
            }}
          >
            🏢
          </Box>
        </Box>

        <Typography
          variant="h5"
          sx={{
            textAlign: "center",
            fontWeight: 800,
            color: COLORS.dark,
            lineHeight: 1.2,
          }}
        >
          Department Master
        </Typography>

        <Typography
          sx={{
            textAlign: "center",
            color: COLORS.secondaryText,
            mt: 1,
            mb: 3,
            fontSize: 14,
          }}
        >
          Welcome back! Please login.
        </Typography>

        <TextField
          fullWidth
          label="Username"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setError("");
          }}
          margin="normal"
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              "&:hover fieldset": {
                borderColor: COLORS.primary,
              },
              "&.Mui-focused fieldset": {
                borderColor: COLORS.primary,
              },
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: COLORS.primary,
            },
          }}
        />

        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleLogin();
            }
          }}
          margin="normal"
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              "&:hover fieldset": {
                borderColor: COLORS.primary,
              },
              "&.Mui-focused fieldset": {
                borderColor: COLORS.primary,
              },
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: COLORS.primary,
            },
          }}
        />

        {error && (
          <Typography
            sx={{
              mt: 1.5,
              fontSize: 13,
              color: "#DC2626",
              textAlign: "center",
            }}
          >
            {error}
          </Typography>
        )}

        <Button
          fullWidth
          variant="contained"
          onClick={handleLogin}
          disabled={loading}
          sx={{
            mt: 3,
            py: 1.35,
            borderRadius: 2,
            textTransform: "none",
            fontSize: 15,
            fontWeight: 700,
            backgroundColor: COLORS.primary,
            color: COLORS.white,
            boxShadow: "0 6px 16px rgba(15,118,110,0.25)",
            "&:hover": {
              backgroundColor: COLORS.dark,
              boxShadow: "0 8px 20px rgba(23,63,59,0.25)",
            },
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>

        <Box
          sx={{
            mt: 2.5,
            p: 1.5,
            borderRadius: 2,
            backgroundColor: COLORS.background,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <Typography
            sx={{
              textAlign: "center",
              fontSize: 12,
              color: COLORS.secondaryText,
              mb: 0.5,
            }}
          >
            Demo Credentials
          </Typography>

          <Typography
            sx={{
              textAlign: "center",
              fontSize: 13,
              fontWeight: 600,
              color: COLORS.dark,
            }}
          >
            admin / admin123
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default Login;
