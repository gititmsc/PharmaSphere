// src/pages/sales-orders/SalesOrdersPage.tsx

import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import ListAltIcon from '@mui/icons-material/ListAlt';

const SalesOrdersPage: React.FC = () => (
  <Box maxWidth={1200} mx="auto">
    <Typography variant="h5" fontWeight={700} mb={4}>
      Sales Orders
    </Typography>
    <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
      <CardContent
        sx={{
          py: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <ListAltIcon sx={{ fontSize: 56, color: 'text.disabled' }} />
        <Typography variant="h6" color="text.secondary">
          Sales Orders coming soon
        </Typography>
        <Typography variant="body2" color="text.disabled">
          This section is under development.
        </Typography>
      </CardContent>
    </Card>
  </Box>
);

export default SalesOrdersPage;
