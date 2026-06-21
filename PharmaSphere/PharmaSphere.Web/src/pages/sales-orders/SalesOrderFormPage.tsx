import React, { useEffect, useRef, useState } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { OrderService } from '@/services/order.service';
import { LookupService } from '@/services/lookup.service';
import { useOrderStatuses } from '@/hooks/useOrderStatuses';
import { decodeOrderId } from '@/types/order.types';
import type { OrderFormValues, OrderAuditLogItem } from '@/types/order.types';
import { fmtDateTime } from '@/utils/date.utils';

interface TabPanelProps { children: React.ReactNode; value: number; index: number; }
const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box pt={1.5}>{children}</Box>}
  </div>
);

// Field wrapper using native react-hook-form Controller
interface FldProps {
  name: keyof OrderFormValues;
  label: string;
  control: ReturnType<typeof useForm<OrderFormValues>>['control'];
  required?: string;
  type?: string;
  multiline?: boolean;
  rows?: number;
  readOnly?: boolean;
  adornment?: string;
  min?: number;
  step?: number;
  placeholder?: string;
  shrinkLabel?: boolean;
}
const Fld: React.FC<FldProps> = ({
  name, label, control, required, type = 'text',
  multiline = false, rows = 1, readOnly = false,
  adornment, min, step, placeholder, shrinkLabel,
}) => (
  <Controller
    name={name}
    control={control}
    rules={{ required }}
    render={({ field, fieldState: { error } }) => (
      <TextField
        {...field}
        label={label}
        type={type}
        multiline={multiline}
        rows={rows}
        size="small"
        fullWidth
        placeholder={placeholder}
        error={!!error}
        helperText={error?.message}
        InputProps={{
          readOnly,
          ...(adornment ? { startAdornment: <InputAdornment position="start">{adornment}</InputAdornment> } : {}),
        }}
        inputProps={{
          ...(min !== undefined ? { min } : {}),
          ...(step !== undefined ? { step } : {}),
        }}
        InputLabelProps={shrinkLabel || type === 'date' ? { shrink: true } : undefined}
      />
    )}
  />
);

const EMPTY: OrderFormValues = {
  orderNo: '', orderDate: new Date().toISOString().slice(0, 10),
  party: '', brandName: '', composition: '', qty: '', shelfLifeMonths: '',
  rate: '', amount: '', make: '', adminRemarks: '',
  vial: '', sealColour: '', wfi: '', label: '', monoBox: '', tray: '',
  leaflet: '', syringeAndNeedle: '', shrink: '', shipper: '',
  otherRemarks: '',
  pisApprovalDate: '', sanoletPartyArtworkApprovalDate: '',
  monoBoxSupplyVendorApprovalDate: '', labelSupplyVendorApprovalDate: '',
  insertSupplyVendorApprovalDate: '', traySupplyVendorApprovalDate: '',
  shipperSupplyVendorApprovalDate: '',
  productionMonoBox: '', productionLabel: '', productionInsert: '',
  productionTray: '', productionShipper: '', fillingPlan: '', packingPlan: '',
  sterility14DaysDate: '', dispatchDate: '',
};

type ActionColor = 'default' | 'success' | 'info' | 'warning' | 'error' | 'secondary';
function actionColor(action: string): ActionColor {
  switch (action) {
    case 'Created':       return 'success';
    case 'Updated':       return 'info';
    case 'StatusChanged': return 'secondary';
    case 'Deleted':       return 'error';
    case 'Restored':      return 'warning';
    default:              return 'default';
  }
}

const SalesOrderFormPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const { user } = useAuth();
  const isAdmin = user?.roleName === 'Admin';
  const { statuses: orderStatuses } = useOrderStatuses();

  const encodedId = searchParams.get('id');
  const orderId   = encodedId ? decodeOrderId(encodedId) : null;
  const isEdit    = orderId !== null;

  const [tab, setTab]               = useState(0);
  const [loading, setLoading]       = useState(isEdit);
  const [orderStatus, setOrderStatus] = useState('');
  const [orderNo, setOrderNo]       = useState('');
  const [sealColors, setSealColors]   = useState<string[]>([]);
  const [parties, setParties]         = useState<string[]>([]);
  const [brandNames, setBrandNames]   = useState<string[]>([]);
  const [auditLogs, setAuditLogs]     = useState<OrderAuditLogItem[]>([]);
  const [cancelOpen, setCancelOpen]   = useState(false);
  const [cancelling, setCancelling]   = useState(false);
  const justSelectedRef  = useRef(false);

  const { control, handleSubmit, reset, setValue, formState: { isSubmitting } } =
    useForm<OrderFormValues>({ defaultValues: EMPTY, mode: 'onTouched' });

  useEffect(() => {
    if (!isEdit && !isAdmin) {
      enqueueSnackbar('Only Admin can create new sales orders.', { variant: 'error', anchorOrigin: { vertical: 'top', horizontal: 'right' } });
      navigate('/sales-orders');
    }
  }, [isEdit, isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    OrderService.getSealColors().then(setSealColors).catch(() => {});
    LookupService.getParties().then(setParties).catch(() => {});
    LookupService.getBrandNames().then(setBrandNames).catch(() => {});
  }, []);

  const handleBrandNameSelect = async (brandName: string) => {
    if (isEdit || !brandName.trim()) return;
    const prev = await OrderService.getLatestByBrand(brandName);
    if (!prev) return;

    reset({
      orderNo:      '',
      orderDate:    new Date().toISOString().slice(0, 10),
      party:        prev.party ?? '',
      brandName:    brandName,
      composition:  prev.composition ?? '',
      qty:          prev.qty?.toString() ?? '',
      shelfLifeMonths: prev.shelfLifeMonths ?? '',
      rate:         prev.rate?.toString() ?? '',
      amount:       prev.amount?.toString() ?? '',
      make:         prev.make ?? '',
      adminRemarks: prev.adminRemarks ?? '',
      otherRemarks: prev.otherRemarks ?? '',
      // Packaging
      vial:             prev.vial ?? '',
      sealColour:       prev.sealColour ?? '',
      wfi:              prev.wfi ?? '',
      label:            prev.label ?? '',
      monoBox:          prev.monoBox ?? '',
      tray:             prev.tray ?? '',
      leaflet:          prev.leaflet ?? '',
      syringeAndNeedle: prev.syringeAndNeedle ?? '',
      shrink:           prev.shrink ?? '',
      shipper:          prev.shipper ?? '',
      // QA dates cleared
      pisApprovalDate:                 '',
      sanoletPartyArtworkApprovalDate: '',
      monoBoxSupplyVendorApprovalDate: '',
      labelSupplyVendorApprovalDate:   '',
      insertSupplyVendorApprovalDate:  '',
      traySupplyVendorApprovalDate:    '',
      shipperSupplyVendorApprovalDate: '',
      // Production dates cleared
      productionMonoBox:   '',
      productionLabel:     '',
      productionInsert:    '',
      productionTray:      '',
      productionShipper:   '',
      fillingPlan:         '',
      packingPlan:         '',
      sterility14DaysDate: '',
      dispatchDate:        '',
    });
    enqueueSnackbar(`Pre-filled from order ${prev.orderNo}`, {
      variant: 'info',
      anchorOrigin: { vertical: 'top', horizontal: 'right' },
    });
  };

  useEffect(() => {
    if (!isEdit || !orderId) return;
    OrderService.getOrderById(orderId)
      .then(o => {
        setOrderStatus(o.currentStatus);
        setOrderNo(o.orderNo);
        setAuditLogs(o.auditLogs ?? []);
        reset({
          orderNo: o.orderNo, orderDate: o.orderDate,
          party: o.party ?? '', brandName: o.brandName ?? '',
          composition: o.composition ?? '',
          qty: o.qty?.toString() ?? '', shelfLifeMonths: o.shelfLifeMonths ?? '',
          rate: o.rate?.toString() ?? '',
          amount: o.amount?.toString() ?? '',
          make: o.make ?? '',
          adminRemarks: o.adminRemarks ?? '',
          vial: o.vial ?? '', sealColour: o.sealColour ?? '', wfi: o.wfi ?? '',
          label: o.label ?? '', monoBox: o.monoBox ?? '', tray: o.tray ?? '',
          leaflet: o.leaflet ?? '', syringeAndNeedle: o.syringeAndNeedle ?? '',
          shrink: o.shrink ?? '', shipper: o.shipper ?? '',
          otherRemarks: o.otherRemarks ?? '',
          pisApprovalDate: o.pisApprovalDate ?? '',
          sanoletPartyArtworkApprovalDate: o.sanoletPartyArtworkApprovalDate ?? '',
          monoBoxSupplyVendorApprovalDate: o.monoBoxSupplyVendorApprovalDate ?? '',
          labelSupplyVendorApprovalDate: o.labelSupplyVendorApprovalDate ?? '',
          insertSupplyVendorApprovalDate: o.insertSupplyVendorApprovalDate ?? '',
          traySupplyVendorApprovalDate: o.traySupplyVendorApprovalDate ?? '',
          shipperSupplyVendorApprovalDate: o.shipperSupplyVendorApprovalDate ?? '',
          productionMonoBox: o.productionMonoBox ?? '',
          productionLabel: o.productionLabel ?? '',
          productionInsert: o.productionInsert ?? '',
          productionTray: o.productionTray ?? '',
          productionShipper: o.productionShipper ?? '',
          fillingPlan: o.fillingPlan ?? '',
          packingPlan: o.packingPlan ?? '',
          sterility14DaysDate: o.sterility14DaysDate ?? '',
          dispatchDate: o.dispatchDate ?? '',
        });
      })
      .catch(() => { enqueueSnackbar('Failed to load order.', { variant: 'error' }); navigate('/sales-orders'); })
      .finally(() => setLoading(false));
  }, [isEdit, orderId, reset, navigate, enqueueSnackbar]);

  const watchedRate = useWatch({ control, name: 'rate' });
  const watchedQty  = useWatch({ control, name: 'qty' });
  useEffect(() => {
    const rate = parseFloat(watchedRate);
    const qty  = parseInt(watchedQty, 10);
    if (!isNaN(rate) && !isNaN(qty) && rate > 0 && qty > 0) {
      setValue('amount', (rate * qty).toFixed(2), { shouldDirty: true });
    }
  }, [watchedRate, watchedQty, setValue]);

  const handleCancelOrder = async () => {
    if (!orderId) return;
    setCancelling(true);
    try {
      await OrderService.changeStatus(orderId, 'Cancelled');
      enqueueSnackbar('Order cancelled.', { variant: 'success', autoHideDuration: 10000, anchorOrigin: { vertical: 'top', horizontal: 'right' } });
      navigate('/sales-orders');
    } catch (err) {
      let msg = 'Failed to cancel order.';
      if (axios.isAxiosError(err)) msg = err.response?.data?.message ?? msg;
      enqueueSnackbar(msg, { variant: 'error', autoHideDuration: 10000, anchorOrigin: { vertical: 'top', horizontal: 'right' } });
    } finally {
      setCancelling(false);
      setCancelOpen(false);
    }
  };

  const onSubmit = async (data: OrderFormValues) => {
    try {
      if (isEdit && orderId) {
        await OrderService.updateOrder(orderId, data);
        enqueueSnackbar('Order updated.', { variant: 'success', autoHideDuration: 10000, anchorOrigin: { vertical: 'top', horizontal: 'right' } });
      } else {
        await OrderService.createOrder(data);
        enqueueSnackbar('Order created.', { variant: 'success', autoHideDuration: 10000, anchorOrigin: { vertical: 'top', horizontal: 'right' } });
      }
      navigate('/sales-orders');
    } catch (err) {
      let msg = 'An unexpected error occurred.';
      if (axios.isAxiosError(err)) msg = err.response?.data?.message ?? msg;
      enqueueSnackbar(msg, { variant: 'error', autoHideDuration: 10000, anchorOrigin: { vertical: 'top', horizontal: 'right' } });
    }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
      <CircularProgress />
    </Box>
  );

  const isQA         = user?.roleName === 'QA';
  const isDesigner   = user?.roleName === 'Designer';
  const isPPMC       = user?.roleName === 'PPMC';
  const isProduction = user?.roleName === 'Production';
  const isPacking    = user?.roleName === 'Packing';
  const isDispatch   = user?.roleName === 'Dispatch';

  // Fully locked: Cancelled (all), or Dispatched for non-Admin
  const ro = orderStatus === 'Cancelled' || (orderStatus === 'Dispatched' && !isAdmin);
  const roGeneralInfo = ro || !isAdmin;

  // Per-field role gates (base ro applies first, then role check)
  // QA may only fill pisApprovalDate while the order is still in 'PIS Pending'
  const roPISDate     = ro || (!isAdmin && !(isQA && orderStatus === 'PIS Pending'));
  // Designer may only fill sanoletPartyArtworkApprovalDate while the order is still in 'Artwork Pending'
  const roArtworkDate = ro || (!isAdmin && !(isDesigner && orderStatus === 'Artwork Pending'));
  // PPMC may only fill PM fields while the order is still in 'PM Supply Pending'
  const roPMFields    = ro || (!isAdmin && !(isPPMC && orderStatus === 'PM Supply Pending'));
  // Production may only fill filling plan fields while the order is still in 'Production Pending'
  const roFilling     = ro || (!isAdmin && !(isProduction && orderStatus === 'Production Pending'));
  // Packing may only fill packing plan date while the order is still in 'Packing Pending'
  const roPackingPlan = ro || (!isAdmin && !(isPacking && orderStatus === 'Packing Pending'));
  // Dispatch may only fill dispatch date while the order is still in 'Dispatch Pending'
  const roDispatch    = ro || (!isAdmin && !(isDispatch && orderStatus === 'Dispatch Pending'));

  return (
    <Box>
      <Stack direction="row" alignItems="center" gap={1.5} mb={1.5}>
        <IconButton onClick={() => navigate('/sales-orders')} size="small" sx={{ border: 1, borderColor: 'divider' }}>
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Box>
          <Typography variant="subtitle1" fontWeight={700} lineHeight={1.3}>
            {isEdit ? `Sales Order - ${orderNo}` : 'New Sales Order'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Sales Orders › {isEdit ? 'Edit' : 'Add'}
          </Typography>
        </Box>

        {isEdit && orderStatus && (
          <Box sx={{ ml: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.25 }}>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
              Current Status
            </Typography>
            <Chip
              label={orderStatus}
              color={orderStatuses.find(s => s.statusName === orderStatus)?.color ?? 'default'}
              size="medium"
              sx={{ fontWeight: 700, fontSize: '0.8rem', height: 28 }}
            />
          </Box>
        )}
      </Stack>

      {ro && (
        <Alert severity="warning" sx={{ mb: 1.5 }}>
          This order is <strong>{orderStatus}</strong> and cannot be edited.
        </Alert>
      )}

      <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
        <Card elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2, mb: 1.5 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}
            sx={{ px: 2, borderBottom: 1, borderColor: 'divider', minHeight: 40,
              '& .MuiTab-root': { minHeight: 40, py: 0 } }}>
            <Tab label="General Info" />
            <Tab label="Packaging Material" />
            <Tab label="Production Info" />
            {isEdit && <Tab label="History" />}
          </Tabs>

          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>

            {/* ── Tab 0: General Info ── */}
            <TabPanel value={tab} index={0}>
              {!isAdmin && isEdit && (
                <Alert severity="info" sx={{ mb: 1.5 }}>
                  General Info fields are view-only for your role.
                </Alert>
              )}
              <Grid container spacing={1.5}>

                {/* Row 1: Order No | Order Date | Brand Name */}
                <Grid item xs={12} sm={4}>
                  <Fld name="orderNo" label="Order No *" control={control} required="Order No is required" readOnly={roGeneralInfo} placeholder="e.g. ORD-2025-001" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Fld name="orderDate" label="Order Date *" control={control} required="Order date is required" type="date" readOnly={roGeneralInfo} shrinkLabel />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Controller
                    name="brandName"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        freeSolo
                        options={brandNames}
                        value={field.value || null}
                        inputValue={field.value || ''}
                        onChange={(_, v, reason) => {
                          field.onChange(v ?? '');
                          if (reason === 'selectOption' && v) {
                            justSelectedRef.current = true;
                            setTimeout(() => { justSelectedRef.current = false; }, 300);
                            handleBrandNameSelect(v as string);
                          }
                        }}
                        onInputChange={(_, v) => field.onChange(v)}
                        disabled={roGeneralInfo}
                        size="small"
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Brand Name"
                            placeholder="Select or type brand name"
                            onBlur={(e) => {
                              field.onBlur();
                              const val = (e.target as HTMLInputElement).value?.trim();
                              if (!isEdit && !justSelectedRef.current && val) {
                                handleBrandNameSelect(val);
                              }
                            }}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>

                {/* Row 2: Composition | Qty | Shelf Life */}
                <Grid item xs={12} sm={4}>
                  <Fld name="composition" label="Composition" control={control} readOnly={roGeneralInfo} placeholder="Active ingredients" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Fld name="qty" label="Quantity" control={control} type="number" readOnly={roGeneralInfo} placeholder="0" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Fld name="shelfLifeMonths" label="Shelf Life" control={control} readOnly={roGeneralInfo} placeholder="e.g. 24 months" />
                </Grid>

                {/* Row 3: Rate (Admin only) | Amount (Admin only) | Party | Make */}
                {isAdmin && (
                  <Grid item xs={12} sm={4}>
                    <Fld name="rate" label="Rate (₹)" control={control} type="number" adornment="₹" readOnly={roGeneralInfo} placeholder="0.00" />
                  </Grid>
                )}
                {isAdmin && (
                  <Grid item xs={12} sm={4}>
                    <Fld name="amount" label="Amount (₹)" control={control} type="number" adornment="₹" readOnly={roGeneralInfo} placeholder="0.00" />
                  </Grid>
                )}
                <Grid item xs={12} sm={4}>
                  <Controller
                    name="party"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        freeSolo
                        options={parties}
                        value={field.value || null}
                        inputValue={field.value || ''}
                        onChange={(_, v) => field.onChange(v ?? '')}
                        onInputChange={(_, v) => field.onChange(v)}
                        disabled={roGeneralInfo}
                        size="small"
                        renderInput={(params) => (
                          <TextField {...params} label="Party" placeholder="Select or type party name" onBlur={field.onBlur} />
                        )}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Fld name="make" label="Make" control={control} readOnly={roGeneralInfo} placeholder="Manufacturer" />
                </Grid>

                {/* Row 4: Admin Remarks — full width */}
                <Grid item xs={12}>
                  <Fld name="adminRemarks" label="Admin Remarks" control={control} multiline rows={2} readOnly={roGeneralInfo} placeholder="Internal admin notes" />
                </Grid>

                {/* ── Packaging Material section ── */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>Packaging Material</Typography>
                  </Divider>
                </Grid>

                {/* Row 5: Vial | Seal Colour | WFI */}
                <Grid item xs={12} sm={4}>
                  <Fld name="vial" label="Vial" control={control} readOnly={roGeneralInfo} placeholder="Enter vial" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Controller
                    name="sealColour"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        freeSolo
                        options={sealColors}
                        value={field.value || null}
                        inputValue={field.value || ''}
                        onChange={(_, newValue) => field.onChange(newValue ?? '')}
                        onInputChange={(_, newInputValue) => field.onChange(newInputValue)}
                        disabled={roGeneralInfo}
                        size="small"
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Seal Colour"
                            placeholder="Select or type colour"
                            onBlur={field.onBlur}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Fld name="wfi" label="WFI" control={control} readOnly={roGeneralInfo} placeholder="Enter WFI" />
                </Grid>

                {/* Row 6: Label | Mono Box | Tray */}
                <Grid item xs={12} sm={4}>
                  <Fld name="label" label="Label" control={control} readOnly={roGeneralInfo} placeholder="Enter label" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Fld name="monoBox" label="Mono Box" control={control} readOnly={roGeneralInfo} placeholder="Enter mono box" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Fld name="tray" label="Tray" control={control} readOnly={roGeneralInfo} placeholder="Enter tray" />
                </Grid>

                {/* Row 7: Leaflet | Syringe & Needle | Shrink */}
                <Grid item xs={12} sm={4}>
                  <Fld name="leaflet" label="Leaflet" control={control} readOnly={roGeneralInfo} placeholder="Enter leaflet" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Fld name="syringeAndNeedle" label="Syringe & Needle" control={control} readOnly={roGeneralInfo} placeholder="Enter syringe & needle" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Fld name="shrink" label="Shrink" control={control} readOnly={roGeneralInfo} placeholder="Enter shrink" />
                </Grid>

                {/* Row 8: Shipper */}
                <Grid item xs={12} sm={4}>
                  <Fld name="shipper" label="Shipper" control={control} readOnly={roGeneralInfo} placeholder="Enter shipper" />
                </Grid>

                <Grid item xs={12}>
                  <Fld name="otherRemarks" label="Other Remarks" control={control} multiline rows={2} readOnly={roGeneralInfo} placeholder="Any other remarks" />
                </Grid>

              </Grid>
            </TabPanel>

            {/* ── Tab 1: Packaging Material ── */}
            <TabPanel value={tab} index={1}>
              {isEdit && !isAdmin && ((isQA && orderStatus === 'PIS Pending') || (isDesigner && orderStatus === 'Artwork Pending')) && (
                <Alert severity="info" sx={{ mb: 1.5 }}>
                  {isQA
                    ? 'You can enter the PIS Approval Date.'
                    : 'You can enter the Sanolet Party Artwork Approval Date.'}
                </Alert>
              )}
              {isEdit && !isAdmin && isPPMC && orderStatus === 'PM Supply Pending' && (
                <Alert severity="info" sx={{ mb: 1.5 }}>
                  Complete all Packing Material Order and Receive dates to advance the status.
                </Alert>
              )}
              <Grid container spacing={1.5}>

                {/* ── QA Approval ── */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>QA Approval</Typography>
                  </Divider>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Fld name="pisApprovalDate" label="PIS Approval Date" control={control} type="date" readOnly={roPISDate} shrinkLabel />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Fld name="sanoletPartyArtworkApprovalDate" label="Sanolet Party Artwork Approval Date" control={control} type="date" readOnly={roArtworkDate} shrinkLabel />
                </Grid>
                <Grid item xs={12} sm={4} />

                {/* ── Packing Material Order ── */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>Packing Material Order</Typography>
                  </Divider>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Fld name="monoBoxSupplyVendorApprovalDate" label="Mono Box Supply Vendor Approval Date" control={control} type="date" readOnly={roPMFields} shrinkLabel />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Fld name="labelSupplyVendorApprovalDate" label="Label Supply Vendor Approval Date" control={control} type="date" readOnly={roPMFields} shrinkLabel />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Fld name="insertSupplyVendorApprovalDate" label="Insert Supply Vendor Approval Date" control={control} type="date" readOnly={roPMFields} shrinkLabel />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Fld name="traySupplyVendorApprovalDate" label="Tray Supply Vendor Approval Date" control={control} type="date" readOnly={roPMFields} shrinkLabel />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Fld name="shipperSupplyVendorApprovalDate" label="Shipper Supply Vendor Approval Date" control={control} type="date" readOnly={roPMFields} shrinkLabel />
                </Grid>
                <Grid item xs={12} sm={4} />

                {/* ── Packing Material Receive ── */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>Packing Material Receive</Typography>
                  </Divider>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Fld name="productionMonoBox" label="Production MonoBox Date" control={control} type="date" readOnly={roPMFields} shrinkLabel />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Fld name="productionLabel" label="Production Label Date" control={control} type="date" readOnly={roPMFields} shrinkLabel />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Fld name="productionInsert" label="Production Insert Date" control={control} type="date" readOnly={roPMFields} shrinkLabel />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Fld name="productionTray" label="Production Tray Date" control={control} type="date" readOnly={roPMFields} shrinkLabel />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Fld name="productionShipper" label="Production Shipper Date" control={control} type="date" readOnly={roPMFields} shrinkLabel />
                </Grid>

              </Grid>
            </TabPanel>

            {/* ── Tab 2: Production Info ── */}
            <TabPanel value={tab} index={2}>
              {isEdit && !isAdmin && ((isProduction && orderStatus === 'Production Pending') || (isPacking && orderStatus === 'Packing Pending') || (isDispatch && orderStatus === 'Dispatch Pending')) && (
                <Alert severity="info" sx={{ mb: 1.5 }}>
                  {isProduction && 'Enter the Filling Plan Date and Sterility Date to advance the status.'}
                  {isPacking    && 'Enter the Packing Plan Date to advance the status.'}
                  {isDispatch   && 'Enter the Dispatch Date to complete the order.'}
                </Alert>
              )}
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={4}>
                  <Fld name="fillingPlan" label="Filling Plan Date" control={control} type="date" readOnly={roFilling} shrinkLabel />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Fld name="packingPlan" label="Packing Plan Date" control={control} type="date" readOnly={roPackingPlan} shrinkLabel />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Fld name="sterility14DaysDate" label="Sterility 14 Days Date" control={control} type="date" readOnly={roFilling} shrinkLabel />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Fld name="dispatchDate" label="Dispatch Date" control={control} type="date" readOnly={roDispatch} shrinkLabel />
                </Grid>
              </Grid>
            </TabPanel>

            {/* ── Tab 3: History (edit mode only) ── */}
            {isEdit && (
              <TabPanel value={tab} index={3}>
                {auditLogs.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                    No history recorded for this order.
                  </Typography>
                ) : (
                  <TableContainer sx={{ maxHeight: 420 }}>
                    <Table size="small" stickyHeader
                      sx={{ '& .MuiTableCell-root': { fontSize: '0.8125rem', py: 0.75, px: 1.25 } }}>
                      <TableHead>
                        <TableRow sx={{ '& .MuiTableCell-stickyHeader': { bgcolor: 'grey.50', fontWeight: 600 } }}>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>Date &amp; Time</TableCell>
                          <TableCell>Action</TableCell>
                          <TableCell>Field</TableCell>
                          <TableCell>Old Value</TableCell>
                          <TableCell>New Value</TableCell>
                          <TableCell>Changed By</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {auditLogs.map(log => (
                          <TableRow key={log.auditLogId} hover>
                            <TableCell sx={{ whiteSpace: 'nowrap', color: 'text.secondary' }}>
                              {fmtDateTime(log.changedDate)}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={log.action}
                                size="small"
                                color={actionColor(log.action)}
                                sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
                              />
                            </TableCell>
                            <TableCell sx={{ color: 'text.secondary' }}>
                              {log.fieldName ?? '—'}
                            </TableCell>
                            <TableCell>
                              {log.oldValue
                                ? <Typography variant="body2" sx={{ color: 'error.main', fontFamily: 'monospace' }}>{log.oldValue}</Typography>
                                : <Typography variant="body2" color="text.disabled">—</Typography>}
                            </TableCell>
                            <TableCell>
                              {log.newValue
                                ? <Typography variant="body2" sx={{ color: 'success.main', fontFamily: 'monospace' }}>{log.newValue}</Typography>
                                : <Typography variant="body2" color="text.disabled">—</Typography>}
                            </TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                              {log.changedBy ?? '—'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </TabPanel>
            )}

          </CardContent>
        </Card>

        <Stack
          direction={{ xs: 'column-reverse', sm: 'row' }}
          justifyContent={{ sm: 'flex-end' }}
          gap={1.5}
          sx={{ '& .MuiButton-root': { minWidth: { xs: '100%', sm: 120 }, whiteSpace: 'nowrap' } }}
        >
          <Button variant="outlined" color="inherit" onClick={() => navigate('/sales-orders')} disabled={isSubmitting || cancelling}>
            Back
          </Button>
          {isEdit && isAdmin && orderStatus !== 'Dispatched' && orderStatus !== 'Cancelled' && (
            <Button variant="outlined" color="error" onClick={() => setCancelOpen(true)} disabled={isSubmitting || cancelling}>
              Cancel Sales Order
            </Button>
          )}
          {!ro && (
            <Button type="submit" variant="contained" disabled={isSubmitting || cancelling}
              startIcon={isSubmitting ? <CircularProgress size={14} color="inherit" /> : undefined}
              disableElevation>
              {isSubmitting ? (isEdit ? 'Saving…' : 'Creating…') : (isEdit ? 'Save Changes' : 'Create Order')}
            </Button>
          )}
        </Stack>
      </Box>

      <Dialog open={cancelOpen} onClose={() => !cancelling && setCancelOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>Cancel Sales Order</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel order <strong>{orderNo}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button variant="outlined" color="inherit" onClick={() => setCancelOpen(false)} disabled={cancelling}>
            Back
          </Button>
          <Button variant="contained" color="error" onClick={handleCancelOrder} disabled={cancelling}
            startIcon={cancelling ? <CircularProgress size={14} color="inherit" /> : undefined}
            disableElevation>
            {cancelling ? 'Cancelling…' : 'Cancel Sales Order'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SalesOrderFormPage;
