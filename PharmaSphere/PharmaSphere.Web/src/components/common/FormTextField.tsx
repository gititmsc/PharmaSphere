// src/components/common/FormTextField.tsx
// Controlled MUI TextField wired to react-hook-form

import {
  Controller,
  FieldValues,
  Path,
  RegisterOptions,
  Control,
} from 'react-hook-form';
import { TextField, TextFieldProps } from '@mui/material';

interface FormTextFieldProps<T extends FieldValues>
  extends Omit<TextFieldProps, 'name'> {
  name: Path<T>;
  control: Control<T>;
  rules?: RegisterOptions<T, Path<T>>;
}

function FormTextField<T extends FieldValues>({
  name,
  control,
  rules,
  ...textFieldProps
}: FormTextFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          {...textFieldProps}
          error={!!error}
          helperText={error?.message ?? textFieldProps.helperText}
        />
      )}
    />
  );
}

export default FormTextField;
