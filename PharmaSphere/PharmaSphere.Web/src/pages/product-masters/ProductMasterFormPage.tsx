import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { ProductMasterService } from '@/services/productMaster.service';
import { decodeProductId } from '@/types/productMaster.types';
import type { ProductMasterFormValues } from '@/types/productMaster.types';

const EMPTY: ProductMasterFormValues = {
  brandName:    '',
  genericName:  '',
  vial:         '',
  sealColor:    '',
  wfi:          '',
  label:        '',
  monoBox:      '',
  monthBox:     '',
  tray:         '',
  leaflet:      '',
  syringeNeedle:'',
  shrink:       '',
  shipper:      '',
  hologram:     '',
};

const FIELDS: { key: keyof ProductMasterFormValues; label: string }[] = [
  { key: 'brandName',    label: 'Brand Name'      },
  { key: 'genericName',  label: 'Generic Name'    },
  { key: 'vial',         label: 'Vial'            },
  { key: 'sealColor',    label: 'Seal Color'      },
  { key: 'wfi',          label: 'WFI'             },
  { key: 'label',        label: 'Label'           },
  { key: 'monoBox',      label: 'Mono Box'        },
  { key: 'monthBox',     label: 'Month Box'       },
  { key: 'tray',         label: 'Tray'            },
  { key: 'leaflet',      label: 'Leaflet'         },
  { key: 'syringeNeedle',label: 'Syringe Needle'  },
  { key: 'shrink',       label: 'Shrink'          },
  { key: 'shipper',      label: 'Shipper'         },
  { key: 'hologram',     label: 'Hologram'        },
];

const ProductMasterFormPage: React.FC = () => {
  const { encodedId } = useParams<{ encodedId: string }>();
  const isEdit = !!encodedId && encodedId !== 'new';
  const productId = isEdit ? decodeProductId(encodedId!) : null;

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [loadingData, setLoadingData] = useState(isEdit);
  const [saving, setSaving]           = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } =
    useForm<ProductMasterFormValues>({ defaultValues: EMPTY });

  useEffect(() => {
    if (!isEdit || !productId) return;
    setLoadingData(true);
    ProductMasterService.getById(productId)
      .then((detail) => {
        reset({
          brandName:    detail.brandName,
          genericName:  detail.genericName,
          vial:         detail.vial,
          sealColor:    detail.sealColor,
          wfi:          detail.wfi,
          label:        detail.label,
          monoBox:      detail.monoBox,
          monthBox:     detail.monthBox,
          tray:         detail.tray,
          leaflet:      detail.leaflet,
          syringeNeedle:detail.syringeNeedle,
          shrink:       detail.shrink,
          shipper:      detail.shipper,
          hologram:     detail.hologram,
        });
      })
      .catch(() => {
        enqueueSnackbar('Failed to load product.', {
          variant: 'error', autoHideDuration: 10000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
        navigate('/product-masters');
      })
      .finally(() => setLoadingData(false));
  }, [isEdit, productId, reset, navigate, enqueueSnackbar]);

  const onSubmit = async (values: ProductMasterFormValues) => {
    setSaving(true);
    try {
      if (isEdit && productId) {
        await ProductMasterService.update(productId, values);
        enqueueSnackbar('Product updated successfully.', {
          variant: 'success', autoHideDuration: 10000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      } else {
        await ProductMasterService.create(values);
        enqueueSnackbar('Product created successfully.', {
          variant: 'success', autoHideDuration: 10000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
      navigate('/product-masters');
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? err.message)
        : 'Save failed.';
      enqueueSnackbar(msg, {
        variant: 'error', autoHideDuration: 10000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box maxWidth={900} mx="auto">
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>
          {isEdit ? 'Edit Product' : 'Add Product'}
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/product-masters')}>
          Back
        </Button>
      </Stack>

      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Grid container spacing={2}>
              {FIELDS.map(({ key, label }) => (
                <Grid item xs={12} sm={6} key={key}>
                  <Controller
                    name={key}
                    control={control}
                    rules={{ required: `${label} is required.` }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={label}
                        fullWidth
                        size="small"
                        error={!!errors[key]}
                        helperText={errors[key]?.message}
                      />
                    )}
                  />
                </Grid>
              ))}
            </Grid>

            <Stack direction="row" spacing={2} justifyContent="flex-end" mt={3}>
              <Button variant="outlined" onClick={() => navigate('/product-masters')} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={saving}>
                {saving
                  ? <CircularProgress size={18} color="inherit" />
                  : isEdit ? 'Update' : 'Create'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProductMasterFormPage;
