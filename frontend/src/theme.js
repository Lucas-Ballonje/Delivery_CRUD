import { createTheme } from '@mui/material/styles';

const tipografia = {
  fontFamily: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'].join(','),
  h1: { fontWeight: 700 },
  h2: { fontWeight: 700 },
  h3: { fontWeight: 700 },
  h4: { fontWeight: 700 },
  h5: { fontWeight: 600 },
  h6: { fontWeight: 600 },
};

const componentes = {
  MuiButton: {
    defaultProps: { disableElevation: true },
    styleOverrides: {
      root: { textTransform: 'none', fontWeight: 600, borderRadius: 8 },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: { boxShadow: 'none' },
    },
  },
};

export function criarTema(mode) {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#5b9bf7' : '#1257c9',
      },
      secondary: {
        main: isDark ? '#7dd3fc' : '#0284c7',
      },
      background: {
        default: isDark ? '#0b1522' : '#f2f5fa',
        paper: isDark ? '#101c2e' : '#ffffff',
      },
    },
    shape: {
      borderRadius: 10,
    },
    typography: tipografia,
    components: componentes,
  });
}
