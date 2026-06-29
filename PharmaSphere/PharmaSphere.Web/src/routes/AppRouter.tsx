// src/routes/AppRouter.tsx

import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import GuestRoute from './GuestRoute';
import TwoFactorRoute from './TwoFactorRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';

const LoginPage          = lazy(() => import('@/pages/auth/LoginPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage  = lazy(() => import('@/pages/auth/ResetPasswordPage'));
const TwoFactorPage      = lazy(() => import('@/pages/auth/TwoFactorPage'));
const DashboardPage      = lazy(() => import('@/pages/dashboard/DashboardPage'));
const SalesOrdersPage    = lazy(() => import('@/pages/sales-orders/SalesOrdersPage'));
const SalesOrderFormPage = lazy(() => import('@/pages/sales-orders/SalesOrderFormPage'));
const SalesOrderDetailPage = lazy(() => import('@/pages/sales-orders/SalesOrderDetailPage'));
const UsersPage              = lazy(() => import('@/pages/users/UsersPage'));
const UserFormPage           = lazy(() => import('@/pages/users/UserFormPage'));
const ProductMastersPage     = lazy(() => import('@/pages/product-masters/ProductMastersPage'));
const ProductMasterFormPage  = lazy(() => import('@/pages/product-masters/ProductMasterFormPage'));

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
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* Public route — accessible via the link in the reset email */}
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* 2FA route — only accessible while pendingTwoFactor is true */}
        <Route element={<TwoFactorRoute />}>
          <Route path="/verify-2fa" element={<TwoFactorPage />} />
        </Route>

        {/* Protected routes — shared DashboardLayout wraps all pages */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout><Outlet /></DashboardLayout>}>
            <Route path="/dashboard"             element={<DashboardPage />} />
            <Route path="/sales-orders"          element={<SalesOrdersPage />} />
            <Route path="/sales-orders/form"     element={<SalesOrderFormPage />} />
            <Route path="/sales-orders/:id"      element={<SalesOrderDetailPage />} />

            {/* Admin-only routes */}
            <Route element={<AdminRoute />}>
              <Route path="/users"      element={<UsersPage />} />
              <Route path="/users/form" element={<UserFormPage />} />
              <Route path="/product-masters"                   element={<ProductMastersPage />} />
              <Route path="/product-masters/new"               element={<ProductMasterFormPage />} />
              <Route path="/product-masters/:encodedId"        element={<ProductMasterFormPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default AppRouter;
