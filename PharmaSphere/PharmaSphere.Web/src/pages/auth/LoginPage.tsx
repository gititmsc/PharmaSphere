// src/pages/auth/LoginPage.tsx

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Alert,
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import logo from '@/assets/logo.png';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from 'axios';

import { useAuth } from '@/contexts/AuthContext';
import { LoginRequest } from '@/types/auth.types';
import FormTextField from '@/components/common/FormTextField';
import LoadingButton from '@/components/common/LoadingButton';

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

const LoginPage: React.FC = () => {
  const { login, pendingTwoFactor } = useAuth();
  const navigate                    = useNavigate();
  const { enqueueSnackbar }         = useSnackbar();

  const [showPassword, setShowPassword] = useState(false);
  const [apiError,     setApiError    ] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    register,
    watch,
    formState: { isSubmitting },
  } = useForm<LoginRequest>({
    defaultValues: { email: '', password: '', rememberMe: false },
    mode: 'onTouched',
  });

  const rememberMe = watch('rememberMe');

  // Redirect to 2FA page once context flips to pendingTwoFactor
  React.useEffect(() => {
    if (pendingTwoFactor) navigate('/verify-2fa', { replace: true });
  }, [pendingTwoFactor, navigate]);

  const onSubmit = async (data: LoginRequest) => {
    setApiError(null);
    try {
      await login(data);
    } catch (err) {
      let message = 'An unexpected error occurred. Please try again.';
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401 || status === 400) {
          message = 'Username or password is incorrect.';
        } else if (err.response?.data?.message) {
          message = err.response.data.message;
        }
      }
      setApiError(message);
      enqueueSnackbar(message, {
        variant:          'error',
        autoHideDuration: 5000,
        anchorOrigin:     { vertical: 'top', horizontal: 'right' },
      });
    }
  };

  return (
    <Box
      sx={{
        minHeight:      '100vh',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        bgcolor:        'background.default',
        px:             { xs: 2, sm: 3 },
        py:             { xs: 4, sm: 6 },
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 440 }}>

        {/* Logo */}
        <Stack alignItems="center" mb={3}>
          <Box
            component="img"
            src={logo}
            alt="PharmaSphere"
            sx={{
              width:     { xs: 200, sm: 240 },
              height:    'auto',
              objectFit: 'contain',
            }}
          />
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Sign in to your account to continue
          </Typography>
        </Stack>

        {/* Error alert */}
        {apiError && (
          <Alert
            severity="error"
            onClose={() => setApiError(null)}
            sx={{
              mb:           3,
              borderRadius: 2,
              border:       '1px solid',
              borderColor:  'error.light',
              '& .MuiAlert-message': { fontWeight: 500 },
            }}
          >
            {apiError}
          </Alert>
        )}

        {/* Form */}
        <Paper
          elevation={0}
          sx={{
            p:            { xs: 3, sm: 4 },
            borderRadius: 3,
            border:       '1px solid',
            borderColor:  'divider',
            bgcolor:      'background.paper',
            boxShadow:    '0 4px 24px rgba(56,142,60,0.10)',
          }}
        >
          <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2.5}>
              {/* Email */}
              <FormTextField<LoginRequest>
                name="email"
                control={control}
                label="Email address"
                type="email"
                autoComplete="email"
                autoFocus
                placeholder="you@example.com"
                rules={{
                  required: 'Email is required',
                  pattern: {
                    value:   EMAIL_REGEX,
                    message: 'Enter a valid email address',
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Password */}
              <FormTextField<LoginRequest>
                name="password"
                control={control}
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                rules={{
                  required: 'Password is required',
                  minLength: {
                    value:   6,
                    message: 'Password must be at least 6 characters',
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((v) => !v)}
                        edge="end"
                        size="small"
                        aria-label="toggle password visibility"
                      >
                        {showPassword
                          ? <VisibilityOffIcon fontSize="small" />
                          : <VisibilityIcon   fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Remember me + forgot password */}
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                flexWrap="wrap"
                gap={1}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      {...register('rememberMe')}
                      checked={rememberMe}
                      size="small"
                      sx={{ color: 'primary.main', '&.Mui-checked': { color: 'primary.main' } }}
                    />
                  }
                  label={
                    <Typography variant="body2" color="text.secondary">
                      Remember me
                    </Typography>
                  }
                />
                <Link
                  component={RouterLink}
                  to="/forgot-password"
                  variant="body2"
                  underline="hover"
                  sx={{ color: 'primary.main', fontWeight: 600 }}
                >
                  Forgot password?
                </Link>
              </Box>

              {/* Submit */}
              <LoadingButton
                type="submit"
                variant="contained"
                size="large"
                loading={isSubmitting}
                loadingText="Signing in…"
                fullWidth
                disableElevation
                sx={{
                  py:           1.7,
                  fontSize:     '1rem',
                  borderRadius: 2.5,
                  mt:           0.5,
                }}
              >
                Sign in
              </LoadingButton>
            </Stack>
          </Box>
        </Paper>

        {/* Footer */}
        <Divider sx={{ my: 3 }} />
        <Typography
          variant="caption"
          color="text.secondary"
          textAlign="center"
          display="block"
          lineHeight={1.8}
        >
          By signing in you agree to our{' '}
          <Link href="#" underline="hover" sx={{ color: 'primary.main' }}>
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="#" underline="hover" sx={{ color: 'primary.main' }}>
            Privacy Policy
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginPage;
