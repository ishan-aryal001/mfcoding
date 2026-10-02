jsx
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, PiggyBank, Target, BarChart3, Repeat, Lightbulb, Settings, LogOut, Wallet, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import Avatar from './Avatar';

const NAV = [
  ['/dashboard', 'Dashboard', LayoutDashboard], ['/transactions', 'Transactions', ArrowLeftRight],
  ['/budgets', 'Budgets', PiggyBank], ['/goals', 'Goals', Target], ['/analytics', 'Analytics', BarChart3],
  ['/recurring', 'Recurring', Repeat], ['/insights', 'Insights', Lightbulb], ['/settings', 'Settings', Settings],
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { sidebarOpen, setSidebarOpen } = useUI();
  return (
    <>
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-navy-900 p-4 text-slate-300 transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-2 py-3">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500 text-white"><Wallet size={18} /></div>
            <span className="text-lg font-bold text-white">FinFlow</span>
          </div>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
        </div>
        <nav className="mt-6 flex-1 space-y-1 overflow-y-auto">
          {NAV.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-white/10 text-white' : 'hover:bg-white/5 hover:text-white'}`}>
              {({ isActive }) => (<><Icon size={18} className={isActive ? 'text-emerald-400' : ''} />{label}</>)}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 pt-4">
          <div className="flex items-center gap-3 px-2">
            <Avatar user={user} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user.name}</p>
              <p className="truncate text-xs">{user.email}</p>
            </div>
          </div>
          <button onClick={logout} className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-white/5 hover:text-white"><LogOut size={18} />Logout</button>
        </div>
      </aside>
    </>
  );
}