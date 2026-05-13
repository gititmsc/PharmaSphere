// src/components/common/LoadingButton.tsx

import React from 'react';
import { Button, ButtonProps, CircularProgress } from '@mui/material';

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  loadingText,
  children,
  disabled,
  startIcon,
  ...rest
}) => (
  <Button
    {...rest}
    disabled={loading || disabled}
    startIcon={
      loading ? (
        <CircularProgress size={18} color="inherit" thickness={4} />
      ) : (
        startIcon
      )
    }
  >
    {loading && loadingText ? loadingText : children}
  </Button>
);

export default LoadingButton;
