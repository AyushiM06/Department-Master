import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Checkbox as MuiCheckbox,
  FormGroup,
  FormHelperText,
} from "@mui/material";

export interface CheckboxOption {
  label: string;
  value: string;
}

interface CheckboxProps {
  label: string;
  name: string;
  value: string[];
  onChange: (selected: string[]) => void;
  options: CheckboxOption[];
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
}

function Checkbox({
  label,
  value,
  onChange,
  options,
  error,
  helperText,
  disabled,
}: CheckboxProps) {
  const handleToggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((item) => item !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  return (
    <FormControl error={error} disabled={disabled}>
      <FormLabel sx={{ fontSize: 14 }}>{label}</FormLabel>
      <FormGroup row>
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            control={
              <MuiCheckbox
                size="small"
                checked={value.includes(option.value)}
                onChange={() => handleToggle(option.value)}
              />
            }
            label={option.label}
          />
        ))}
      </FormGroup>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}

export default Checkbox;
