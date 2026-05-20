import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
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
import { UserService } from '@/services/user.service';
import { encodeUserId } from '@/types/user.types';
import type { UserListItem, RoleOption, SortField, SortDir } from '@/types/user.types';

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

const AVATAR_COLORS = [
  '#1565C0', '#388E3C', '#7B1FA2', '#F57C00',
  '#D32F2F', '#0097A7', '#5D4037', '#455A64',
];

function getAvatarColor(userId: number) {
  return AVATAR_COLORS[userId % AVATAR_COLORS.length];
}

function getUserInitials(user: UserListItem) {
  const f = user.firstName?.[0] ?? '';
  const l = user.lastName?.[0] ?? '';
  return (f + l).toUpperCase() || user.email[0].toUpperCase();
}

const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [users, setUsers]           = useState<UserListItem[]>([]);
  const [roles, setRoles]           = useState<RoleOption[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading]       = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserListItem | null>(null);

  const [search, setSearch]           = useState('');
  const [roleFilter, setRoleFilter]   = useState<number | ''>('');
  const [statusFilter, setStatusFilter] = useState<boolean | ''>('');

  const [sortBy, setSortBy]   = useState<SortField>('email');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const fetchUsers = useCallback(
    async (params: {
      search: string;
      roleFilter: number | '';
      statusFilter: boolean | '';
      sortBy: SortField;
      sortDir: SortDir;
      page: number;
      pageSize: number;
    }) => {
      setLoading(true);
      try {
        const result = await UserService.getUsers({
          search:   params.search || undefined,
          roleId:   params.roleFilter || undefined,
          isActive: params.statusFilter === '' ? undefined : params.statusFilter,
          sortBy:   params.sortBy,
          sortDir:  params.sortDir,
          page:     params.page,
          pageSize: params.pageSize,
        });
        setUsers(result.items);
        setTotalCount(result.totalCount);
      } catch {
        // errors surfaced by the global axios interceptor
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    UserService.getRoles().then(setRoles).catch(() => {});
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchUsers({ search, roleFilter, statusFilter, sortBy, sortDir, page, pageSize });
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search, roleFilter, statusFilter, sortBy, sortDir, page, pageSize, fetchUsers]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
    setPage(1);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleRoleFilter = (value: number | '') => {
    setRoleFilter(value);
    setPage(1);
  };

  const handleStatusFilter = (value: boolean | '') => {
    setStatusFilter(value);
    setPage(1);
  };

  const handlePageSize = (value: number) => {
    setPageSize(value);
    setPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      await UserService.deleteUser(userToDelete.userId);
      enqueueSnackbar(
        `User "${userToDelete.firstName || userToDelete.email}" deleted successfully.`,
        { variant: 'success', autoHideDuration: 10000, anchorOrigin: { vertical: 'top', horizontal: 'right' } },
      );
      setUserToDelete(null);
      fetchUsers({ search, roleFilter, statusFilter, sortBy, sortDir, page, pageSize });
    } catch (err) {
      let message = 'Failed to delete user.';
      if (axios.isAxiosError(err)) message = err.response?.data?.message ?? message;
      enqueueSnackbar(message, { variant: 'error', autoHideDuration: 10000, anchorOrigin: { vertical: 'top', horizontal: 'right' } });
    } finally {
      setDeleting(false);
    }
  };

  const totalPages  = Math.max(1, Math.ceil(totalCount / pageSize));
  const rangeStart  = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd    = Math.min(page * pageSize, totalCount);

  return (
    <Box>
      {/* ── Header ── */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Stack direction="row" alignItems="baseline" gap={1.5}>
          <Typography variant="h6" fontWeight={700}>Users</Typography>
          <Typography variant="body2" color="text.secondary">
            {totalCount} {totalCount === 1 ? 'user' : 'users'}
          </Typography>
        </Stack>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => navigate('/users/form')}
          disableElevation
        >
          Add User
        </Button>
      </Stack>

      {/* ── Filters ── */}
      <Card
        elevation={0}
        sx={{ border: 1, borderColor: 'divider', p: 2, mb: 2, borderRadius: 2 }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
          <TextField
            size="small"
            placeholder="Search by name or email…"
            value={search}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, minWidth: 220 }}
          />

          <FormControl size="small" sx={{ minWidth: 170 }}>
            <InputLabel>Filter by Role</InputLabel>
            <Select
              value={roleFilter}
              label="Filter by Role"
              onChange={(e) => handleRoleFilter(e.target.value as number | '')}
            >
              <MenuItem value="">All Roles</MenuItem>
              {roles.map((r) => (
                <MenuItem key={r.roleId} value={r.roleId}>
                  {r.roleName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter as string}
              label="Status"
              onChange={(e) => {
                const v = e.target.value;
                handleStatusFilter(v === '' ? '' : v === 'true');
              }}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
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
                <TableCell width={48} sx={{ color: 'text.secondary', fontSize: 12 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  <TableSortLabel
                    active={sortBy === 'firstName'}
                    direction={sortBy === 'firstName' ? sortDir : 'asc'}
                    onClick={() => handleSort('firstName')}
                  >
                    First Name
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  <TableSortLabel
                    active={sortBy === 'lastName'}
                    direction={sortBy === 'lastName' ? sortDir : 'asc'}
                    onClick={() => handleSort('lastName')}
                  >
                    Last Name
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  <TableSortLabel
                    active={sortBy === 'email'}
                    direction={sortBy === 'email' ? sortDir : 'asc'}
                    onClick={() => handleSort('email')}
                  >
                    Email
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell width={64} />
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography variant="body2" color="text.secondary">
                      No users found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user, index) => (
                  <TableRow key={user.userId} hover>
                    <TableCell>
                      <Typography variant="body2" color="text.disabled">
                        {rangeStart + index}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" alignItems="center" gap={1.5}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            fontSize: 13,
                            fontWeight: 600,
                            bgcolor: getAvatarColor(user.userId),
                          }}
                        >
                          {getUserInitials(user)}
                        </Avatar>
                        <Typography variant="body2">
                          {user.firstName ?? <span style={{ color: '#9e9e9e' }}>—</span>}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {user.lastName ?? <span style={{ color: '#9e9e9e' }}>—</span>}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">{user.email}</Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={user.roleName}
                        size="small"
                        variant="outlined"
                        color="primary"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={user.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={user.isActive ? 'success' : 'default'}
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Stack direction="row" justifyContent="flex-end">
                        <Tooltip title="Edit user">
                          <IconButton
                            size="small"
                            onClick={() =>
                              navigate(`/users/form?id=${encodeUserId(user.userId)}`)
                            }
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete user">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setUserToDelete(user)}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
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
      {/* ── Delete confirmation dialog ── */}
      <Dialog
        open={userToDelete !== null}
        onClose={() => !deleting && setUserToDelete(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{' '}
            <strong>
              {userToDelete?.firstName || userToDelete?.lastName
                ? `${userToDelete.firstName ?? ''} ${userToDelete.lastName ?? ''}`.trim()
                : userToDelete?.email}
            </strong>
            ? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => setUserToDelete(null)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : undefined}
            disableElevation
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersPage;
