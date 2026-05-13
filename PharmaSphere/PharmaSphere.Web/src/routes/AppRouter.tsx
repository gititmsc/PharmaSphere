// src/routes/AppRouter.tsx

import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import ProtectedRoute from './ProtectedRoute';
import GuestRoute from './GuestRoute';
import TwoFactorRoute from './TwoFactorRoute';

const LoginPage         = lazy(() => import('@/pages/auth/LoginPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const TwoFactorPage     = lazy(() => import('@/pages/auth/TwoFactorPage'));
const DashboardPage     = lazy(() => import('@/pages/dashboard/DashboardPage'));

const PageLoader: React.FC = () => (
  <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh">
    <CircularProgress size={40} thickness={4} sx={{ color: 'primary.main' }} />
  </Box>
);

const AppRouter: React.FC = () => (
  <BrowserRouter>
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Guest-only routes (redirect to dashboard if already logged in) */}
        <Route element={<GuestRoute />}>
          <Route path="/login"          element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* 2FA route — only accessible while pendingTwoFactor is true */}
        <Route element={<TwoFactorRoute />}>
          <Route path="/verify-2fa" element={<TwoFactorPage />} />
        </Route>

        {/* Protected routes — require full authentication */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default AppRouter;
