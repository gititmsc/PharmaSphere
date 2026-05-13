// src/pages/dashboard/DashboardPage.tsx

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupIcon from '@mui/icons-material/Group';
import BarChartIcon from '@mui/icons-material/BarChart';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

interface StatCard {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: React.ReactNode;
  color: string;
}

const stats: StatCard[] = [
  {
    label: 'Total Users',
    value: '12,847',
    change: '+8.2%',
    positive: true,
    icon: <GroupIcon />,
    color: '#2563EB',
  },
  {
    label: 'Monthly Revenue',
    value: '$94,230',
    change: '+12.5%',
    positive: true,
    icon: <TrendingUpIcon />,
    color: '#059669',
  },
  {
    label: 'Active Sessions',
    value: '3,421',
    change: '-2.1%',
    positive: false,
    icon: <BarChartIcon />,
    color: '#7C3AED',
  },
  {
    label: 'Completed Tasks',
    value: '98.4%',
    change: '+0.6%',
    positive: true,
    icon: <CheckCircleOutlineIcon />,
    color: '#D97706',
  },
];

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <Box maxWidth={1200} mx="auto">
        {/* Welcome */}
        <Stack spacing={0.5} mb={4}>
          <Typography variant="h5" fontWeight={700}>
            Good morning, {user?.email?.split('@')[0]} 👋
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Here's what's happening with your application today.
          </Typography>
        </Stack>

        {/* Stat cards */}
        <Grid container spacing={3} mb={4}>
          {stats.map((stat) => (
            <Grid item xs={12} sm={6} lg={3} key={stat.label}>
              <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack
                    direction="row"
                    alignItems="flex-start"
                    justifyContent="space-between"
                    mb={2}
                  >
                    <Box
                      sx={{
                        p: 1.25,
                        borderRadius: 2,
                        bgcolor: `${stat.color}18`,
                        color: stat.color,
                        display: 'flex',
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Chip
                      label={stat.change}
                      size="small"
                      sx={{
                        bgcolor: stat.positive ? '#DCFCE7' : '#FEE2E2',
                        color: stat.positive ? '#166534' : '#991B1B',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                      }}
                    />
                  </Stack>
                  <Typography variant="h5" fontWeight={700} mb={0.25}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* User info card */}
        <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Account Details
            </Typography>
            <Grid container spacing={2}>
              {[
                { label: 'Email', value: user?.email },
                { label: 'Role', value: user?.roleName },
                { label: 'User ID', value: user?.userId?.toString() },
              ].map(({ label, value }) => (
                <Grid item xs={12} sm={6} key={label}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {label}
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {value ?? '—'}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default DashboardPage;
