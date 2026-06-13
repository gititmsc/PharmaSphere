import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import ArrowBackIcon   from '@mui/icons-material/ArrowBack';
import EditIcon        from '@mui/icons-material/Edit';
import SyncAltIcon     from '@mui/icons-material/SyncAlt';
import { useSnackbar } from 'notistack';
import axios           from 'axios';
import { OrderService }      from '@/services/order.service';
import { decodeOrderId, STATUS_COLOR, ALLOWED_TRANSITIONS } from '@/types/order.types';
import type { OrderDetail, OrderStatus } from '@/types/order.types';

// ── Progress stepper statuses (no Cancelled in the main flow) ──────────────────
const FLOW_STATUSES: OrderStatus[] = [
  'Created', 'Artwork Pending', 'QA Pending', 'Production Pending', 'Dispatched',
];

interface FieldRowProps { label: string; value?: string | number | null; }
const FR: React.FC<FieldRowProps> = ({ label, value }) => (
  <Box>
    <Typography variant="caption" color="text.secondary" lineHeight={1.2} display="block">{label}</Typography>
    <Typography variant="body2" fontWeight={500}>{value ?? <span style={{ color: '#9e9e9e' }}>—</span>}</Typography>
  </Box>
);

const SalesOrderDetailPage: React.FC = () => {
  const { id: encodedId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const orderId = encodedId ? decodeOrderId(encodedId) : null;

  const [order, setOrder]         = useState<OrderDetail | null>(null);
  const [loading, setLoading]     = useState(true);
  const [statusOpen, setStatusOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [remarks, setRemarks]     = useState('');
  const [changing, setChanging]   = useState(false);

  const load = () => {
    if (!orderId) return;
    setLoading(true);
    OrderService.getOrderById(orderId)
      .then(setOrder)
      .catch(() => { enqueueSnackbar('Failed to load order.', { variant: 'error', autoHideDuration: 10000 }); navigate('/sales-orders'); })
      .finally(() => setLoading(false));
  };

  useEffect(load, [orderId]);  // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusChange = async () => {
    if (!orderId || !newStatus) return;
    setChanging(true);
    try {
      await OrderService.changeStatus(orderId, newStatus, remarks || undefined);
      enqueueSnackbar(`Status changed to "${newStatus}".`, {
        variant: 'success', autoHideDuration: 10000, anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
      setStatusOpen(false);
      setNewStatus('');
      setRemarks('');
      load();
    } catch (err) {
      let msg = 'Failed to change status.';
      if (axios.isAxiosError(err)) msg = err.response?.data?.message ?? msg;
      enqueueSnackbar(msg, { variant: 'error', autoHideDuration: 10000, anchorOrigin: { vertical: 'top', horizontal: 'right' } });
    } finally {
      setChanging(false);
    }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
      <CircularProgress />
    </Box>
  );

  if (!order) return null;

  const allowed = ALLOWED_TRANSITIONS[order.currentStatus as OrderStatus] ?? [];
  const flowStep = FLOW_STATUSES.indexOf(order.currentStatus as OrderStatus);

  const statusChipColor = STATUS_COLOR[order.currentStatus as OrderStatus] ?? 'default';

  return (
    <Box>
      {/* ── Header ── */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
        <Stack direction="row" alignItems="center" gap={1.5}>
          <IconButton onClick={() => navigate('/sales-orders')} size="small" sx={{ border: 1, borderColor: 'divider' }}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Box>
            <Stack direction="row" alignItems="center" gap={1}>
              <Typography variant="subtitle1" fontWeight={700} lineHeight={1.3}>{order.orderNo}</Typography>
              <Chip label={order.currentStatus} size="small" color={statusChipColor}
                sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }} />
              {!order.isActive && <Chip label="Deleted" size="small" color="error" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />}
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Sales Orders › {order.orderNo}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" gap={1}>
          {allowed.length > 0 && (
            <Button size="small" variant="outlined" startIcon={<SyncAltIcon />}
              onClick={() => { setNewStatus(allowed[0]); setStatusOpen(true); }}>
              Change Status
            </Button>
          )}
          <Tooltip title="Edit Order">
            <IconButton size="small" sx={{ border: 1, borderColor: 'divider' }}
              onClick={() => navigate(`/sales-orders/form?id=${encodedId}`)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* ── Status Stepper ── */}
      {order.currentStatus !== 'Cancelled' && (
        <Card elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2, mb: 1.5, p: 2 }}>
          <Stepper activeStep={Math.max(flowStep, 0)} alternativeLabel>
            {FLOW_STATUSES.map((s, i) => (
              <Step key={s} completed={flowStep > i}>
                <StepLabel>{s}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Card>
      )}

      {order.currentStatus === 'Cancelled' && (
        <Alert severity="error" sx={{ mb: 1.5 }}>This order has been <strong>Cancelled</strong>.</Alert>
      )}

      {/* ── Info Cards ── */}
      <Grid container spacing={1.5}>

        {/* General Info */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2, height: '100%' }}>
            <CardHeader title="General Information" titleTypographyProps={{ variant: 'body2', fontWeight: 700 }}
              sx={{ py: 1, px: 2, borderBottom: 1, borderColor: 'divider' }} />
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Grid container spacing={1.5}>
                <Grid item xs={6}><FR label="Order No"    value={order.orderNo} /></Grid>
                <Grid item xs={6}><FR label="Order Date"  value={order.orderDate} /></Grid>
                <Grid item xs={6}><FR label="Party"       value={order.party} /></Grid>
                <Grid item xs={6}><FR label="Brand Name"  value={order.brandName} /></Grid>
                <Grid item xs={12}><FR label="Composition" value={order.composition} /></Grid>
                <Grid item xs={4}><FR label="Qty"         value={order.qty?.toLocaleString()} /></Grid>
                <Grid item xs={4}><FR label="Shelf Life"  value={order.shelfLifeMonths} /></Grid>
                <Grid item xs={4}><FR label="Make"        value={order.make} /></Grid>
                <Grid item xs={4}><FR label="Rate (₹)"    value={order.rate != null ? `₹${order.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : null} /></Grid>
                <Grid item xs={4}><FR label="MRP (₹)"     value={order.mrp != null ? `₹${order.mrp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : null} /></Grid>
                <Grid item xs={4}><FR label="Amount (₹)"  value={order.amount != null ? `₹${order.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : null} /></Grid>
                <Grid item xs={6}><FR label="Payment Terms"      value={order.paymentTerms} /></Grid>
                <Grid item xs={6}><FR label="Delivery Schedule"  value={order.deliverySchedule} /></Grid>
                <Grid item xs={6}><FR label="Admin Remarks"      value={order.adminRemarks} /></Grid>
                <Grid item xs={6}><FR label="Other Remarks"      value={order.otherRemarks} /></Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Packaging Material */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2, height: '100%' }}>
            <CardHeader title="Packaging Material" titleTypographyProps={{ variant: 'body2', fontWeight: 700 }}
              sx={{ py: 1, px: 2, borderBottom: 1, borderColor: 'divider' }} />
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Grid container spacing={1.5}>
                <Grid item xs={6}><FR label="Vial"             value={order.vial} /></Grid>
                <Grid item xs={6}><FR label="Seal Colour"      value={order.sealColour} /></Grid>
                <Grid item xs={6}><FR label="WFI"              value={order.wfi} /></Grid>
                <Grid item xs={6}><FR label="Label"            value={order.label} /></Grid>
                <Grid item xs={6}><FR label="Mono Box"         value={order.monoBox} /></Grid>
                <Grid item xs={6}><FR label="Tray"             value={order.tray} /></Grid>
                <Grid item xs={6}><FR label="Leaflet"          value={order.leaflet} /></Grid>
                <Grid item xs={6}><FR label="Syringe & Needle" value={order.syringeAndNeedle} /></Grid>
                <Grid item xs={6}><FR label="Shrink"           value={order.shrink} /></Grid>
                <Grid item xs={6}><FR label="Shipper"          value={order.shipper} /></Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* QA Information */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
            <CardHeader title="QA Information" titleTypographyProps={{ variant: 'body2', fontWeight: 700 }}
              sx={{ py: 1, px: 2, borderBottom: 1, borderColor: 'divider' }} />
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Grid container spacing={1.5}>
                <Grid item xs={6}><FR label="PIS Approval Date"          value={order.pisApprovalDate} /></Grid>
                <Grid item xs={6}><FR label="Sanolet Party Artwork Date" value={order.sanoletPartyArtworkApprovalDate} /></Grid>
                <Grid item xs={6}><FR label="MonoBox Vendor Approval"    value={order.monoBoxSupplyVendorApprovalDate} /></Grid>
                <Grid item xs={6}><FR label="Label Vendor Approval"      value={order.labelSupplyVendorApprovalDate} /></Grid>
                <Grid item xs={6}><FR label="Insert Vendor Approval"     value={order.insertSupplyVendorApprovalDate} /></Grid>
                <Grid item xs={6}><FR label="Tray Vendor Approval"       value={order.traySupplyVendorApprovalDate} /></Grid>
                <Grid item xs={6}><FR label="Shipper Vendor Approval"    value={order.shipperSupplyVendorApprovalDate} /></Grid>
                <Grid item xs={12}><FR label="QA Remarks"                value={order.qaRemarks} /></Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Production Info */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
            <CardHeader title="Production Information" titleTypographyProps={{ variant: 'body2', fontWeight: 700 }}
              sx={{ py: 1, px: 2, borderBottom: 1, borderColor: 'divider' }} />
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Grid container spacing={1.5}>
                <Grid item xs={6}><FR label="Production Mono Box" value={order.productionMonoBox} /></Grid>
                <Grid item xs={6}><FR label="Production Label"    value={order.productionLabel} /></Grid>
                <Grid item xs={6}><FR label="Production Insert"   value={order.productionInsert} /></Grid>
                <Grid item xs={6}><FR label="Production Tray"     value={order.productionTray} /></Grid>
                <Grid item xs={6}><FR label="Production Shipper"  value={order.productionShipper} /></Grid>
                <Grid item xs={6}><FR label="Filling Plan"        value={order.fillingPlan} /></Grid>
                <Grid item xs={6}><FR label="Packing Plan"        value={order.packingPlan} /></Grid>
                <Grid item xs={6}><FR label="Sterility 14 Days"   value={order.sterility14DaysDate} /></Grid>
                <Grid item xs={6}><FR label="Dispatch Date"       value={order.dispatchDate} /></Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Status History */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
            <CardHeader title="Status History" titleTypographyProps={{ variant: 'body2', fontWeight: 700 }}
              sx={{ py: 1, px: 2, borderBottom: 1, borderColor: 'divider' }} />
            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
              {order.statusHistory.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>No history.</Typography>
              ) : (
                <Box sx={{ position: 'relative', px: 2, py: 1.5 }}>
                  {order.statusHistory.map((h, i) => (
                    <Stack key={h.historyId} direction="row" gap={1.5} mb={i < order.statusHistory.length - 1 ? 1.5 : 0}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, flexShrink: 0 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0, mt: 0.5 }} />
                        {i < order.statusHistory.length - 1 && (
                          <Box sx={{ width: 2, flex: 1, bgcolor: 'divider', minHeight: 16, mt: 0.5 }} />
                        )}
                      </Box>
                      <Box pb={i < order.statusHistory.length - 1 ? 0.5 : 0}>
                        <Stack direction="row" alignItems="center" gap={0.75} flexWrap="wrap">
                          {h.fromStatus && (
                            <>
                              <Chip label={h.fromStatus} size="small" variant="outlined"
                                sx={{ height: 18, fontSize: '0.68rem' }} />
                              <Typography variant="caption" color="text.secondary">→</Typography>
                            </>
                          )}
                          <Chip label={h.toStatus} size="small"
                            color={STATUS_COLOR[h.toStatus as OrderStatus] ?? 'default'}
                            sx={{ height: 18, fontSize: '0.68rem' }} />
                        </Stack>
                        <Typography variant="caption" color="text.secondary" display="block" mt={0.25}>
                          {h.changedBy} · {h.changedDate}
                        </Typography>
                        {h.remarks && (
                          <Typography variant="caption" color="text.secondary" fontStyle="italic">
                            "{h.remarks}"
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Audit Log */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
            <CardHeader title="Audit Log" titleTypographyProps={{ variant: 'body2', fontWeight: 700 }}
              sx={{ py: 1, px: 2, borderBottom: 1, borderColor: 'divider' }} />
            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
              <TableContainer sx={{ maxHeight: 320 }}>
                <Table size="small" stickyHeader sx={{ '& .MuiTableCell-root': { py: 0.5, px: 1.25, fontSize: '0.775rem' } }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Field</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Old</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>New</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>By / Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.auditLogs.length === 0 ? (
                      <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3 }}>No logs.</TableCell></TableRow>
                    ) : order.auditLogs.map(a => (
                      <TableRow key={a.auditLogId} hover>
                        <TableCell>
                          <Chip label={a.action} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.68rem' }} />
                        </TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{a.fieldName ?? '—'}</TableCell>
                        <TableCell sx={{ color: 'text.secondary', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.oldValue ?? '—'}</TableCell>
                        <TableCell sx={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.newValue ?? '—'}</TableCell>
                        <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                          {a.changedBy}<br />
                          <Typography component="span" variant="caption" color="text.disabled">{a.changedDate}</Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Audit footer */}
        <Grid item xs={12}>
          <Stack direction="row" gap={3} sx={{ px: 0.5, color: 'text.secondary' }}>
            <Typography variant="caption">Created by <strong>{order.createdBy ?? '—'}</strong> on {order.createdDate}</Typography>
            {order.updatedBy && (
              <Typography variant="caption">Last updated by <strong>{order.updatedBy}</strong> on {order.updatedDate}</Typography>
            )}
          </Stack>
        </Grid>
      </Grid>

      {/* ── Change Status Dialog ── */}
      <Dialog open={statusOpen} onClose={() => !changing && setStatusOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>Change Status</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Current status: <strong>{order.currentStatus}</strong>
          </DialogContentText>
          <Stack gap={2}>
            <Select size="small" fullWidth value={newStatus} onChange={e => setNewStatus(e.target.value)}>
              {allowed.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
            <TextField
              size="small" fullWidth multiline rows={2}
              label="Remarks (optional)" value={remarks}
              onChange={e => setRemarks(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button variant="outlined" color="inherit" onClick={() => setStatusOpen(false)} disabled={changing}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleStatusChange} disabled={changing || !newStatus}
            startIcon={changing ? <CircularProgress size={14} color="inherit" /> : undefined}
            disableElevation>
            {changing ? 'Changing…' : 'Change Status'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SalesOrderDetailPage;
