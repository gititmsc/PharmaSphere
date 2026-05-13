// src/config/theme.config.ts
// PharmaSphere design tokens — blue & green brand palette

import { createTheme, PaletteMode } from '@mui/material';

export const getAppTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main:         '#1565C0',   // deep pharma blue
        light:        '#1E88E5',
        dark:         '#0D47A1',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main:         '#388E3C',   // pharma green (logo leaf color)
        light:        '#66BB6A',
        dark:         '#1B5E20',
        contrastText: '#FFFFFF',
      },
      error:   { main: '#D32F2F' },
      warning: { main: '#F57C00' },
      success: { main: '#2E7D32' },
      info:    { main: '#0288D1' },
      background: {
        default: mode === 'light' ? '#F0F7F0' : '#091A12',
        paper:   mode === 'light' ? '#FFFFFF'  : '#0F2518',
      },
      text: {
        primary:   mode === 'light' ? '#0D2B1A' : '#E6F4EA',
        secondary: mode === 'light' ? '#2E6B4A' : '#7DB592',
      },
      divider: mode === 'light' ? '#C8E6C9' : '#1B3A24',
    },
    typography: {
      fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
      h4: { fontWeight: 700, letterSpacing: '-0.02em' },
      h5: { fontWeight: 700, letterSpacing: '-0.015em' },
      h6: { fontWeight: 600 },
      subtitle1: { fontWeight: 500 },
      button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' },
    },
    shape: { borderRadius: 14 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            background:
              mode === 'light'
                ? 'linear-gradient(135deg, #E8F5E9 0%, #F1F8F2 55%, #E3F2FD 100%)'
                : 'linear-gradient(135deg, #091A12 0%, #0D1F2D 100%)',
            minHeight: '100vh',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: '11px 28px',
            fontSize: '0.9375rem',
            boxShadow: 'none',
            '&:hover': { boxShadow: '0 4px 12px rgba(56,142,60,0.28)' },
          },
          containedPrimary: {
            background: 'linear-gradient(135deg, #1565C0 0%, #388E3C 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #0D47A1 0%, #2E7D32 100%)',
            },
          },
          sizeLarge: { padding: '14px 36px', fontSize: '1rem' },
        },
      },
      MuiTextField: {
        defaultProps: { variant: 'outlined', fullWidth: true },
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 10,
              backgroundColor: mode === 'light' ? '#FFFFFF' : '#112A1A',
              '& fieldset': {
                borderColor: mode === 'light' ? '#A5D6A7' : '#1E4D2B',
              },
              '&:hover fieldset': {
                borderColor: '#388E3C',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#1565C0',
                borderWidth: 2,
              },
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
          elevation1: {
            boxShadow:
              mode === 'light'
                ? '0 2px 8px rgba(56,142,60,0.08), 0 8px 32px rgba(21,101,192,0.08)'
                : '0 2px 8px rgba(0,0,0,0.4)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            boxShadow:
              mode === 'light'
                ? '0 2px 8px rgba(56,142,60,0.08), 0 8px 32px rgba(21,101,192,0.08)'
                : '0 2px 8px rgba(0,0,0,0.4)',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600 },
        },
      },
    },
  });
