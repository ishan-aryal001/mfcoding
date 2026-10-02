import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });

export const getToken = () => localStorage.getItem('ff_token') || sessionStorage.getItem('ff_token');
export const clearToken = () => { localStorage.removeItem('ff_token'); sessionStorage.removeItem('ff_token'); };
export const setToken = (t, remember = true) => {
  clearToken();
  (remember ? localStorage : sessionStorage).setItem('ff_token', t);
};
export const errMsg = (e) => e?.response?.data?.message || 'Something went wrong. Please try again.';

api.interceptors.request.use((c) => {
  const t = getToken();
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

api.interceptors.response.use((r) => r, (e) => {
  if (e.response?.status === 401 && getToken()) { clearToken(); window.location.href = '/login'; }
  return Promise.reject(e);
});

export default api;
