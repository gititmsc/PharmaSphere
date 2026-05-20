// src/App.tsx

import React, { useMemo, useState } from 'react';
import { CssBaseline, PaletteMode, ThemeProvider } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { AuthProvider } from '@/contexts/AuthContext';
import AppRouter from '@/routes/AppRouter';
import { getAppTheme } from '@/config/theme.config';

const App: React.FC = () => {
  const [mode] = useState<PaletteMode>('light');
  const theme  = useMemo(() => getAppTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={4}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        autoHideDuration={10000}
        dense
      >
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

export default App;
