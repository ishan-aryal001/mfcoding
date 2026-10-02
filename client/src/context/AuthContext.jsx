jsx
import { createContext, useContext, useEffect, useState } from 'react';
import api, { getToken, setToken, clearToken } from '../services/api';

const Ctx = createContext();
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getToken());

  useEffect(() => {
    if (!getToken()) return;
    api.get('/auth/me').then((r) => setUser(r.data.user)).catch(() => clearToken()).finally(() => setLoading(false));
  }, []);

  const finish = (data, remember = true) => { setToken(data.token, remember); setUser(data.user); return data.user; };
  const login = async (email, password, remember = true) => finish((await api.post('/auth/login', { email, password, remember })).data, remember);
  const register = async (name, email, password) => finish((await api.post('/auth/register', { name, email, password })).data);
  const demoLogin = async () => finish((await api.post('/auth/demo-login')).data);
  const updateUser = async (patch) => { const r = await api.put('/auth/me', patch); setUser(r.data.user); return r.data.user; };
  const logout = () => { clearToken(); setUser(null); };

  return <Ctx.Provider value={{ user, loading, login, register, demoLogin, updateUser, logout }}>{children}</Ctx.Provider>;
}
