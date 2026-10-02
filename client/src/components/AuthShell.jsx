import { Link } from 'react-router-dom';
import { Wallet, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function AuthShell({ title, subtitle, children, footer }) {
  const { theme, toggle } = useTheme();
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-navy-900 p-12 text-white lg:flex">
        <Link to="/" className="flex items-center gap-2.5 text-lg font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500"><Wallet size={18} /></span>FinFlow
        </Link>
        <div>
          <h2 className="text-4xl font-extrabold leading-tight">Take control of<br />your money.</h2>
          <p className="mt-4 max-w-sm text-slate-400">Track spending, plan your budget, and reach your financial goals, all from one simple dashboard.</p>
        </div>
        <p className="text-xs text-slate-500">© FinFlow</p>
      </div>
      <div className="relative flex items-center justify-center p-6">
        <button onClick={toggle} className="absolute right-4 top-4 rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <div className="w-full max-w-sm animate-fade">
          <h1 className="text-2xl font-extrabold">{title}</h1>
          <p className="mb-6 mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          {children}
          <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>
        </div>
      </div>
    </div>
  );
}