import { useEffect, useState } from "react";
import {
  Autocomplete,
  TextField as MuiTextField,
} from "@mui/material";

export interface AutoCompleteOption {
  label: string;
  value: string | number;
  isNew?: boolean;
}

interface AutoCompleteProps {
  label: string;
  value: AutoCompleteOption | null;
  onChange: (value: AutoCompleteOption | null) => void;
  options: AutoCompleteOption[];
  error?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  onInputChange?: (value: string) => void;
  allowCreate?: boolean;
}

function AutoComplete({
  label,
  value,
  onChange,
  options,
  error,
  helperText,
  required,
  disabled,
  onInputChange,
  allowCreate = false,
}: AutoCompleteProps) {
  const [inputValue, setInputValue] = useState("");

  // =====================================================
  // Sync input text when selected value changes
  // =====================================================
  useEffect(() => {
    if (value) {
      setInputValue(value.label);
    }
  }, [value]);

  return (
    <Autocomplete
      size="small"
      options={options}
      value={value}
      inputValue={inputValue}
      disabled={disabled}
      disablePortal={false}
      forcePopupIcon={false}
      freeSolo={false}
      isOptionEqualToValue={(option, selected) =>
        String(option.value) === String(selected.value)
      }
      getOptionLabel={(option) => String(option?.label ?? "")}
      filterOptions={(options, params) => {
        const typedValue = params.inputValue.trim();

        const filtered = options.filter((option) =>
          option.label
            .toLowerCase()
            .includes(typedValue.toLowerCase()),
        );

        const alreadyExists = options.some(
          (option) =>
            option.label.trim().toLowerCase() ===
            typedValue.toLowerCase(),
        );

        // =================================================
        // CREATE NEW EMPLOYEE OPTION
        // =================================================
        if (
          allowCreate &&
          typedValue &&
          !alreadyExists
        ) {
          filtered.push({
            label: `Create "${typedValue}"`,
            value: typedValue,
            isNew: true,
          });
        }

        return filtered;
      }}
      onChange={(_event, newValue) => {
  onChange(newValue);

  if (newValue) {
    setInputValue(newValue.label);
  } else {
    setInputValue("");
  }
}}
      onInputChange={(_event, newInputValue, reason) => {
        // =================================================
        // USER IS TYPING
        // =================================================
        if (reason === "input") {
          setInputValue(newInputValue);
          onInputChange?.(newInputValue);
          return;
        }

        // =================================================
        // OPTION SELECTED
        // =================================================
        if (reason === "reset") {
          setInputValue(newInputValue);
          return;
        }

        // =================================================
        // CLEAR BUTTON
        // =================================================
        if (reason === "clear") {
          setInputValue("");
          onInputChange?.("");
        }
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

export default AutoComplete;