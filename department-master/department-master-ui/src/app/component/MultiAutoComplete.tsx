import {
  Autocomplete,
  TextField as MuiTextField,
  Chip,
  Box,
  Typography,
} from "@mui/material";

export interface MultiAutoCompleteOption {
  label: string;
  value: string | number;
}

interface MultiAutoCompleteProps {
  label: string;
  value: MultiAutoCompleteOption[];
  onChange: (value: MultiAutoCompleteOption[]) => void;
  options: MultiAutoCompleteOption[];
  error?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
}

function MultiAutoComplete({
  label,
  value,
  onChange,
  options,
  error,
  helperText,
  required,
  disabled,
}: MultiAutoCompleteProps) {
  return (
    <Autocomplete
      multiple
      size="small"
      options={options}
      value={value}
      disabled={disabled}
      disablePortal={false}
      openOnFocus
      isOptionEqualToValue={(option, selected) =>
        String(option.value) === String(selected.value)
      }
      getOptionLabel={(option) => option?.label ?? ""}
      onChange={(_event, newValue) => {
        onChange(newValue);
      }}
      slotProps={{
        popper: {
          sx: {
            zIndex: 1500,
          },
        },
        paper: {
          sx: {
            maxHeight: 320,

            "& .MuiAutocomplete-option": {
              fontSize: 14,
            },
          },
        },
      }}
      renderValue={(selectedValues) => {
        const selected = selectedValues as MultiAutoCompleteOption[];

        if (!selected?.length) {
          return null;
        }

        const firstOption = selected[0];

        const remainingCount = selected.length - 1;

        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              minWidth: 0,
              gap: 0.5,
              overflow: "hidden",
            }}
          >
            <Chip
              label={firstOption.label}
              size="small"
              sx={{
                margin: "2px",
                flexShrink: 1,
                minWidth: 0,

                "& .MuiChip-label": {
                  whiteSpace: "nowrap",
                },
              }}
            />

            {remainingCount > 0 && (
              <Typography
                component="span"
                sx={{
                  flexShrink: 0,
                  color: "#0F766E",
                  fontWeight: 600,
                  fontSize: 13,
                  whiteSpace: "nowrap",
                }}
              >
                +{remainingCount}
              </Typography>
            )}
          </Box>
        );
      }}
      renderInput={(params) => (
        <MuiTextField
          {...params}
          label={label}
          error={error}
          helperText={helperText}
          required={required}
        />
      )}
    />
  );
}

export default MultiAutoComplete;
