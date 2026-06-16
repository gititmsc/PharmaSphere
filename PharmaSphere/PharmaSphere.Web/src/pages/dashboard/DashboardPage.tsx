import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import AssignmentIcon        from '@mui/icons-material/Assignment';
import CheckCircleIcon       from '@mui/icons-material/CheckCircle';
import CancelIcon            from '@mui/icons-material/Cancel';
import PlaylistAddCheckIcon  from '@mui/icons-material/PlaylistAddCheck';
import EditIcon              from '@mui/icons-material/Edit';
import ArrowForwardIcon      from '@mui/icons-material/ArrowForward';
import { useNavigate }       from 'react-router-dom';
import { useAuth }           from '@/contexts/AuthContext';
import { DashboardService }  from '@/services/dashboard.service';
import { encodeOrderId }     from '@/types/order.types';
import type { AdminDashboard, RoleDashboard, DashboardOrderItem } from '@/services/dashboard.service';

// ── colour helpers ────────────────────────────────────────────────────────────

type ChipColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

const MUI_COLORS: Record<string, ChipColor> = {
  default: 'default', primary: 'primary', secondary: 'secondary',
  success: 'success', warning: 'warning', error: 'error', info: 'info',
};

function chipColor(c: string): ChipColor {
  return MUI_COLORS[c] ?? 'default';
}

const BG_COLORS: Record<ChipColor, string> = {
  default:   '#F3F4F6',
  primary:   '#DBEAFE',
  secondary: '#EDE9FE',
  success:   '#DCFCE7',
  warning:   '#FEF3C7',
  error:     '#FEE2E2',
  info:      '#E0F2FE',
};

const TEXT_COLORS: Record<ChipColor, string> = {
  default:   '#374151',
  primary:   '#1D4ED8',
  secondary: '#6D28D9',
  success:   '#15803D',
  warning:   '#92400E',
  error:     '#B91C1C',
  info:      '#0369A1',
};

// ── shared pending-orders table ───────────────────────────────────────────────

interface PendingTableProps {
  orders: DashboardOrderItem[];
  showStatus?: boolean;
}

const PendingTable: React.FC<PendingTableProps> = ({ orders, showStatus = false }) => {
  const navigate = useNavigate();
  if (orders.length === 0)
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
        No orders found.
      </Typography>
    );
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.50' }}>
            <TableCell sx={{ fontWeight: 600, py: '6px' }}>#</TableCell>
            <TableCell sx={{ fontWeight: 600, py: '6px' }}>Order No</TableCell>
            <TableCell sx={{ fontWeight: 600, py: '6px' }}>Party</TableCell>
            <TableCell sx={{ fontWeight: 600, py: '6px' }}>Brand</TableCell>
            <TableCell sx={{ fontWeight: 600, py: '6px', textAlign: 'right' }}>Qty</TableCell>
            {showStatus && <TableCell sx={{ fontWeight: 600, py: '6px' }}>Status</TableCell>}
            <TableCell sx={{ fontWeight: 600, py: '6px' }}>Created</TableCell>
            <TableCell sx={{ fontWeight: 600, py: '6px', width: 60 }} />
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((o, i) => (
            <TableRow key={o.orderId} hover sx={{ cursor: 'pointer' }}
              onClick={() => navigate(`/sales-orders/form?id=${encodeOrderId(o.orderId)}`)}>
              <TableCell sx={{ color: 'text.disabled', fontSize: 11 }}>{i + 1}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{o.orderNo}</TableCell>
              <TableCell>{o.party ?? '—'}</TableCell>
              <TableCell>{o.brandName ?? '—'}</TableCell>
              <TableCell sx={{ textAlign: 'right' }}>{o.qty?.toLocaleString() ?? '—'}</TableCell>
              {showStatus && (
                <TableCell>
                  <Chip label={o.currentStatus} size="small" variant="outlined" />
                </TableCell>
              )}
              <TableCell sx={{ whiteSpace: 'nowrap', fontSize: 12, color: 'text.secondary' }}>
                {o.createdDate}
              </TableCell>
              <TableCell>
                <EditIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// ── Admin dashboard ───────────────────────────────────────────────────────────

const AdminDashboardView: React.FC<{ data: AdminDashboard }> = ({ data }) => {
  const navigate = useNavigate();

  const summaryCards = [
    { label: 'Total Orders',    value: data.totalOrders,    icon: <AssignmentIcon />,       bg: '#DBEAFE', color: '#1D4ED8' },
    { label: 'Active Orders',   value: data.totalActive,    icon: <PlaylistAddCheckIcon />, bg: '#DCFCE7', color: '#15803D' },
    { label: 'Dispatched',      value: data.totalDispatched, icon: <CheckCircleIcon />,     bg: '#D1FAE5', color: '#065F46' },
    { label: 'Cancelled',       value: data.totalCancelled,  icon: <CancelIcon />,          bg: '#FEE2E2', color: '#B91C1C' },
  ];

  return (
    <Box>
      {/* Summary stat cards */}
      <Grid container spacing={2} mb={3}>
        {summaryCards.map(c => (
          <Grid item xs={12} sm={6} lg={3} key={c.label}>
            <Card elevation={0} sx={{ border: 1, borderColor: 'divider', height: '100%' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
                  <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: c.bg, color: c.color, display: 'flex' }}>
                    {c.icon}
                  </Box>
                </Stack>
                <Typography variant="h4" fontWeight={700} lineHeight={1}>{c.value}</Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>{c.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Workflow pipeline */}
      <Card elevation={0} sx={{ border: 1, borderColor: 'divider', mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="subtitle1" fontWeight={700} mb={2}>
            Workflow Pipeline
          </Typography>
          <Grid container spacing={1.5}>
            {data.pipeline.map((p, idx) => {
              const cc = chipColor(p.color);
              return (
                <Grid item xs={6} sm={4} md={2} key={p.status}>
                  <Box
                    onClick={() => navigate(`/sales-orders?status=${encodeURIComponent(p.status)}`)}
                    sx={{
                      border: 2,
                      borderColor: TEXT_COLORS[cc],
                      borderRadius: 2,
                      p: 1.5,
                      textAlign: 'center',
                      cursor: 'pointer',
                      bgcolor: BG_COLORS[cc],
                      transition: 'all 0.15s',
                      '&:hover': { opacity: 0.8, transform: 'translateY(-2px)' },
                      position: 'relative',
                    }}
                  >
                    <Typography variant="h4" fontWeight={800} color={TEXT_COLORS[cc]} lineHeight={1}>
                      {p.count}
                    </Typography>
                    <Typography variant="caption" fontWeight={600} color={TEXT_COLORS[cc]}
                      sx={{ lineHeight: 1.2, display: 'block', mt: 0.5 }}>
                      {p.status}
                    </Typography>
                    {idx < data.pipeline.length - 1 && (
                      <ArrowForwardIcon sx={{
                        position: 'absolute', right: -14, top: '50%',
                        transform: 'translateY(-50%)', color: 'text.disabled', fontSize: 16, zIndex: 1,
                      }} />
                    )}
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>

      {/* Recent orders */}
      <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
        <CardContent sx={{ p: 2.5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="subtitle1" fontWeight={700}>Recent Orders</Typography>
            <Button size="small" endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/sales-orders')}>
              View All
            </Button>
          </Stack>
          <PendingTable orders={data.recentOrders} showStatus />
        </CardContent>
      </Card>
    </Box>
  );
};

// ── Role dashboard ────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, { action: string; tip: string }> = {
  QA:         { action: 'Enter PIS Approval Date',                 tip: 'Orders awaiting your PIS approval to proceed.' },
  Designer:   { action: 'Enter Artwork Approval Date',             tip: 'Orders awaiting artwork sign-off.' },
  PPMC:       { action: 'Fill Packing Material dates',             tip: 'Orders awaiting packing material ordering and receipt.' },
  Production: { action: 'Enter Filling Plan Date',                 tip: 'Orders ready for production filling plan entry.' },
  Packing:    { action: 'Enter Packing Plan Date',                 tip: 'Orders awaiting packing plan to begin dispatch prep.' },
  Dispatch:   { action: 'Enter Dispatch Date',                     tip: 'Orders packed and ready to dispatch.' },
};

interface RoleDashboardViewProps { data: RoleDashboard; role: string; }

const RoleDashboardView: React.FC<RoleDashboardViewProps> = ({ data, role }) => {
  const navigate  = useNavigate();
  const meta      = ROLE_LABELS[role] ?? { action: 'Process orders', tip: 'Orders assigned to your stage.' };
  const hasWork   = data.pendingCount > 0;

  return (
    <Box>
      {/* Work-queue highlight card */}
      <Card elevation={0} sx={{
        border: 2,
        borderColor: hasWork ? 'warning.main' : 'success.main',
        borderRadius: 2,
        mb: 3,
        bgcolor: hasWork ? '#FFFBEB' : '#F0FDF4',
      }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={12} sm="auto">
              <Box sx={{
                width: 80, height: 80, borderRadius: 3,
                bgcolor: hasWork ? 'warning.main' : 'success.main',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Typography variant="h3" fontWeight={800} color="white" lineHeight={1}>
                  {data.pendingCount}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm>
              <Typography variant="h6" fontWeight={700} color={hasWork ? 'warning.dark' : 'success.dark'}>
                {hasWork
                  ? `${data.pendingCount} order${data.pendingCount > 1 ? 's' : ''} need${data.pendingCount === 1 ? 's' : ''} your attention`
                  : 'All caught up!'}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>{meta.tip}</Typography>
              <Chip label={data.roleStatus} size="small"
                sx={{ mt: 1, fontWeight: 600, bgcolor: hasWork ? '#FEF3C7' : '#DCFCE7',
                  color: hasWork ? '#92400E' : '#15803D' }} />
            </Grid>
            {hasWork && (
              <Grid item xs={12} sm="auto">
                <Button variant="contained" color="warning" endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/sales-orders')} disableElevation>
                  Go to My Orders
                </Button>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Pending orders list */}
      <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
        <CardContent sx={{ p: 2.5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                My Work Queue — {data.roleStatus}
              </Typography>
              <Typography variant="caption" color="text.secondary">{meta.action}</Typography>
            </Box>
            {hasWork && (
              <Button size="small" endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/sales-orders')}>
                View All
              </Button>
            )}
          </Stack>
          <Divider sx={{ mb: 2 }} />
          <PendingTable orders={data.pendingOrders} />
        </CardContent>
      </Card>
    </Box>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [adminData, setAdminData] = useState<AdminDashboard | null>(null);
  const [roleData,  setRoleData]  = useState<RoleDashboard  | null>(null);
  const [role,      setRole]      = useState('');

  const firstName = user?.firstName || user?.email?.split('@')[0] || 'there';

  useEffect(() => {
    DashboardService.get()
      .then(res => {
        setRole(res.role);
        if (res.admin)      setAdminData(res.admin);
        if (res.role_data)  setRoleData(res.role_data);
      })
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      {/* Welcome header */}
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }}
        justifyContent="space-between" spacing={1} mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700} lineHeight={1.3}>
            Welcome back, {firstName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Typography>
        </Box>
        {user?.roleName && (
          <Chip label={user.roleName} color="primary" variant="outlined"
            sx={{ fontWeight: 600, alignSelf: { xs: 'flex-start', sm: 'center' } }} />
        )}
      </Stack>

      {loading && (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && role === 'Admin' && adminData && (
        <AdminDashboardView data={adminData} />
      )}

      {!loading && !error && role !== 'Admin' && roleData && (
        <RoleDashboardView data={roleData} role={role} />
      )}

      {!loading && !error && !adminData && !roleData && (
        <Alert severity="info">No dashboard data available for your role.</Alert>
      )}
    </Box>
  );
};

export default DashboardPage;
