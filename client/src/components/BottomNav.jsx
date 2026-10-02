jsx
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, PiggyBank, Target, Plus } from 'lucide-react';
import { useUI } from '../context/UIContext';

const item = ({ isActive }) => `flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${isActive ? 'text-emerald-500' : 'text-slate-400'}`;

// Mobile only. The centre button is a one-tap "Add expense".
export default function BottomNav() {
  const { openModal } = useUI();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center border-t border-slate-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden dark:border-white/5 dark:bg-navy-900/95">
      <NavLink to="/dashboard" className={item}><LayoutDashboard size={20} />Home</NavLink>
      <NavLink to="/transactions" className={item}><ArrowLeftRight size={20} />Activity</NavLink>
      <button onClick={() => openModal('transaction', { type: 'expense' })} className="-mt-6 grid h-14 w-14 place-items-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 active:scale-95"><Plus size={26} /></button>
      <NavLink to="/budgets" className={item}><PiggyBank size={20} />Budgets</NavLink>
      <NavLink to="/goals" className={item}><Target size={20} />Goals</NavLink>
    </nav>
  );
}
