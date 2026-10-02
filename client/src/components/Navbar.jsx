jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, Search, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import NotificationDropdown from './NotificationDropdown';
import Avatar from './Avatar';

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const { user } = useAuth();
  const { setSidebarOpen } = useUI();
  const [q, setQ] = useState('');
  const nav = useNavigate();
  const search = (e) => { e.preventDefault(); nav(`/transactions${q.trim() ? `?search=${encodeURIComponent(q.trim())}` : ''}`); };

  return (
    <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-slate-200/70 bg-slate-50/80 px-4 py-3 backdrop-blur sm:gap-3 md:px-8 dark:border-white/5 dark:bg-navy-950/80">
      <button onClick={() => setSidebarOpen(true)} className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 lg:hidden dark:hover:bg-white/10"><Menu size={20} /></button>
      <form onSubmit={search} className="relative max-w-md flex-1">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search transactions..." className="input !pl-10" />
      </form>
      <div className="ml-auto flex items-center gap-1">
        <button onClick={toggle} className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10">{theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}</button>
        <NotificationDropdown />
        <Link to="/settings" className="ml-1"><Avatar user={user} size={34} /></Link>
      </div>
    </header>
  );
}
