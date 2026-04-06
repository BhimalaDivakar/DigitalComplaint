import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, getMe } from '../services/api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('digitalcomplaint_token');
    const stored = localStorage.getItem('digitalcomplaint_user');
    if (token && stored) {
      setUser(JSON.parse(stored));
      getMe().then(res => setUser(res.data.user)).catch(() => logout());
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await apiLogin({ email, password });
    localStorage.setItem('digitalcomplaint_token', res.data.token);
    localStorage.setItem('digitalcomplaint_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (data) => {
    const res = await apiRegister(data);
    localStorage.setItem('digitalcomplaint_token', res.data.token);
    localStorage.setItem('digitalcomplaint_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('digitalcomplaint_token');
    localStorage.removeItem('digitalcomplaint_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
