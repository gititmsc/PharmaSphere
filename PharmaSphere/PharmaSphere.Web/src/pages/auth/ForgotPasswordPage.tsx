// src/pages/auth/ForgotPasswordPage.tsx

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Alert,
  Box,
  Link,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import { Link as RouterLink } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from 'axios';

import AuthService from '@/services/auth.service';
import FormTextField from '@/components/common/FormTextField';
import LoadingButton from '@/components/common/LoadingButton';

interface ForgotPasswordForm {
  email: string;
}

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

const ForgotPasswordPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [sent, setSent] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<ForgotPasswordForm>({
    defaultValues: { email: '' },
    mode: 'onTouched',
  });

  const onSubmit = async ({ email }: ForgotPasswordForm) => {
    setApiError(null);
    try {
      await AuthService.forgotPassword(email);
      setSent(true);
      enqueueSnackbar('Reset instructions sent!', { variant: 'success' });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setApiError(
          err.response?.data?.message ?? 'Could not send reset email. Try again.',
        );
      } else {
        setApiError('An unexpected error occurred.');
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 448,
          p: { xs: 3, sm: 5 },
          borderRadius: 3,
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Stack alignItems="center" spacing={1.5} mb={4}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 2,
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <EmailOutlinedIcon />
          </Box>
          <Typography variant="h5" fontWeight={700}>
            Reset your password
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Enter your email and we'll send you a reset link.
          </Typography>
        </Stack>

        {sent ? (
          <Alert severity="success" sx={{ borderRadius: 2, mb: 3 }}>
            Check your inbox — we've sent a password reset link.
          </Alert>
        ) : (
          <>
            {apiError && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {apiError}
              </Alert>
            )}
            <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={2.5}>
                <FormTextField<ForgotPasswordForm>
                  name="email"
                  control={control}
                  label="Email address"
                  type="email"
                  autoFocus
                  rules={{
                    required: 'Email is required',
                    pattern: { value: EMAIL_REGEX, message: 'Enter a valid email' },
                  }}
                />
                <LoadingButton
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disableElevation
                >
                  Send reset link
                </LoadingButton>
              </Stack>
            </Box>
          </>
        )}

        <Box mt={3} textAlign="center">
          <Link
            component={RouterLink}
            to="/login"
            variant="body2"
            underline="hover"
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
          >
            <ArrowBackIcon fontSize="inherit" />
            Back to sign in
          </Link>
        </Box>
      </Paper>
    </Box>
  );
};

export default ForgotPasswordPage;
