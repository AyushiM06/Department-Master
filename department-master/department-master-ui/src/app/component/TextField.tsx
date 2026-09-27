import { TextField as MuiTextField } from "@mui/material";

interface TextFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  type?: string;
  maxLength?: number;
  disabled?: boolean;
  endAdornment?: React.ReactNode;
}

function TextField({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  required,
  type = "text",
  maxLength,
  disabled,
  endAdornment,
}: TextFieldProps) {
  return (
    <MuiTextField
      fullWidth
      size="small"
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      error={error}
      helperText={helperText}
      required={required}
      type={type}
      disabled={disabled}
      slotProps={{
        htmlInput: {
          maxLength,
        },
        input: {
          endAdornment,
        },
      }}
    />
  );
}

export default TextField;
