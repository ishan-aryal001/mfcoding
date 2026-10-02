import { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, AlertTriangle, CalendarClock, Target, TrendingUp, Info } from 'lucide-react';
import api from '../services/api';
import { useUI } from '../context/UIContext';
import { timeAgo } from '../utils/format';

const ICONS = {
  budget: [AlertTriangle, 'text-orange-500 bg-orange-500/10'],
  recurring: [CalendarClock, 'text-blue-500 bg-blue-500/10'],
  goal: [Target, 'text-emerald-500 bg-emerald-500/10'],
  spending: [TrendingUp, 'text-red-500 bg-red-500/10'],
  info: [Info, 'text-slate-500 bg-slate-500/10'],
};

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef();
  const { refreshKey } = useUI();

  const load = useCallback(() => api.get('/notifications').then((r) => { setItems(r.data.items); setUnread(r.data.unread); }).catch(() => {}), []);

  useEffect(() => { load(); const i = setInterval(load, 60000); return () => clearInterval(i); }, [load, refreshKey]);
  useEffect(() => {
    const h = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const markRead = async (n) => {
    if (n.read) return;
    await api.put(`/notifications/${n._id}/read`).catch(() => {});
    setItems((l) => l.map((x) => (x._id === n._id ? { ...x, read: true } : x)));
    setUnread((u) => Math.max(0, u - 1));
  };
  const markAll = async () => {
    await api.put('/notifications/read-all').catch(() => {});
    setItems((l) => l.map((x) => ({ ...x, read: true })));
    setUnread(0);
  };

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10">
        <Bell size={20} />
        {unread > 0 && <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{unread}</span>}
      </button>
      {open && (
        <div className="card fixed left-3 right-3 top-16 z-50 animate-fade shadow-xl sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-96">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-white/5">
            <h3 className="font-semibold">Notifications</h3>
            {unread > 0 && <button onClick={markAll} className="text-xs font-semibold text-emerald-500">Mark all as read</button>}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 && <p className="px-4 py-10 text-center text-sm text-slate-400">You're all caught up 🎉</p>}
            {items.map((n) => {
              const [Icon, tone] = ICONS[n.type] || ICONS.info;
              return (
                <button key={n._id} onClick={() => markRead(n)} className={`flex w-full gap-3 px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-white/5 ${n.read ? 'opacity-60' : ''}`}>
                  <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${tone}`}><Icon size={16} /></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{n.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{n.message}</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}