import React, { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { OrderService } from '@/services/order.service';
import { decodeOrderId } from '@/types/order.types';
import type { OrderFormValues } from '@/types/order.types';

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
  placeholder?: string;
  shrinkLabel?: boolean;
}
const Fld: React.FC<FldProps> = ({
  name, label, control, required, type = 'text',
  multiline = false, rows = 1, readOnly = false,
  adornment, min, placeholder, shrinkLabel,
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
        InputLabelProps={shrinkLabel || type === 'date' ? { shrink: true } : undefined}
      />
    )}
  />
);

const EMPTY: OrderFormValues = {
  orderNo: '', orderDate: new Date().toISOString().slice(0, 10),
  party: '', brandName: '', composition: '', qty: '', shelfLifeMonths: '',
  mrp: '', rate: '', amount: '', paymentTerms: '', make: '', adminRemarks: '',
  vial: '', sealColour: '', wfi: '', label: '', monoBox: '', tray: '',
  leaflet: '', syringeAndNeedle: '', shrink: '', shipper: '',
  deliverySchedule: '', otherRemarks: '',
  pisApprovalDate: '', sanoletPartyArtworkApprovalDate: '', qaRemarks: '',
  monoBoxSupplyVendorApprovalDate: '', labelSupplyVendorApprovalDate: '',
  insertSupplyVendorApprovalDate: '', traySupplyVendorApprovalDate: '',
  shipperSupplyVendorApprovalDate: '',
  productionMonoBox: '', productionLabel: '', productionInsert: '',
  productionTray: '', productionShipper: '', fillingPlan: '', packingPlan: '',
  sterility14DaysDate: '', dispatchDate: '',
};

const SalesOrderFormPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const encodedId = searchParams.get('id');
  const orderId   = encodedId ? decodeOrderId(encodedId) : null;
  const isEdit    = orderId !== null;

  const [tab, setTab]               = useState(0);
  const [loading, setLoading]       = useState(isEdit);
  const [orderStatus, setOrderStatus] = useState('');
  const [orderNo, setOrderNo]       = useState('');
  const [sealColors, setSealColors] = useState<string[]>([]);
  const skipAutoCalcRef = useRef(false);

  const { control, handleSubmit, reset, watch, setValue, formState: { isSubmitting, errors } } =
    useForm<OrderFormValues>({ defaultValues: EMPTY, mode: 'onTouched' });

  useEffect(() => {
    OrderService.getSealColors().then(setSealColors).catch(() => {});
  }, []);

  const qty  = watch('qty');
  const rate = watch('rate');

  useEffect(() => {
    if (skipAutoCalcRef.current) return;
    const q = parseFloat(qty);
    const r = parseFloat(rate);
    if (!isNaN(q) && !isNaN(r) && qty !== '' && rate !== '') {
      setValue('amount', (q * r).toFixed(2));
    }
  }, [qty, rate, setValue]);

  useEffect(() => {
    if (!isEdit || !orderId) return;
    OrderService.getOrderById(orderId)
      .then(o => {
        setOrderStatus(o.currentStatus);
        setOrderNo(o.orderNo);
        skipAutoCalcRef.current = true;
        reset({
          orderNo: o.orderNo, orderDate: o.orderDate,
          party: o.party ?? '', brandName: o.brandName ?? '',
          composition: o.composition ?? '',
          qty: o.qty?.toString() ?? '', shelfLifeMonths: o.shelfLifeMonths?.toString() ?? '',
          mrp: o.mrp?.toString() ?? '', rate: o.rate?.toString() ?? '',
          amount: o.amount?.toString() ?? '',
          paymentTerms: o.paymentTerms ?? '', make: o.make ?? '',
          adminRemarks: o.adminRemarks ?? '',
          vial: o.vial ?? '', sealColour: o.sealColour ?? '', wfi: o.wfi ?? '',
          label: o.label ?? '', monoBox: o.monoBox ?? '', tray: o.tray ?? '',
          leaflet: o.leaflet ?? '', syringeAndNeedle: o.syringeAndNeedle ?? '',
          shrink: o.shrink ?? '', shipper: o.shipper ?? '',
          deliverySchedule: o.deliverySchedule ?? '', otherRemarks: o.otherRemarks ?? '',
          pisApprovalDate: o.pisApprovalDate ?? '',
          sanoletPartyArtworkApprovalDate: o.sanoletPartyArtworkApprovalDate ?? '',
          qaRemarks: o.qaRemarks ?? '',
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
        setTimeout(() => { skipAutoCalcRef.current = false; }, 0);
      })
      .catch(() => { enqueueSnackbar('Failed to load order.', { variant: 'error' }); navigate('/sales-orders'); })
      .finally(() => setLoading(false));
  }, [isEdit, orderId, reset, navigate, enqueueSnackbar]);

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

  const ro = orderStatus === 'Dispatched' || orderStatus === 'Cancelled';

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
            <Tab label="QA Information" />
            <Tab label="Production Info" />
          </Tabs>

          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>

            {/* ── Tab 0: General Info ── */}
            <TabPanel value={tab} index={0}>
              <Grid container spacing={1.5}>

                {/* Row 1: Order identification */}
                <Grid item xs={12} sm={4}>
                  <Fld name="orderNo" label="Order No *" control={control} required="Order No is required" readOnly={ro} placeholder="e.g. ORD-2025-001" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Fld name="orderDate" label="Order Date *" control={control} required="Order date is required" type="date" readOnly={ro} shrinkLabel />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Fld name="party" label="Party" control={control} readOnly={ro} placeholder="Client / party name" />
                </Grid>

                {/* Row 2: Product details */}
                <Grid item xs={12} sm={4}>
                  <Fld name="brandName" label="Brand Name" control={control} readOnly={ro} placeholder="Brand name" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Fld name="composition" label="Composition" control={control} readOnly={ro} placeholder="Active ingredients" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Fld name="make" label="Make" control={control} readOnly={ro} placeholder="Manufacturer" />
                </Grid>

                {/* Row 3: MRP, shelf life, delivery */}
                <Grid item xs={12} sm={4}>
                  <Fld name="mrp" label="MRP (₹)" control={control} type="number" adornment="₹" readOnly={ro} placeholder="0.00" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Fld name="shelfLifeMonths" label="Shelf Life (Months)" control={control} type="number" readOnly={ro} placeholder="24" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Fld name="deliverySchedule" label="Delivery Schedule" control={control} type="date" readOnly={ro} shrinkLabel />
                </Grid>

                {/* Row 4: Rate, qty, amount (auto-calc but editable) */}
                <Grid item xs={12} sm={4}>
                  <Fld name="rate" label="Rate (₹)" control={control} type="number" adornment="₹" readOnly={ro} placeholder="0.00" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Fld name="qty" label="Quantity" control={control} type="number" readOnly={ro} placeholder="0" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Fld name="amount" label="Amount (₹)" control={control} type="number" adornment="₹" readOnly={ro} placeholder="0.00" />
                </Grid>

                {/* Row 5: Terms */}
                <Grid item xs={12} sm={4}>
                  <Fld name="paymentTerms" label="Payment Terms" control={control} readOnly={ro} placeholder="e.g. Net 30 days" />
                </Grid>
                <Grid item xs={12} sm={8} />

                {/* Row 6: Remarks */}
                <Grid item xs={12} sm={6}>
                  <Fld name="adminRemarks" label="Admin Remarks" control={control} multiline rows={3} readOnly={ro} placeholder="Internal admin notes" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Fld name="otherRemarks" label="Other Remarks" control={control} multiline rows={3} readOnly={ro} placeholder="Any other remarks" />
                </Grid>

              </Grid>
            </TabPanel>

            {/* ── Tab 1: Packaging Material ── */}
            <TabPanel value={tab} index={1}>
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                  <Fld name="vial" label="Vial" control={control} readOnly={ro} placeholder="Enter vial" />
                </Grid>

                {/* Seal Colour — autocomplete from SealColors table, allows free-text */}
                <Grid item xs={12} sm={6}>
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
                        disabled={ro}
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

                {([
                  ['wfi',             'WFI'],
                  ['label',           'Label'],
                  ['monoBox',         'Mono Box'],
                  ['tray',            'Tray'],
                  ['leaflet',         'Leaflet'],
                  ['syringeAndNeedle','Syringe & Needle'],
                  ['shrink',          'Shrink'],
                  ['shipper',         'Shipper'],
                ] as [keyof OrderFormValues, string][]).map(([field, lbl]) => (
                  <Grid item xs={12} sm={6} key={field}>
                    <Fld name={field} label={lbl} control={control} readOnly={ro} placeholder={`Enter ${lbl.toLowerCase()}`} />
                  </Grid>
                ))}
              </Grid>
            </TabPanel>

            {/* ── Tab 2: QA Information ── */}
            <TabPanel value={tab} index={2}>
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={4}>
                  <Fld name="pisApprovalDate" label="PIS Approval Date" control={control} type="date" readOnly={ro} shrinkLabel />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Fld name="sanoletPartyArtworkApprovalDate" label="Sanolet Party Artwork Date" control={control} type="date" readOnly={ro} shrinkLabel />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Fld name="monoBoxSupplyVendorApprovalDate" label="MonoBox Vendor Approval" control={control} type="date" readOnly={ro} shrinkLabel />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Fld name="labelSupplyVendorApprovalDate" label="Label Vendor Approval" control={control} type="date" readOnly={ro} shrinkLabel />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Fld name="insertSupplyVendorApprovalDate" label="Insert Vendor Approval" control={control} type="date" readOnly={ro} shrinkLabel />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Fld name="traySupplyVendorApprovalDate" label="Tray Vendor Approval" control={control} type="date" readOnly={ro} shrinkLabel />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Fld name="shipperSupplyVendorApprovalDate" label="Shipper Vendor Approval" control={control} type="date" readOnly={ro} shrinkLabel />
                </Grid>
                <Grid item xs={12}>
                  <Fld name="qaRemarks" label="QA Remarks" control={control} multiline rows={3} readOnly={ro} placeholder="QA team remarks" />
                </Grid>
              </Grid>
            </TabPanel>

            {/* ── Tab 3: Production Info ── */}
            <TabPanel value={tab} index={3}>
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={4}>
                  <Fld name="productionMonoBox" label="Production Mono Box" control={control} readOnly={ro} placeholder="Lot / details" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Fld name="productionLabel" label="Production Label" control={control} readOnly={ro} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Fld name="productionInsert" label="Production Insert" control={control} readOnly={ro} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Fld name="productionTray" label="Production Tray" control={control} readOnly={ro} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Fld name="productionShipper" label="Production Shipper" control={control} readOnly={ro} />
                </Grid>
                <Grid item xs={12} sm={4} />
                <Grid item xs={12} sm={4}>
                  <Fld name="fillingPlan" label="Filling Plan Date" control={control} type="date" readOnly={ro} shrinkLabel />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Fld name="packingPlan" label="Packing Plan Date" control={control} type="date" readOnly={ro} shrinkLabel />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Fld name="sterility14DaysDate" label="Sterility 14 Days Date" control={control} type="date" readOnly={ro} shrinkLabel />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Fld name="dispatchDate" label="Dispatch Date" control={control} type="date" readOnly={ro} shrinkLabel />
                </Grid>
              </Grid>
            </TabPanel>
          </CardContent>
        </Card>

        <Stack direction="row" justifyContent="flex-end" gap={1.5}>
          <Button variant="outlined" color="inherit" onClick={() => navigate('/sales-orders')} disabled={isSubmitting}>
            Cancel
          </Button>
          {!ro && (
            <Button type="submit" variant="contained" disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={14} color="inherit" /> : undefined}
              disableElevation>
              {isSubmitting ? (isEdit ? 'Saving…' : 'Creating…') : (isEdit ? 'Save Changes' : 'Create Order')}
            </Button>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default SalesOrderFormPage;
