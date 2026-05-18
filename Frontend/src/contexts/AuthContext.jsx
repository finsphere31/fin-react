import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api.js';
import { getToken, getStoredUser, removeAuthStorage, setAuthStorage } from '../utils/auth.js';

const AuthContext = createContext({
  user: null,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      removeAuthStorage();
      setUser(null);
    }
  }, []);

  const login = async ({ email, password }) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: responseUser } = response.data;
      setAuthStorage({ token, user: responseUser });
      setUser(responseUser);
      return response.data;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    removeAuthStorage();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      isAuthenticated: Boolean(user),
      isLoading,
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
