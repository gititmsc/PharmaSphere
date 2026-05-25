// src/routes/AppRouter.tsx

import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import GuestRoute from './GuestRoute';
import TwoFactorRoute from './TwoFactorRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageLoader from '@/components/common/PageLoader';

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));
const TwoFactorPage = lazy(() => import('@/pages/auth/TwoFactorPage'));
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const SalesOrdersPage = lazy(() => import('@/pages/sales-orders/SalesOrdersPage'));
const SalesOrderFormPage = lazy(() => import('@/pages/sales-orders/SalesOrderFormPage'));
const SalesOrderDetailPage = lazy(() => import('@/pages/sales-orders/SalesOrderDetailPage'));
const UsersPage = lazy(() => import('@/pages/users/UsersPage'));
const UserFormPage = lazy(() => import('@/pages/users/UserFormPage'));

const SuspenseWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<PageLoader />}>
    {children}
  </Suspense>
);

const AppRouter: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route
        element={
          <SuspenseWrapper>
            <GuestRoute />
          </SuspenseWrapper>
        }
      >
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      <Route
        path="/reset-password"
        element={
          <SuspenseWrapper>
            <ResetPasswordPage />
          </SuspenseWrapper>
        }
      />

      <Route
        element={
          <SuspenseWrapper>
            <TwoFactorRoute />
          </SuspenseWrapper>
        }
      >
        <Route path="/verify-2fa" element={<TwoFactorPage />} />
      </Route>

      <Route
        element={
          <SuspenseWrapper>
            <ProtectedRoute />
          </SuspenseWrapper>
        }
      >
        <Route element={<DashboardLayout><Outlet /></DashboardLayout>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/sales-orders" element={<SalesOrdersPage />} />
          <Route path="/sales-orders/form" element={<SalesOrderFormPage />} />
          <Route path="/sales-orders/:id" element={<SalesOrderDetailPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/form" element={<UserFormPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </BrowserRouter>
);

export default React.memo(AppRouter);
