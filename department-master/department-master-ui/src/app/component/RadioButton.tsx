import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  FormHelperText,
} from "@mui/material";

export interface RadioOption {
  label: string;
  value: string;
}

interface RadioButtonProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  options: RadioOption[];
  error?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
}

function RadioButton({
  label,
  name,
  value,
  onChange,
  options,
  error,
  helperText,
  required,
  disabled,
}: RadioButtonProps) {
  return (
    <FormControl error={error} required={required} disabled={disabled}>
      <FormLabel sx={{ fontSize: 14 }}>{label}</FormLabel>
      <RadioGroup row name={name} value={value} onChange={onChange}>
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio size="small" />}
            label={option.label}
          />
        ))}
      </RadioGroup>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}

export default RadioButton;
