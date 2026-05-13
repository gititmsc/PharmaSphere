// src/routes/TwoFactorRoute.tsx
// Only allows access to /verify-2fa when a 2FA session is pending.
// Redirects authenticated users to /dashboard, unauthenticated to /login.

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';

const TwoFactorRoute: React.FC = () => {
  const { isLoading, isAuthenticated, pendingTwoFactor } = useAuth();

  if (isLoading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh">
        <CircularProgress size={40} thickness={4} sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  if (!pendingTwoFactor) return <Navigate to="/login" replace />;

  return <Outlet />;
};

export default TwoFactorRoute;
