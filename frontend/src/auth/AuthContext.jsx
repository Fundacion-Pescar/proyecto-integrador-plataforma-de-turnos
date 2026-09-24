import { createContext, useContext, useEffect, useState } from 'react';
import { api, clearToken, getToken, setToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function restaurarSesion() {
      const token = getToken();
      if (!token) {
        setCargando(false);
        return;
      }

      try {
        const data = await api.me();
        setAdmin(data.data);
      } catch {
        clearToken();
        setAdmin(null);
      } finally {
        setCargando(false);
      }
    }

    restaurarSesion();
  }, []);

  async function login(email, password) {
    const data = await api.login(email, password);
    setToken(data.data.token);
    setAdmin(data.data.admin);
    return data.data.admin;
  }

  function logout() {
    clearToken();
    setAdmin(null);
  }

  return (
    <AuthContext.Provider
      value={{
        admin,
        cargando,
        isAuthenticated: Boolean(admin),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return ctx;
}
