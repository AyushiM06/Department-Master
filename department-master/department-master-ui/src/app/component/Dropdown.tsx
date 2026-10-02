import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  FormHelperText,
} from "@mui/material";

import type { SelectChangeEvent } from "@mui/material";

export interface DropdownOption {
  label: string;
  value: string | number;
}

interface DropdownProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: SelectChangeEvent<string>) => void;
  onBlur?: () => void;
  options: DropdownOption[];
  error?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
}

function Dropdown({
  label,
  name,
  value,
  onChange,
  onBlur,
  options,
  error = false,
  helperText,
  required = false,
  disabled = false,
}: DropdownProps) {
  return (
    <FormControl
      fullWidth
      size="small"
      error={error}
      required={required}
      disabled={disabled}
    >
      <InputLabel id={`${name}-label`}>{label}</InputLabel>

      <Select
        labelId={`${name}-label`}
        id={name}
        name={name}
        value={String(value ?? "")}
        label={label}
        onChange={onChange}
        onBlur={() => onBlur?.()}
        MenuProps={{
          sx: {
            zIndex: 1500,
          },
          slotProps: {
            paper: {
              sx: {
                maxHeight: 320,
                "& .MuiMenuItem-root": {
                  fontSize: 14,
                },
              },
            },
          },
        }}
      >
        <MenuItem value="">
          <em>Select {label}</em>
        </MenuItem>

        {options.map((option) => (
          <MenuItem
            key={`${name}-${option.value}`}
            value={String(option.value)}
          >
            {option.label}
          </MenuItem>
        ))}
      </Select>

      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}

export default Dropdown;
