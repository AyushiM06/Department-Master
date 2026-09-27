import { Box, Typography } from "@mui/material";

import BusinessIcon from "@mui/icons-material/Business";

const THEME = {
  primary: "#0F766E",
  darkTeal: "#173F3B",
  textSecondary: "#647A76",
  border: "#D7E6E3",
};

function ActivityBoardHeader() {
  return (
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
          px: {
            xs: 2,
            sm: 3,
          },
          py: 2.5,

          background: "linear-gradient(135deg, #E6F4F2 0%, #FFFFFF 100%)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              minWidth: 44,

              borderRadius: 2.5,

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              backgroundColor: THEME.primary,
              color: "#FFFFFF",
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
                lineHeight: 1.2,

                fontSize: {
                  xs: 20,
                  sm: 24,
                },
              }}
            >
              Department Management
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                color: THEME.textSecondary,
                fontSize: 14,
              }}
            >
              Manage department details, status and activities
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default ActivityBoardHeader;
