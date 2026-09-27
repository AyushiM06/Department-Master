import {
  AppBar,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  Popover,
  Toolbar,
  Tooltip,
  Typography,
  TablePagination,
} from "@mui/material";

import EmailIcon from "@mui/icons-material/Email";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { useEffect, useState } from "react";
import logo from "../../images/DreamSol@2x.png";

import {
  getEmailNotifications,
  downloadEmailAttachment,
  markEmailNotificationAsRead,
  type EmailNotification,
} from "../pages/department/departmentApi";

function Navbar() {
  const [emailAnchorEl, setEmailAnchorEl] = useState<HTMLElement | null>(null);

  const [emailNotifications, setEmailNotifications] = useState<
    EmailNotification[]
  >([]);

  const [selectedEmail, setSelectedEmail] = useState<EmailNotification | null>(
    null,
  );

  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const [emailPage, setEmailPage] = useState(0);
  const [emailPageSize, setEmailPageSize] = useState(10);

  const emailHistoryOpen = Boolean(emailAnchorEl);

  const loadEmailNotifications = async () => {
    setIsLoadingEmails(true);

    try {
      const data = await getEmailNotifications();

      const emails = Array.isArray(data) ? data : [];

      setEmailNotifications(emails);
      setEmailPage(0);
    } catch (error) {
      console.error("Error fetching email notifications:", error);
      setEmailNotifications([]);
    } finally {
      setIsLoadingEmails(false);
    }
  };

  const handleOpenEmailHistory = (event: React.MouseEvent<HTMLElement>) => {
    setEmailAnchorEl(event.currentTarget);
    setSelectedEmail(null);
    setEmailPage(0);
  };

  const handleCloseEmailHistory = () => {
    setEmailAnchorEl(null);
    setSelectedEmail(null);
  };

  const handleOpenEmail = async (notification: EmailNotification) => {
    try {
      if (!notification.read) {
        await markEmailNotificationAsRead(notification.id);

        setEmailNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id ? { ...item, read: true } : item,
          ),
        );

        setSelectedEmail({
          ...notification,
          read: true,
        });
      } else {
        setSelectedEmail(notification);
      }

      setEmailAnchorEl(null);
    } catch (error) {
      console.error("Failed to mark email as read:", error);
    }
  };

  const handleCloseEmailDetails = () => {
    setSelectedEmail(null);
  };

  const handleDownload = async (notification: EmailNotification) => {
    try {
      await downloadEmailAttachment(notification.id);
    } catch (error) {
      console.error("Error downloading email attachment:", error);
    }
  };

  useEffect(() => {
    loadEmailNotifications();

    const handleNotificationCreated = async () => {
      await loadEmailNotifications();

      setTimeout(() => {
        const emailButton = document.getElementById("navbar-email-button");

        if (emailButton) {
          setEmailAnchorEl(emailButton);
        }
      }, 100);
    };

    window.addEventListener(
      "department-import-notification",
      handleNotificationCreated,
    );

    window.addEventListener(
      "department-export-notification",
      handleNotificationCreated,
    );

    return () => {
      window.removeEventListener(
        "department-import-notification",
        handleNotificationCreated,
      );

      window.removeEventListener(
        "department-export-notification",
        handleNotificationCreated,
      );
    };
  }, []);

  const formatDate = (date: string | null | undefined) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSummaryValue = (
    notification: EmailNotification,
    field:
      | "totalRecords"
      | "savedRecords"
      | "duplicateRecords"
      | "invalidRecords",
  ) => {
    const value = notification[field];

    return typeof value === "number" ? value : 0;
  };

  const isImportNotification = (notification: EmailNotification) => {
    const subject = notification.subject?.toLowerCase() || "";

    return subject.includes("import") || !!notification.attachmentFileName;
  };

  const isUpdateNotification = (notification: EmailNotification) => {
    const subject = notification.subject?.toLowerCase() || "";

    return subject.includes("update");
  };

  const getActionLabel = (notification: EmailNotification) => {
    return isUpdateNotification(notification)
      ? "Updated Records"
      : "Added Records";
  };

  const paginatedEmailNotifications = emailNotifications.slice(
    emailPage * emailPageSize,
    emailPage * emailPageSize + emailPageSize,
  );

  const getNotificationPreview = (notification: EmailNotification) => {
    if (isImportNotification(notification)) {
      const saved = getSummaryValue(notification, "savedRecords");

      const total = getSummaryValue(notification, "totalRecords");

      const duplicate = getSummaryValue(notification, "duplicateRecords");

      const invalid = getSummaryValue(notification, "invalidRecords");

      return `${saved} record(s) saved successfully. Total: ${total} | Duplicate: ${duplicate} | Invalid: ${invalid}`;
    }

    const actionCount = getSummaryValue(notification, "savedRecords");

    const actionLabel = getActionLabel(notification);

    return `${actionCount} ${actionLabel.toLowerCase()}.`;
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "#FFFFFF",
          zIndex: 1201,
          boxShadow: "0 2px 12px rgba(15, 118, 110, 0.08)",
          borderBottom: "1px solid #CCFBF1",
        }}
      >
        <Toolbar
          sx={{
            minHeight: "64px !important",
            px: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <Box
              component="img"
              src={logo}
              alt="Dreamsol Logo"
              sx={{
                height: 48,
                width: "auto",
                display: "block",
              }}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              ml: "auto",
            }}
          >
            <Tooltip title="Notifications">
              <IconButton
                id="navbar-email-button"
                onClick={handleOpenEmailHistory}
                sx={{
                  color: "#0F766E",
                  mr: 1,
                  "&:hover": {
                    backgroundColor: "#F0FDFA",
                  },
                }}
              >
                <EmailIcon />
              </IconButton>
            </Tooltip>

            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: "#CCFBF1",
                color: "#0F766E",
                fontSize: 15,
                fontWeight: 700,
                border: "1px solid #99F6E4",
              }}
            >
              A
            </Avatar>

            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 600,
                color: "#134E4A",
              }}
            >
              Admin
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Popover
        open={emailHistoryOpen}
        anchorEl={emailAnchorEl}
        onClose={(_, reason) => {
          if (reason === "backdropClick" || reason === "escapeKeyDown") {
            return;
          }
          handleCloseEmailHistory();
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        disableScrollLock
        slotProps={{
          paper: {
            sx: {
              width: 390,
              maxWidth: "calc(100vw - 24px)",
              mt: 1,
              borderRadius: 1.5,
              overflow: "hidden",
              boxShadow: "0 12px 35px rgba(15, 23, 42, 0.20)",
              border: "1px solid #E2E8F0",
            },
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.5,
            backgroundColor: "#FFFFFF",
            borderBottom: "1px solid #E2E8F0",
          }}
        >
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 700,
              color: "#1E293B",
            }}
          >
            Notifications
          </Typography>

          <IconButton
            size="small"
            onClick={handleCloseEmailHistory}
            sx={{
              color: "#EF4444",
              "&:hover": {
                backgroundColor: "#FEF2F2",
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box
          sx={{
            height: 430,
            maxHeight: 430,
            overflowY: "scroll",
            overflowX: "hidden",
            backgroundColor: "#FFFFFF",
            scrollbarGutter: "stable",
            "&::-webkit-scrollbar": {
              width: "7px",
              height: "0px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#CBD5E1",
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "#F8FAFC",
            },
          }}
        >
          {isLoadingEmails ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: 7,
              }}
            >
              <CircularProgress
                size={28}
                sx={{
                  color: "#0F766E",
                }}
              />
            </Box>
          ) : emailNotifications.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 7,
                px: 3,
              }}
            >
              <EmailIcon
                sx={{
                  fontSize: 42,
                  color: "#CBD5E1",
                  mb: 1,
                }}
              />

              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#475569",
                }}
              >
                No notifications
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {paginatedEmailNotifications.map((notification, index) => (
                <Box key={notification.id}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => handleOpenEmail(notification)}
                      sx={{
                        px: 2,
                        py: 1.6,
                        alignItems: "flex-start",
                        gap: 1.5,
                        backgroundColor: "#FFFFFF",
                        "&:hover": {
                          backgroundColor: "#F8FAFC",
                        },
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 38,
                          height: 38,
                          mt: 0.2,
                          backgroundColor: "#CCFBF1",
                          color: "#0F766E",
                          flexShrink: 0,
                        }}
                      >
                        <EmailIcon
                          sx={{
                            fontSize: 19,
                          }}
                        />
                      </Avatar>

                      <Box
                        sx={{
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 1,
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: "#334155",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {notification.subject ||
                              "Department Import Completed"}
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: 10,
                              color: "#94A3B8",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {formatDate(notification.createdAt)}
                          </Typography>
                        </Box>

                        <Typography
                          sx={{
                            fontSize: 12,
                            color: "#64748B",
                            mt: 0.45,
                            lineHeight: 1.45,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {getNotificationPreview(notification)}
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            mt: 0.6,
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: 10,
                              color: notification.read ? "#15803D" : "#DC2626",
                              fontWeight: notification.read ? 500 : 700,
                            }}
                          >
                            {notification.read ? "✓ Read" : "● Unread"}
                          </Typography>
                        </Box>
                      </Box>
                    </ListItemButton>
                  </ListItem>

                  {index < paginatedEmailNotifications.length - 1 && (
                    <Divider />
                  )}
                </Box>
              ))}
            </List>
          )}
        </Box>

        {!isLoadingEmails && emailNotifications.length > 0 && (
          <Box
            sx={{
              width: "100%",
              overflow: "hidden",
              borderTop: "1px solid #E8E2F0",
              backgroundColor: "#FFFFFF",
            }}
          >
            <TablePagination
              component="div"
              count={emailNotifications.length}
              page={emailPage}
              onPageChange={(_, newPage) => {
                setEmailPage(newPage);
              }}
              rowsPerPage={emailPageSize}
              onRowsPerPageChange={(event) => {
                setEmailPageSize(Number(event.target.value));
                setEmailPage(0);
              }}
              rowsPerPageOptions={[5, 10, 20, 50]}
              showFirstButton
              showLastButton
              sx={{
                width: "100%",
                overflow: "hidden",
                minHeight: 52,
                color: "#374151",
                "& .MuiTablePagination-toolbar": {
                  minHeight: 52,
                  paddingLeft: "8px",
                  paddingRight: "8px",
                  gap: 0,
                  overflow: "hidden",
                  flexWrap: "nowrap",
                },
                "& .MuiTablePagination-selectLabel": {
                  color: "#6B7280",
                  fontSize: 11,
                  margin: 0,
                },
                "& .MuiTablePagination-select": {
                  fontSize: 11,
                  borderRadius: 1,
                  paddingLeft: "6px",
                  paddingRight: "22px",
                  marginLeft: "4px",
                  marginRight: "4px",
                },
                "& .MuiTablePagination-input": {
                  minWidth: 45,
                },
                "& .MuiTablePagination-displayedRows": {
                  color: "#6B7280",
                  fontSize: 11,
                  marginLeft: "4px",
                  marginRight: "4px",
                },
                "& .MuiTablePagination-actions": {
                  marginLeft: "4px",
                  display: "flex",
                  alignItems: "center",
                },
                "& .MuiTablePagination-actions button": {
                  color: "#374151",
                  padding: "5px",
                },
              }}
            />
          </Box>
        )}
      </Popover>

      <Dialog
        open={Boolean(selectedEmail)}
        onClose={(_, reason) => {
          if (reason === "backdropClick" || reason === "escapeKeyDown") {
            return;
          }
          handleCloseEmailDetails();
        }}
        maxWidth="md"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 24px 70px rgba(15, 23, 42, 0.18)",
          },
        }}
      >
        {selectedEmail && (
          <>
            <DialogTitle
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                borderBottom: "1px solid #E2E8F0",
                py: 1.5,
              }}
            >
              <IconButton
                onClick={() => {
                  setSelectedEmail(null);
                  setTimeout(() => {
                    const emailButton = document.getElementById(
                      "navbar-email-button",
                    );

                    if (emailButton) {
                      setEmailAnchorEl(emailButton);
                    }
                  }, 100);
                }}
                sx={{
                  color: "#0F766E",
                  "&:hover": {
                    backgroundColor: "#F0FDFA",
                  },
                }}
              >
                <ArrowBackIcon />
              </IconButton>

              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#134E4A",
                  }}
                >
                  Mail Details
                </Typography>

                <Typography
                  sx={{
                    fontSize: 11,
                    color: "#94A3B8",
                    mt: 0.2,
                  }}
                >
                  Department Master Notification
                </Typography>
              </Box>

              <IconButton
                onClick={handleCloseEmailDetails}
                sx={{
                  color: "#64748B",
                  "&:hover": {
                    backgroundColor: "#F1F5F9",
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent
              sx={{
                p: 0,
                backgroundColor: "#F8FAFC",
              }}
            >
              <Box
                sx={{
                  px: {
                    xs: 2,
                    sm: 4,
                  },
                  py: 3,
                }}
              >
                <Box
                  sx={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      px: {
                        xs: 2.5,
                        sm: 3,
                      },
                      py: 2.5,
                      background:
                        "linear-gradient(135deg, #F0FDFA 0%, #FFFFFF 70%)",
                      borderBottom: "1px solid #E2E8F0",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 48,
                            height: 48,
                            backgroundColor: "#0F766E",
                            color: "#FFFFFF",
                            fontWeight: 700,
                          }}
                        >
                          D
                        </Avatar>

                        <Box>
                          <Typography
                            sx={{
                              fontSize: 15,
                              fontWeight: 700,
                              color: "#134E4A",
                            }}
                          >
                            DreamSol System
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: 12,
                              color: "#64748B",
                              mt: 0.3,
                            }}
                          >
                            Department Master
                          </Typography>
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          textAlign: "right",
                        }}
                      >
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            px: 1.2,
                            py: 0.5,
                            borderRadius: 10,
                            backgroundColor: "#ECFDF5",
                          }}
                        >
                          <CheckCircleIcon
                            sx={{
                              fontSize: 14,
                              color: "#15803D",
                              mr: 0.5,
                            }}
                          />

                          <Typography
                            sx={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: "#15803D",
                            }}
                          >
                            {selectedEmail.status || "SENT"}
                          </Typography>
                        </Box>

                        <Typography
                          sx={{
                            fontSize: 11,
                            color: "#64748B",
                            mt: 0.8,
                          }}
                        >
                          {formatDate(selectedEmail.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      px: {
                        xs: 2.5,
                        sm: 3,
                      },
                      py: 2.5,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 23,
                        fontWeight: 700,
                        color: "#0F172A",
                        mb: 1,
                      }}
                    >
                      {selectedEmail.subject || "Department Import Completed"}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: 13,
                        color: "#64748B",
                        mb: 2.5,
                      }}
                    >
                      To:{" "}
                      <Box
                        component="span"
                        sx={{
                          color: "#334155",
                          fontWeight: 600,
                        }}
                      >
                        Admin
                      </Box>
                    </Typography>

                    <Divider
                      sx={{
                        mb: 3,
                      }}
                    />

                    <Box
                      sx={{
                        backgroundColor: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                        borderRadius: 2.5,
                        px: 2.5,
                        py: 2.2,
                        mb: 3,
                      }}
                    >
                      <Typography
                        component="div"
                        sx={{
                          fontSize: 14,
                          lineHeight: 1.8,
                          color: "#334155",
                          whiteSpace: "pre-line",
                        }}
                      >
                        {selectedEmail.body ||
                          "Department Excel import completed successfully."}
                      </Typography>
                    </Box>

                    <Typography
                      sx={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#134E4A",
                        mb: 1.5,
                      }}
                    >
                      Import Summary
                    </Typography>

                    {isImportNotification(selectedEmail) ? (
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: {
                            xs: "1fr 1fr",
                            sm: "repeat(4, 1fr)",
                          },
                          gap: 1.5,
                          mb: 3,
                        }}
                      >
                        {/* Total Records */}
                        <Box
                          sx={{
                            border: "1px solid #E2E8F0",
                            borderRadius: 2,
                            p: 1.8,
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: 11,
                              color: "#64748B",
                              fontWeight: 600,
                            }}
                          >
                            Total Records
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: 23,
                              fontWeight: 700,
                              color: "#0F172A",
                            }}
                          >
                            {getSummaryValue(selectedEmail, "totalRecords")}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            border: "1px solid #BBF7D0",
                            borderRadius: 2,
                            p: 1.8,
                            backgroundColor: "#F0FDF4",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: 11,
                              color: "#166534",
                              fontWeight: 600,
                            }}
                          >
                            Saved Records
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: 23,
                              fontWeight: 700,
                              color: "#166534",
                            }}
                          >
                            {getSummaryValue(selectedEmail, "savedRecords")}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            border: "1px solid #FED7AA",
                            borderRadius: 2,
                            p: 1.8,
                            backgroundColor: "#FFF7ED",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: 11,
                              color: "#9A3412",
                              fontWeight: 600,
                            }}
                          >
                            Duplicate
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: 23,
                              fontWeight: 700,
                              color: "#9A3412",
                            }}
                          >
                            {getSummaryValue(selectedEmail, "duplicateRecords")}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            border: "1px solid #FECACA",
                            borderRadius: 2,
                            p: 1.8,
                            backgroundColor: "#FEF2F2",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: 11,
                              color: "#991B1B",
                              fontWeight: 600,
                            }}
                          >
                            Invalid Records
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: 23,
                              fontWeight: 700,
                              color: "#991B1B",
                            }}
                          >
                            {getSummaryValue(selectedEmail, "invalidRecords")}
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "1fr",
                          gap: 1.5,
                          mb: 3,
                        }}
                      >
                        <Box
                          sx={{
                            border: "1px solid #BBF7D0",
                            borderRadius: 2,
                            p: 1.8,
                            backgroundColor: "#F0FDF4",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: 11,
                              color: "#166534",
                              fontWeight: 600,
                            }}
                          >
                            {getActionLabel(selectedEmail)}
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: 23,
                              fontWeight: 700,
                              color: "#166534",
                            }}
                          >
                            {getSummaryValue(selectedEmail, "savedRecords")}
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    {selectedEmail.attachmentFileName && (
                      <>
                        <Typography
                          sx={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#134E4A",
                            mb: 1.5,
                          }}
                        >
                          Attachment
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 2,
                            border: "1px solid #CCFBF1",
                            borderRadius: 2.5,
                            p: 2,
                            backgroundColor: "#F0FDFA",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                              minWidth: 0,
                            }}
                          >
                            <AttachFileIcon
                              sx={{
                                color: "#0F766E",
                              }}
                            />

                            <Typography
                              sx={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: "#334155",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {selectedEmail.attachmentFileName}
                            </Typography>
                          </Box>

                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<DownloadIcon />}
                            onClick={() => handleDownload(selectedEmail)}
                            sx={{
                              backgroundColor: "#0F766E",
                              textTransform: "none",
                              fontWeight: 600,
                              borderRadius: 2,
                              px: 2,
                              whiteSpace: "nowrap",
                              "&:hover": {
                                backgroundColor: "#115E59",
                              },
                            }}
                          >
                            Download
                          </Button>
                        </Box>
                      </>
                    )}

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        mt: 3,
                      }}
                    >
                      <Button
                        variant="outlined"
                        onClick={handleCloseEmailDetails}
                        sx={{
                          color: "#475569",
                          borderColor: "#CBD5E1",
                          textTransform: "none",
                          fontWeight: 600,
                          borderRadius: 2,
                          px: 2.5,
                        }}
                      >
                        Close
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
    </>
  );
}

export default Navbar;
