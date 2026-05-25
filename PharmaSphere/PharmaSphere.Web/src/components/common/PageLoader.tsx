import React from 'react';
import { Box, CircularProgress } from '@mui/material';

const PageLoader: React.FC = () => (
  <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh">
    <CircularProgress size={40} thickness={4} sx={{ color: 'primary.main' }} />
  </Box>
);

export default React.memo(PageLoader);
