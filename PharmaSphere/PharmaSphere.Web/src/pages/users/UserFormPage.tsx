import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { UserService } from '@/services/user.service';
import FormTextField from '@/components/common/FormTextField';
import LoadingButton from '@/components/common/LoadingButton';
import type { RoleOption } from '@/types/user.types';
import { decodeUserId } from '@/types/user.types';

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  roleId: number | '';
  isActive: boolean;
  password: string;
  confirmPassword: string;
}

const UserFormPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const encodedId = searchParams.get('id');
  const userId = encodedId ? decodeUserId(encodedId) : null;
  const isEditMode = userId !== null;

  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [loadingUser, setLoadingUser] = useState(isEditMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    getValues,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      roleId: '',
      isActive: true,
      password: '',
      confirmPassword: '',
    },
    mode: 'onTouched',
  });

  const passwordValue = watch('password');

  // Load roles once
  useEffect(() => {
    UserService.getRoles().then(setRoles).catch(() => {});
  }, []);

  // In edit mode load existing user data
  useEffect(() => {
    if (!isEditMode || !userId) return;
    setLoadingUser(true);
    UserService.getUserById(userId)
      .then((user) => {
        reset({
          firstName: user.firstName ?? '',
          lastName: user.lastName ?? '',
          email: user.email,
          roleId: user.roleId,
          isActive: user.isActive,
          password: '',
          confirmPassword: '',
        });
      })
      .catch(() => {
        enqueueSnackbar('Failed to load user.', { variant: 'error' });
        navigate('/users');
      })
      .finally(() => setLoadingUser(false));
  }, [isEditMode, userId, reset, navigate, enqueueSnackbar]);

  const onSubmit = async (data: FormValues) => {
    try {
      if (isEditMode && userId !== null) {
        await UserService.updateUser(userId, {
          email: data.email,
          firstName: data.firstName || null,
          lastName: data.lastName || null,
          roleId: data.roleId as number,
          isActive: data.isActive,
          password: data.password || undefined,
        });
        enqueueSnackbar('User updated successfully.', {
          variant: 'success',
          autoHideDuration: 10000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      } else {
        await UserService.createUser({
          email: data.email,
          firstName: data.firstName || null,
          lastName: data.lastName || null,
          roleId: data.roleId as number,
          isActive: data.isActive,
          password: data.password,
        });
        enqueueSnackbar('User created successfully.', {
          variant: 'success',
          autoHideDuration: 10000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
      navigate('/users');
    } catch (err) {
      let message = 'An unexpected error occurred.';
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message ?? message;
      }
      enqueueSnackbar(message, {
        variant: 'error',
        autoHideDuration: 10000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
    }
  };

  if (loadingUser) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box maxWidth={760} mx="auto">
      {/* Page header */}
      <Stack direction="row" alignItems="center" gap={1.5} mb={2}>
        <IconButton
          onClick={() => navigate('/users')}
          size="small"
          sx={{ border: 1, borderColor: 'divider' }}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Box>
          <Typography variant="h6" fontWeight={700} lineHeight={1.3}>
            {isEditMode ? 'Edit User' : 'Add User'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Users &rsaquo; {isEditMode ? 'Edit User' : 'Add User'}
          </Typography>
        </Box>
      </Stack>

      <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
        {/* Personal Information */}
        <Card elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2, mb: 1.5 }}>
          <CardHeader
            title="Personal Information"
            titleTypographyProps={{ variant: 'subtitle2', fontWeight: 600 }}
            sx={{ py: 1.25, px: 2.5 }}
          />
          <Divider />
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormTextField<FormValues>
                  name="firstName"
                  control={control}
                  label="First Name"
                  fullWidth
                  placeholder="Enter first name"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormTextField<FormValues>
                  name="lastName"
                  control={control}
                  label="Last Name"
                  fullWidth
                  placeholder="Enter last name"
                />
              </Grid>
              <Grid item xs={12}>
                <FormTextField<FormValues>
                  name="email"
                  control={control}
                  label="Email Address *"
                  type="email"
                  fullWidth
                  placeholder="user@example.com"
                  rules={{
                    required: 'Email is required',
                    pattern: {
                      value: EMAIL_REGEX,
                      message: 'Enter a valid email address',
                    },
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2, mb: 1.5 }}>
          <CardHeader
            title="Account Settings"
            titleTypographyProps={{ variant: 'subtitle2', fontWeight: 600 }}
            sx={{ py: 1.25, px: 2.5 }}
          />
          <Divider />
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Grid container spacing={2}>
              {/* Role */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="roleId"
                  control={control}
                  rules={{ required: 'Role is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <FormControl fullWidth error={!!error}>
                      <InputLabel>Role *</InputLabel>
                      <Select {...field} label="Role *">
                        {roles.map((r) => (
                          <MenuItem key={r.roleId} value={r.roleId}>
                            {r.roleName}
                          </MenuItem>
                        ))}
                      </Select>
                      {error && <FormHelperText>{error.message}</FormHelperText>}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Active Status */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <Box
                      sx={{
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        px: 1.5,
                        py: 0.75,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Account Status
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            color="success"
                          />
                        }
                        label={
                          <Typography
                            variant="body2"
                            fontWeight={500}
                            color={field.value ? 'success.main' : 'text.secondary'}
                          >
                            {field.value ? 'Active' : 'Inactive'}
                          </Typography>
                        }
                        labelPlacement="start"
                        sx={{ m: 0, gap: 1 }}
                      />
                    </Box>
                  )}
                />
              </Grid>

              {/* Password */}
              <Grid item xs={12} sm={6}>
                <FormTextField<FormValues>
                  name="password"
                  control={control}
                  label={isEditMode ? 'New Password' : 'Password *'}
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  placeholder={isEditMode ? 'Leave blank to keep current' : 'Min. 8 characters'}
                  rules={{
                    validate: (value) => {
                      if (!isEditMode && !value) return 'Password is required';
                      if (value && value.length < 8)
                        return 'Password must be at least 8 characters';
                      return true;
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          edge="end"
                          onClick={() => setShowPassword((v) => !v)}
                        >
                          {showPassword
                            ? <VisibilityOffIcon fontSize="small" />
                            : <VisibilityIcon fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Confirm Password */}
              <Grid item xs={12} sm={6}>
                <FormTextField<FormValues>
                  name="confirmPassword"
                  control={control}
                  label="Confirm Password"
                  type={showConfirm ? 'text' : 'password'}
                  fullWidth
                  placeholder="Re-enter password"
                  rules={{
                    validate: (value) => {
                      const pwd = getValues('password');
                      if (!pwd && isEditMode) return true;  // both blank in edit = ok
                      if (pwd && !value) return 'Please confirm your password';
                      if (value !== pwd) return 'Passwords do not match';
                      return true;
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          edge="end"
                          onClick={() => setShowConfirm((v) => !v)}
                        >
                          {showConfirm
                            ? <VisibilityOffIcon fontSize="small" />
                            : <VisibilityIcon fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                {isEditMode && !passwordValue && (
                  <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
                    Leave both fields blank to keep the existing password.
                  </Typography>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Actions */}
        <Stack direction="row" justifyContent="flex-end" gap={2}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => navigate('/users')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
            loadingText={isEditMode ? 'Saving…' : 'Creating…'}
            disableElevation
          >
            {isEditMode ? 'Save Changes' : 'Create User'}
          </LoadingButton>
        </Stack>
      </Box>
    </Box>
  );
};

export default UserFormPage;
