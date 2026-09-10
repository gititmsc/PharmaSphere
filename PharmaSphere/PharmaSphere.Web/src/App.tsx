// src/App.tsx

import React, { useMemo, useState } from 'react';
import { CssBaseline, GlobalStyles, PaletteMode, ThemeProvider } from '@mui/material';
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
      {/*
        notistack pauses its auto-hide timer on mouseenter and only resumes on mouseleave.
        If a viewer's cursor happens to rest over the toast (top-right corner) and never
        moves, the timer never resumes and the toast sits there until a manual refresh.
        None of our toasts have a close/action button, so making them non-interactive is
        safe and guarantees they always auto-dismiss on schedule.
      */}
      <GlobalStyles styles={{ '.notistack-Snackbar': { pointerEvents: 'none' } }} />
      <SnackbarProvider
        maxSnack={4}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        autoHideDuration={5000}
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
