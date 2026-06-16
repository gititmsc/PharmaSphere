import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Popover,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import SearchIcon            from '@mui/icons-material/Search';
import AddIcon               from '@mui/icons-material/Add';
import EditIcon              from '@mui/icons-material/Edit';
import DeleteOutlineIcon     from '@mui/icons-material/DeleteOutline';
import ViewColumnIcon        from '@mui/icons-material/ViewColumn';
import FilterAltIcon         from '@mui/icons-material/FilterAlt';

import { useNavigate }       from 'react-router-dom';
import { useSnackbar }       from 'notistack';
import axios                 from 'axios';
import { useAuth }           from '@/contexts/AuthContext';
import { OrderService }      from '@/services/order.service';
import { encodeOrderId }     from '@/types/order.types';
import type { OrderListItem, SortField, SortDir } from '@/types/order.types';
import { useOrderStatuses }  from '@/hooks/useOrderStatuses';
import { fmtDate, fmtDateTime }                        from '@/utils/date.utils';

const PAGE_SIZES = [10, 25, 50, 100];

interface ColDef { id: string; label: string; sortKey?: string; width?: number | string; align?: 'left' | 'right' | 'center'; }

const ALL_COLS: ColDef[] = [
  { id: 'orderNo',     label: 'Order No',     sortKey: 'orderNo',     width: 130 },
  { id: 'orderDate',   label: 'Order Date',   sortKey: 'orderDate',   width: 110 },
  { id: 'party',       label: 'Party',        sortKey: 'party'                   },
  { id: 'brandName',   label: 'Brand Name',   sortKey: 'brandName'               },
  { id: 'qty',         label: 'Qty',          sortKey: 'qty',         width: 80,  align: 'right' },
  { id: 'amount',      label: 'Amount (₹)',                           width: 110, align: 'right' },
  { id: 'status',      label: 'Status',       sortKey: 'status',      width: 150 },
  { id: 'createdBy',   label: 'Created By',                           width: 120 },
  { id: 'createdDate', label: 'Created',      sortKey: 'createdDate', width: 130 },
  { id: 'updatedDate', label: 'Updated',      sortKey: 'updatedDate', width: 130 },
];

const DEFAULT_VISIBLE = new Set(['orderNo','orderDate','party','brandName','qty','amount','status','createdBy','createdDate']);

const SalesOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const isAdmin = user?.roleName === 'Admin';
  const { statuses } = useOrderStatuses();

  // Amount column is restricted to Admin only
  const availableCols = isAdmin ? ALL_COLS : ALL_COLS.filter(c => c.id !== 'amount');
  const defaultVisible = isAdmin
    ? new Set(DEFAULT_VISIBLE)
    : new Set([...DEFAULT_VISIBLE].filter(id => id !== 'amount'));

  const [rows, setRows]             = useState<OrderListItem[]>([]);
  const [totalCount, setTotal]      = useState(0);
  const [loading, setLoading]       = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const [toDelete, setToDelete]     = useState<OrderListItem | null>(null);

  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState('');
  const [dateFrom, setDateFrom]     = useState('');
  const [dateTo, setDateTo]         = useState('');

  const [sortBy, setSortBy]         = useState<SortField>('createdDate');
  const [sortDir, setSortDir]       = useState<SortDir>('desc');
  const [page, setPage]             = useState(1);
  const [pageSize, setPageSize]     = useState(10);

  const [visibleCols, setVisible]   = useState<Set<string>>(defaultVisible);
  const [colAnchor, setColAnchor]   = useState<HTMLElement | null>(null);

  const debounce = useRef<ReturnType<typeof setTimeout>>();

  const fetchOrders = useCallback(async (p: {
    search: string; statusFilter: string; dateFrom: string; dateTo: string;
    sortBy: SortField; sortDir: SortDir; page: number; pageSize: number;
  }) => {
    setLoading(true);
    try {
      const res = await OrderService.getOrders({
        search:   p.search   || undefined,
        status:   p.statusFilter || undefined,
        dateFrom: p.dateFrom || undefined,
        dateTo:   p.dateTo   || undefined,
        sortBy:   p.sortBy,
        sortDir:  p.sortDir,
        page:     p.page,
        pageSize: p.pageSize,
      });
      setRows(res.items);
      setTotal(res.totalCount);
    } catch {
      // global interceptor handles 401
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      fetchOrders({ search, statusFilter, dateFrom, dateTo, sortBy, sortDir, page, pageSize });
    }, 300);
    return () => clearTimeout(debounce.current);
  }, [search, statusFilter, dateFrom, dateTo, sortBy, sortDir, page, pageSize, fetchOrders]);

  const handleSort = (key: SortField) => {
    if (sortBy === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(key); setSortDir('asc'); }
    setPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await OrderService.deleteOrder(toDelete.orderId);
      enqueueSnackbar(`Order "${toDelete.orderNo}" deleted.`, {
        variant: 'success', autoHideDuration: 10000, anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
      setToDelete(null);
      fetchOrders({ search, statusFilter, dateFrom, dateTo, sortBy, sortDir, page, pageSize });
    } catch (err) {
      let msg = 'Failed to delete order.';
      if (axios.isAxiosError(err)) msg = err.response?.data?.message ?? msg;
      enqueueSnackbar(msg, { variant: 'error', autoHideDuration: 10000, anchorOrigin: { vertical: 'top', horizontal: 'right' } });
    } finally {
      setDeleting(false);
    }
  };

  const toggleCol = (id: string) => {
    setVisible(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const visibleDefs = availableCols.filter(c => visibleCols.has(c.id));

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const rangeStart = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd   = Math.min(page * pageSize, totalCount);

  return (
    <Box>
      {/* ── Header ── */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
        <Stack direction="row" alignItems="baseline" gap={1.5}>
          <Typography variant="subtitle1" fontWeight={700}>Sales Orders</Typography>
          <Typography variant="body2" color="text.secondary">
            {totalCount} {totalCount === 1 ? 'order' : 'orders'}
          </Typography>
        </Stack>
        <Stack direction="row" gap={1}>
          {isAdmin && (
            <Button variant="contained" size="small" startIcon={<AddIcon />}
              onClick={() => navigate('/sales-orders/form')} disableElevation>
              Add Order
            </Button>
          )}
        </Stack>
      </Stack>

      {/* ── Filters ── */}
      <Card elevation={0} sx={{ border: 1, borderColor: 'divider', p: 1.5, mb: 1.5, borderRadius: 2 }}>
        {/* Row 1: search + icon actions */}
        <Stack direction="row" gap={1} alignItems="center" mb={1.5}>
          <TextField
            size="small" placeholder="Search order no, party, brand…"
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" color="action" /></InputAdornment> }}
            sx={{ flexGrow: 1 }}
          />
          <Tooltip title="Toggle columns">
            <IconButton size="small" onClick={e => setColAnchor(e.currentTarget)} sx={{ border: 1, borderColor: 'divider', flexShrink: 0 }}>
              <ViewColumnIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {(search || (isAdmin && statusFilter) || dateFrom || dateTo) && (
            <Tooltip title="Clear filters">
              <IconButton size="small" color="error"
                onClick={() => { setSearch(''); setStatus(''); setDateFrom(''); setDateTo(''); setPage(1); }}
                sx={{ border: 1, borderColor: 'divider', flexShrink: 0 }}>
                <FilterAltIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>

        {/* Row 2: filter fields — flex-wrap so they pair on mobile */}
        <Stack direction="row" flexWrap="wrap" gap={1.5}>
          {isAdmin && (
            <FormControl size="small" sx={{ flex: '1 1 150px' }}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={e => { setStatus(e.target.value); setPage(1); }}>
                <MenuItem value="">All Statuses</MenuItem>
                {statuses.map(s => <MenuItem key={s.statusName} value={s.statusName}>{s.statusName}</MenuItem>)}
              </Select>
            </FormControl>
          )}
          <TextField
            size="small" label="From Date" type="date" value={dateFrom}
            onChange={e => { setDateFrom(e.target.value); setPage(1); }}
            InputLabelProps={{ shrink: true }} sx={{ flex: '1 1 150px' }}
          />
          <TextField
            size="small" label="To Date" type="date" value={dateTo}
            onChange={e => { setDateTo(e.target.value); setPage(1); }}
            InputLabelProps={{ shrink: true }} sx={{ flex: '1 1 150px' }}
          />
        </Stack>
      </Card>

      {/* ── Column Visibility Popover ── */}
      <Popover
        open={Boolean(colAnchor)} anchorEl={colAnchor}
        onClose={() => setColAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { p: 1.5, minWidth: 180 } }}
      >
        <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ px: 0.5, display: 'block', mb: 0.5 }}>
          VISIBLE COLUMNS
        </Typography>
        {availableCols.map(c => (
          <FormControlLabel
            key={c.id}
            control={<Checkbox size="small" checked={visibleCols.has(c.id)} onChange={() => toggleCol(c.id)} />}
            label={<Typography variant="body2">{c.label}</Typography>}
            sx={{ display: 'flex', m: 0, '& .MuiFormControlLabel-label': { lineHeight: 1.5 } }}
          />
        ))}
      </Popover>

      {/* ── Table ── */}
      <Card elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
        <TableContainer>
          <Table size="small" sx={{ '& .MuiTableCell-root': { py: 0.6, px: 1.25, fontSize: '0.8125rem' } }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell width={40} sx={{ color: 'text.secondary', fontSize: 11, py: '6px !important' }}>#</TableCell>
                {visibleDefs.map(c => (
                  <TableCell key={c.id} width={c.width} align={c.align}
                    sx={{ fontWeight: 600, py: '6px !important', whiteSpace: 'nowrap' }}>
                    {c.sortKey ? (
                      <TableSortLabel
                        active={sortBy === c.sortKey}
                        direction={sortBy === c.sortKey ? sortDir : 'asc'}
                        onClick={() => handleSort(c.sortKey as SortField)}>
                        {c.label}
                      </TableSortLabel>
                    ) : c.label}
                  </TableCell>
                ))}
                <TableCell width={96} sx={{ py: '6px !important' }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={visibleDefs.length + 2} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={visibleDefs.length + 2} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.secondary">No orders found</Typography>
                  </TableCell>
                </TableRow>
              ) : rows.map((row, idx) => (
                <TableRow key={row.orderId} hover
                  onClick={() => navigate(`/sales-orders/form?id=${encodeOrderId(row.orderId)}`)}
                  sx={{ cursor: 'pointer' }}>
                  <TableCell sx={{ color: 'text.disabled', fontSize: 11 }}>{rangeStart + idx}</TableCell>
                  {visibleDefs.map(c => (
                    <TableCell key={c.id} align={c.align}>
                      {c.id === 'status' ? (
                        <Chip
                          label={row.currentStatus}
                          size="small"
                          color={statuses.find(s => s.statusName === row.currentStatus)?.color ?? 'default'}
                          sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
                        />
                      ) : c.id === 'orderNo'     ? row.orderNo
                        : c.id === 'orderDate'   ? fmtDate(row.orderDate)
                        : c.id === 'party'       ? (row.party ?? '—')
                        : c.id === 'brandName'   ? (row.brandName ?? '—')
                        : c.id === 'qty'         ? (row.qty?.toLocaleString() ?? '—')
                        : c.id === 'amount'      ? (row.amount != null ? `₹${row.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—')
                        : c.id === 'createdBy'   ? (row.createdBy ?? '—')
                        : c.id === 'createdDate' ? fmtDateTime(row.createdDate)
                        : c.id === 'updatedDate' ? fmtDateTime(row.updatedDate)
                        : null}
                    </TableCell>
                  ))}
                  <TableCell align="right" onClick={e => e.stopPropagation()}>
                    <Stack direction="row" justifyContent="flex-end" gap={0}>
                      <Tooltip title="Edit">
                        <IconButton size="small"
                          onClick={() => navigate(`/sales-orders/form?id=${encodeOrderId(row.orderId)}`)}>
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      {isAdmin && (
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => setToDelete(row)}>
                            <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* ── Footer ── */}
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center"
          justifyContent="space-between" px={2} py={1} gap={1.5}
          sx={{ borderTop: 1, borderColor: 'divider' }}>
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary" noWrap>Rows:</Typography>
            <Select size="small" value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
              sx={{ minWidth: 68, fontSize: '0.8125rem' }}>
              {PAGE_SIZES.map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
            </Select>
          </Stack>
          <Typography variant="body2" color="text.secondary" noWrap>
            {totalCount === 0 ? '0' : `${rangeStart}–${rangeEnd}`} of {totalCount}
          </Typography>
          <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)}
            color="primary" size="small" showFirstButton showLastButton />
        </Stack>
      </Card>

      {/* ── Delete Confirmation ── */}
      <Dialog open={toDelete !== null} onClose={() => !deleting && setToDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>Delete Order</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete order <strong>{toDelete?.orderNo}</strong>?
            The order will be soft-deleted and can be restored by an Admin.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button variant="outlined" color="inherit" onClick={() => setToDelete(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleDeleteConfirm} disabled={deleting}
            startIcon={deleting ? <CircularProgress size={14} color="inherit" /> : undefined}
            disableElevation>
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SalesOrdersPage;
