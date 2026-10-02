import { useAuth } from '../context/AuthContext';

export const money = (n = 0, cur = 'USD') => {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: cur, minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 }).format(n);
  } catch { return String(n); }
};

export const currencySymbol = (cur = 'USD') => {
  try { return new Intl.NumberFormat('en', { style: 'currency', currency: cur }).formatToParts(0).find((p) => p.type === 'currency').value; }
  catch { return cur; }
};

export const fmtDate = (d, fmt = 'MMM DD') => {
  const x = new Date(d);
  if (isNaN(x)) return '';
  if (x.toDateString() === new Date().toDateString()) return 'Today';
  if (x.toDateString() === new Date(Date.now() - 864e5).toDateString()) return 'Yesterday';
  const dd = String(x.getDate()).padStart(2, '0'), mm = String(x.getMonth() + 1).padStart(2, '0');
  if (fmt === 'DD/MM/YYYY') return `${dd}/${mm}/${x.getFullYear()}`;
  if (fmt === 'MM/DD/YYYY') return `${mm}/${dd}/${x.getFullYear()}`;
  return x.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// value for <input type="date"> in local time
export const toInputDate = (d = new Date()) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};
// send dates at local noon so timezones never shift the day
export const toISODate = (s) => (s ? new Date(`${s}T12:00:00`).toISOString() : '');

export const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

export const timeAgo = (d) => {
  const s = (Date.now() - new Date(d)) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

// money/date formatters bound to the user's settings
export const useFmt = () => {
  const { user } = useAuth();
  return { money: (n) => money(n, user?.currency), date: (d) => fmtDate(d, user?.dateFormat) };
};