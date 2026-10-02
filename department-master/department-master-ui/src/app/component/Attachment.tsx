import { useRef } from "react";
import Swal from "sweetalert2";

import { Box, Button, Typography, IconButton, Tooltip } from "@mui/material";

import UploadFileIcon from "@mui/icons-material/UploadFile";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";

interface AttachmentProps {
  label: string;
  file: File | null;

  existingFileName?: string | null;
  existingFileUuid?: string | null;
  onDownloadExisting?: (uuid: string, fileName: string) => void;
  onRemoveExisting?: (uuid: string, fileName: string) => void;

  onChange: (file: File | null) => void;
  allowedTypes: string[];
  maxSizeMB: number;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
}

function Attachment({
  label,
  file,
  existingFileName,
  existingFileUuid,
  onDownloadExisting,
  onRemoveExisting,
  onChange,
  allowedTypes,
  maxSizeMB,
  error,
  helperText,
  disabled,
}: AttachmentProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const showValidationAlert = (title: string, text: string) => {
    Swal.fire({
      icon: "error",
      title,
      text,
      confirmButtonText: "OK",
      confirmButtonColor: "#0F766E",

      customClass: {
        container: "attachment-swal-container",
      },

      didOpen: () => {
        const container = Swal.getContainer();

        if (container) {
          container.style.zIndex = "999999";
        }

        const popup = Swal.getPopup();

        if (popup) {
          popup.style.zIndex = "1000000";
        }
      },
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (!allowedTypes.includes(selectedFile.type)) {
      showValidationAlert(
        "Invalid File Type",
        `${label} does not support this file type.`,
      );

      e.target.value = "";
      onChange(null);
      return;
    }

    const sizeInMB = selectedFile.size / (1024 * 1024);

    if (sizeInMB > maxSizeMB) {
      showValidationAlert(
        "File Too Large",
        `${label} size must not exceed ${maxSizeMB} MB.`,
      );

      e.target.value = "";
      onChange(null);
      return;
    }

    onChange(selectedFile);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleRemoveFile = () => {
    onChange(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const hasNewFile = Boolean(file);

  const hasExistingFile = !hasNewFile && Boolean(existingFileName);

  return (
    <Box>
      {/* Label */}
      <Typography
        sx={{
          fontSize: 14,
          mb: 0.5,
          color: error ? "error.main" : "text.secondary",
        }}
      >
        {label}
      </Typography>

      <input
        ref={inputRef}
        type="file"
        hidden
        onChange={handleFileSelect}
        accept={allowedTypes.join(",")}
        disabled={disabled}
      />

      {hasNewFile && file && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            border: "1px solid #D7E6E3",
            backgroundColor: "#F4F8F7",
            borderRadius: 1.5,
            px: 1.5,
            py: 0.7,
            width: "fit-content",
            maxWidth: "100%",
          }}
        >
          <UploadFileIcon
            sx={{
              fontSize: 20,
              color: "#0F766E",
            }}
          />

          <Typography
            sx={{
              fontSize: 13,
              maxWidth: 220,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {file.name}
          </Typography>

          <Tooltip title="Remove selected file">
            <IconButton
              size="small"
              onClick={handleRemoveFile}
              disabled={disabled}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {hasExistingFile && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            border: "1px solid #D7E6E3",
            backgroundColor: "#F8FAFA",
            borderRadius: 1.5,
            px: 1.5,
            py: 0.7,
            width: "fit-content",
            maxWidth: "100%",
          }}
        >
          <UploadFileIcon
            sx={{
              fontSize: 20,
              color: "#0F766E",
            }}
          />

          <Typography
            sx={{
              fontSize: 13,
              maxWidth: 220,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {existingFileName}
          </Typography>

          {existingFileUuid && onDownloadExisting && (
            <Tooltip title="Download existing file">
              <IconButton
                size="small"
                onClick={() =>
                  onDownloadExisting(existingFileUuid, existingFileName!)
                }
                disabled={disabled}
                sx={{
                  color: "#0F766E",
                }}
              >
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Replace file">
            <IconButton
              size="small"
              onClick={() => inputRef.current?.click()}
              disabled={disabled}
              sx={{
                color: "#0F766E",
              }}
            >
              <UploadFileIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {existingFileUuid && onRemoveExisting && (
            <Tooltip title="Remove existing file">
              <IconButton
                size="small"
                onClick={() =>
                  onRemoveExisting(existingFileUuid, existingFileName!)
                }
                disabled={disabled}
                sx={{
                  color: "#DC2626",
                  "&:hover": {
                    backgroundColor: "#FEF2F2",
                  },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}

      {!hasNewFile && !hasExistingFile && (
        <Button
          variant="outlined"
          size="small"
          startIcon={<UploadFileIcon />}
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
        >
          Choose File
        </Button>
      )}

      {helperText && (
        <Typography
          sx={{
            fontSize: 12,
            mt: 0.5,
            color: error ? "error.main" : "text.secondary",
          }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
}

export default Attachment;
