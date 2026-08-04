import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import * as authApi from '../api/auth';
import { getCookie, removeCookie, setCookie } from '../utils/cookies';

const COOKIE_NOME = 'se_auth';

const AuthContext = createContext(null);

function lerCookie() {
  try {
    const raw = getCookie(COOKIE_NOME);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(lerCookie);

  const login = useCallback(async (email, senha) => {
    const resposta = await authApi.login({ email, senha });
    const novoAuth = { token: resposta.token, usuario: resposta.usuario };
    setCookie(COOKIE_NOME, JSON.stringify(novoAuth));
    setAuth(novoAuth);
    return novoAuth;
  }, []);

  const cadastrar = useCallback(async (nome, email, senha) => {
    return authApi.cadastrar({ nome, email, senha });
  }, []);

  const logout = useCallback(() => {
    removeCookie(COOKIE_NOME);
    setAuth(null);
  }, []);

  const value = useMemo(
    () => ({
      token: auth?.token ?? null,
      usuario: auth?.usuario ?? null,
      estaAutenticado: Boolean(auth?.token),
      login,
      cadastrar,
      logout,
    }),
    [auth, login, cadastrar, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return ctx;
}
