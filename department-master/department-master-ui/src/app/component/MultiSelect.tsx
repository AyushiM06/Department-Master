import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  FormHelperText,
  Checkbox,
  ListItemText,
} from "@mui/material";

import type { SelectChangeEvent } from "@mui/material";

export interface MultiSelectOption {
  label: string;
  value: string | number;
}

interface MultiSelectProps {
  label: string;
  name: string;
  value: (string | number)[];
  onChange: (e: SelectChangeEvent<(string | number)[]>) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  options: MultiSelectOption[];
  error?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
}

const SELECT_ALL_VALUE = "__SELECT_ALL__";

function MultiSelect({
  label,
  name,
  value,
  onChange,
  onBlur,
  options,
  error,
  helperText,
  required,
  disabled,
}: MultiSelectProps) {
  const selectedValues = Array.isArray(value) ? value : [];

  const allSelected =
    options.length > 0 &&
    options.every((option) =>
      selectedValues.some(
        (selected) => String(selected) === String(option.value),
      ),
    );

  const someSelected = selectedValues.length > 0 && !allSelected;

  const handleChange = (event: SelectChangeEvent<(string | number)[]>) => {
    const selected = event.target.value;

    if (Array.isArray(selected)) {
      const hasSelectAll = selected.some(
        (item) => String(item) === SELECT_ALL_VALUE,
      );

      if (hasSelectAll) {
        const nextValue = allSelected
          ? []
          : options.map((option) => option.value);

        onChange({
          ...event,
          target: {
            ...event.target,
            name,
            value: nextValue,
          },
        } as SelectChangeEvent<(string | number)[]>);

        return;
      }
    }

    onChange(event);
  };

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
        multiple
        value={selectedValues}
        label={label}
        onChange={handleChange}
        onBlur={onBlur}
        renderValue={(selected) =>
          (selected as (string | number)[])
            .map((selectedValue) => {
              const option = options.find(
                (item) => String(item.value) === String(selectedValue),
              );

              return option?.label ?? String(selectedValue);
            })
            .join(", ")
        }
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
        <MenuItem value={SELECT_ALL_VALUE}>
          <Checkbox checked={allSelected} indeterminate={someSelected} />
          <ListItemText primary="Select All" />
        </MenuItem>

        {options.map((option) => {
          const isSelected = selectedValues.some(
            (item) => String(item) === String(option.value),
          );

          return (
            <MenuItem key={`${name}-${option.value}`} value={option.value}>
              <Checkbox checked={isSelected} />
              <ListItemText primary={option.label} />
            </MenuItem>
          );
        })}
      </Select>

      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}

export default MultiSelect;
