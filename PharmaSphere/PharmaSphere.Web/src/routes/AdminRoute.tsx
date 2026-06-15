import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';

const AdminRoute: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh">
        <CircularProgress size={48} thickness={4} />
      </Box>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.roleName !== 'Admin') return <Navigate to="/dashboard" replace />;

  return <Outlet />;
};

export default AdminRoute;
