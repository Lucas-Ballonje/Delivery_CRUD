import { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { criarTema } from '../theme';
import { getCookie, setCookie } from '../utils/cookies';

const COOKIE_NOME = 'se_theme';

const ThemeModeContext = createContext(null);

function lerModeInicial() {
  const salvo = getCookie(COOKIE_NOME);
  if (salvo === 'light' || salvo === 'dark') return salvo;
  const prefereEscuro = typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  return prefereEscuro ? 'dark' : 'light';
}

export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(lerModeInicial);

  const toggleMode = useCallback(() => {
    setMode((atual) => {
      const novo = atual === 'light' ? 'dark' : 'light';
      setCookie(COOKIE_NOME, novo, 365);
      return novo;
    });
  }, []);

  const theme = useMemo(() => criarTema(mode), [mode]);
  const value = useMemo(() => ({ mode, toggleMode }), [mode, toggleMode]);

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) {
    throw new Error('useThemeMode deve ser usado dentro de um ThemeModeProvider');
  }
  return ctx;
}
