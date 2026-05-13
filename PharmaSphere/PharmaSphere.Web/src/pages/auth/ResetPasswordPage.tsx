// src/pages/auth/ResetPasswordPage.tsx

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  CircularProgress,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link as RouterLink } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from 'axios';

import AuthService from '@/services/auth.service';
import FormTextField from '@/components/common/FormTextField';
import LoadingButton from '@/components/common/LoadingButton';

interface ResetPasswordForm {
  newPassword: string;
  confirmPassword: string;
}

const ResetPasswordPage: React.FC = () => {
  const [searchParams]         = useSearchParams();
  const navigate               = useNavigate();
  const { enqueueSnackbar }    = useSnackbar();

  const token = searchParams.get('token') ?? '';

  // Token validation state
  const [validating, setValidating]   = useState(true);
  const [tokenEmail, setTokenEmail]   = useState<string | null>(null);
  const [tokenError, setTokenError]   = useState<string | null>(null);

  // Form state
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [apiError,    setApiError]    = useState<string | null>(null);
  const [success,     setSuccess]     = useState(false);

  const { control, handleSubmit, watch } = useForm<ResetPasswordForm>({
    defaultValues: { newPassword: '', confirmPassword: '' },
    mode: 'onTouched',
  });

  const newPassword = watch('newPassword');

  // Validate the token on mount and fetch the associated email
  useEffect(() => {
    if (!token) {
      setTokenError('No reset token found. Please request a new password reset link.');
      setValidating(false);
      return;
    }

    AuthService.validateResetToken(token)
      .then(({ email }) => {
        setTokenEmail(email);
        setValidating(false);
      })
      .catch(() => {
        setTokenError('This reset link is invalid or has expired. Please request a new one.');
        setValidating(false);
      });
  }, [token]);

  const onSubmit = async ({ newPassword }: ResetPasswordForm) => {
    setApiError(null);
    try {
      await AuthService.resetPassword(token, newPassword);
      setSuccess(true);
      enqueueSnackbar('Password reset successfully!', {
        variant: 'success',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setApiError(
          err.response?.data?.message ?? 'Could not reset password. Please try again.',
        );
      } else {
        setApiError('An unexpected error occurred.');
      }
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (validating) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress size={40} thickness={4} sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

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
        {/* Header */}
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
            <LockResetIcon />
          </Box>
          <Typography variant="h5" fontWeight={700}>
            Set new password
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {tokenEmail
              ? `Enter a new password for ${tokenEmail}`
              : 'Create a strong new password for your account.'}
          </Typography>
        </Stack>

        {/* Invalid / expired token */}
        {tokenError && (
          <>
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {tokenError}
            </Alert>
            <Box textAlign="center">
              <Link
                component={RouterLink}
                to="/forgot-password"
                variant="body2"
                underline="hover"
                sx={{ color: 'primary.main', fontWeight: 600 }}
              >
                Request a new reset link
              </Link>
            </Box>
          </>
        )}

        {/* Success state */}
        {!tokenError && success && (
          <Alert severity="success" sx={{ borderRadius: 2, mb: 3 }}>
            Password updated successfully! Redirecting you to sign in…
          </Alert>
        )}

        {/* Reset form */}
        {!tokenError && !success && (
          <>
            {/* Email display */}
            {tokenEmail && (
              <Box
                sx={{
                  mb: 3,
                  px: 2,
                  py: 1.5,
                  borderRadius: 2,
                  bgcolor: 'action.hover',
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <Typography variant="caption" color="text.secondary" display="block">
                  Account
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {tokenEmail}
                </Typography>
              </Box>
            )}

            {apiError && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {apiError}
              </Alert>
            )}

            <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={2.5}>
                {/* New password */}
                <FormTextField<ResetPasswordForm>
                  name="newPassword"
                  control={control}
                  label="New password"
                  type={showNew ? 'text' : 'password'}
                  autoFocus
                  autoComplete="new-password"
                  rules={{
                    required: 'New password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/,
                      message:
                        'Must include uppercase, lowercase, number and special character',
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowNew((v) => !v)}
                          edge="end"
                          size="small"
                          aria-label="toggle new password visibility"
                        >
                          {showNew ? (
                            <VisibilityOffIcon fontSize="small" />
                          ) : (
                            <VisibilityIcon fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Confirm password */}
                <FormTextField<ResetPasswordForm>
                  name="confirmPassword"
                  control={control}
                  label="Confirm new password"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  rules={{
                    required: 'Please confirm your new password',
                    validate: (value) =>
                      value === newPassword || 'Passwords do not match',
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirm((v) => !v)}
                          edge="end"
                          size="small"
                          aria-label="toggle confirm password visibility"
                        >
                          {showConfirm ? (
                            <VisibilityOffIcon fontSize="small" />
                          ) : (
                            <VisibilityIcon fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <LoadingButton
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disableElevation
                  sx={{ py: 1.5, borderRadius: 2, mt: 0.5 }}
                >
                  Save new password
                </LoadingButton>
              </Stack>
            </Box>
          </>
        )}

        {/* Back to login */}
        {!success && (
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
        )}
      </Paper>
    </Box>
  );
};

export default ResetPasswordPage;
