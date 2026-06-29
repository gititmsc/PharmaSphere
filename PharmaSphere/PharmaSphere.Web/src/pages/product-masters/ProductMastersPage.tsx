import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
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
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { ProductMasterService } from '@/services/productMaster.service';
import { encodeProductId } from '@/types/productMaster.types';
import type { ProductMasterListItem } from '@/types/productMaster.types';

type SortField = 'brandName' | 'genericName' | 'vial' | 'sealColor' | 'monoBox';
type SortDir   = 'asc' | 'desc';

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

const ProductMastersPage: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [products, setProducts]     = useState<ProductMasterListItem[]>([]);
  const [brandNames, setBrandNames] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading]       = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const [toDelete, setToDelete]     = useState<ProductMasterListItem | null>(null);

  const [search, setSearch]           = useState('');
  const [brandFilter, setBrandFilter] = useState('');

  const [sortBy,  setSortBy]  = useState<SortField>('brandName');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const fetchProducts = useCallback(
    async (params: {
      search: string; brandFilter: string;
      sortBy: SortField; sortDir: SortDir;
      page: number; pageSize: number;
    }) => {
      setLoading(true);
      try {
        const result = await ProductMasterService.getProducts({
          search:    params.search     || undefined,
          brandName: params.brandFilter || undefined,
          sortBy:    params.sortBy,
          sortDir:   params.sortDir,
          page:      params.page,
          pageSize:  params.pageSize,
        });
        setProducts(result.items);
        setTotalCount(result.totalCount);
      } catch {
        // errors surfaced by global axios interceptor
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    ProductMasterService.getBrandNames().then(setBrandNames).catch(() => {});
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchProducts({ search, brandFilter, sortBy, sortDir, page, pageSize });
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search, brandFilter, sortBy, sortDir, page, pageSize, fetchProducts]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(field); setSortDir('asc'); }
    setPage(1);
  };

  const handlePageSize = (value: number) => {
    setPageSize(value);
    setPage(1);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await ProductMasterService.delete(toDelete.id);
      enqueueSnackbar(`"${toDelete.brandName}" deleted successfully.`, {
        variant: 'success', autoHideDuration: 10000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
      setToDelete(null);
      fetchProducts({ search, brandFilter, sortBy, sortDir, page, pageSize });
      ProductMasterService.getBrandNames().then(setBrandNames).catch(() => {});
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? err.message)
        : 'Delete failed.';
      enqueueSnackbar(msg, {
        variant: 'error', autoHideDuration: 10000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const rangeStart = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd   = Math.min(page * pageSize, totalCount);

  return (
    <Box>
      {/* ── Header ── */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Stack direction="row" alignItems="baseline" gap={1.5}>
          <Typography variant="h6" fontWeight={700}>Product Master</Typography>
          <Typography variant="body2" color="text.secondary">
            {totalCount} {totalCount === 1 ? 'product' : 'products'}
          </Typography>
        </Stack>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => navigate('/product-masters/new')}
          disableElevation
        >
          Add Product
        </Button>
      </Stack>

      {/* ── Filters ── */}
      <Card elevation={0} sx={{ border: 1, borderColor: 'divider', p: 2, mb: 2, borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
          <TextField
            size="small"
            placeholder="Search products…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, minWidth: 220 }}
          />

          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>Filter by Brand Name</InputLabel>
            <Select
              value={brandFilter}
              label="Filter by Brand Name"
              onChange={(e) => { setBrandFilter(e.target.value); setPage(1); }}
            >
              <MenuItem value="">All Brands</MenuItem>
              {brandNames.map((n) => (
                <MenuItem key={n} value={n}>{n}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Card>

      {/* ── Table ── */}
      <Card elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                {(
                  [
                    { field: 'brandName',   label: 'Brand Name'   },
                    { field: 'genericName', label: 'Generic Name' },
                    { field: 'vial',        label: 'Vial'         },
                    { field: 'sealColor',   label: 'Seal Color'   },
                    { field: 'monoBox',     label: 'Mono Box'     },
                  ] as { field: SortField; label: string }[]
                ).map(({ field, label }) => (
                  <TableCell key={field} sx={{ fontWeight: 600 }}>
                    <TableSortLabel
                      active={sortBy === field}
                      direction={sortBy === field ? sortDir : 'asc'}
                      onClick={() => handleSort(field)}
                    >
                      {label}
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell sx={{ fontWeight: 600, width: 100 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              )}
              {!loading && products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">No products found.</Typography>
                  </TableCell>
                </TableRow>
              )}
              {!loading && products.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>{p.brandName}</TableCell>
                  <TableCell>{p.genericName}</TableCell>
                  <TableCell>{p.vial}</TableCell>
                  <TableCell>{p.sealColor}</TableCell>
                  <TableCell>{p.monoBox}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" justifyContent="center">
                      <Tooltip title="Edit product">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/product-masters/${encodeProductId(p.id)}`)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete product">
                        <IconButton size="small" color="error" onClick={() => setToDelete(p)}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* ── Footer ── */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems="center"
          justifyContent="space-between"
          px={2}
          py={1.5}
          gap={2}
          sx={{ borderTop: 1, borderColor: 'divider' }}
        >
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary" noWrap>
              Rows per page:
            </Typography>
            <Select
              size="small"
              value={pageSize}
              onChange={(e) => handlePageSize(Number(e.target.value))}
              sx={{ minWidth: 72 }}
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <MenuItem key={n} value={n}>{n}</MenuItem>
              ))}
            </Select>
          </Stack>

          <Typography variant="body2" color="text.secondary" noWrap>
            {totalCount === 0 ? '0' : `${rangeStart}–${rangeEnd}`} of {totalCount}
          </Typography>

          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, p) => setPage(p)}
            color="primary"
            size="small"
            showFirstButton
            showLastButton
          />
        </Stack>
      </Card>

      {/* ── Delete confirmation ── */}
      <Dialog open={!!toDelete} onClose={() => !deleting && setToDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Product</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{' '}
            <strong>{toDelete?.brandName}</strong>?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => setToDelete(null)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDelete}
            disabled={deleting}
          >
            {deleting ? <CircularProgress size={18} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductMastersPage;
