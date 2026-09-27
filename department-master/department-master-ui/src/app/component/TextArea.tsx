import { TextField as MuiTextField } from "@mui/material";

interface TextAreaProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  rows?: number;
  maxLength?: number;
  disabled?: boolean;
}

function TextArea({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  required,
  rows = 3,
  maxLength,
  disabled,
}: TextAreaProps) {
  return (
    <MuiTextField
      fullWidth
      multiline
      size="small"
      rows={rows}
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      error={error}
      helperText={helperText}
      required={required}
      disabled={disabled}
      slotProps={{ htmlInput: { maxLength } }}
    />
  );
}

export default TextArea;
