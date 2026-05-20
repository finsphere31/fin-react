import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api.js';
import { getToken, getStoredUser, removeAuthStorage, setAuthStorage } from '../utils/auth.js';

const AuthContext = createContext({
  user: null,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
  error: null,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      removeAuthStorage();
      setUser(null);
    }
  }, []);

  const login = async ({ email, password }) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('[Auth] Attempting login with email:', email);
      console.log('[Auth] API endpoint:', api.defaults.baseURL + '/auth/login');
      
      const response = await api.post('/auth/login', { email, password });
      
      console.log('[Auth] Login successful:', response.status);
      
      const { token, user: responseUser } = response.data;
      setAuthStorage({ token, user: responseUser });
      setUser(responseUser);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      console.error('[Auth] Login error:', {
        status: err.response?.status,
        message: errorMessage,
        url: err.config?.url,
        baseURL: err.config?.baseURL,
      });
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    removeAuthStorage();
    setUser(null);
    setError(null);
  };

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      isAuthenticated: Boolean(user),
      isLoading,
      error,
    }),
    [user, isLoading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
