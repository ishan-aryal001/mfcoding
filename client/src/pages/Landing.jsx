import { Link, useNavigate } from 'react-router-dom';
import { Wallet, Receipt, PiggyBank, Target, BarChart3, Repeat, Lightbulb, Sun, Moon, Check, ArrowRight, TrendingUp } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  [Receipt, 'Expense Tracking', 'Log income and expenses in seconds with smart categories.', 'text-blue-500 bg-blue-500/10'],
  [PiggyBank, 'Smart Budgeting', 'Set monthly limits and get warned before you overspend.', 'text-emerald-500 bg-emerald-500/10'],
  [Target, 'Financial Goals', 'Save for what matters and see exactly what to set aside.', 'text-purple-500 bg-purple-500/10'],
  [BarChart3, 'Spending Analytics', 'Beautiful charts show where your money really goes.', 'text-orange-500 bg-orange-500/10'],
  [Repeat, 'Recurring Expenses', 'Rent, subscriptions and salary handled automatically.', 'text-blue-500 bg-blue-500/10'],
  [Lightbulb, 'Financial Insights', 'Plain-English tips based on your own spending.', 'text-emerald-500 bg-emerald-500/10'],
];
const STEPS = [['1', 'Add your income', 'Tell FinFlow what you earn each month.'], ['2', 'Track your spending', 'Log expenses and watch budgets update live.'], ['3', 'Reach your goals', 'Save consistently and hit your targets.']];
const BENEFITS = ['Understand where your money goes', 'Avoid overspending with budget alerts', 'Build better money habits', 'Save consistently toward your goals'];

export default function Landing() {
  const { theme, toggle } = useTheme();
  const { user, demoLogin } = useAuth();
  const nav = useNavigate();
  const demo = async () => { try { await demoLogin(); nav('/dashboard'); } catch { /* ignore */ } };

  return (
    <div className="overflow-x-hidden">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2.5 text-lg font-bold"><span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500 text-white"><Wallet size={18} /></span>FinFlow</div>
        <div className="flex items-center gap-2">
          <button onClick={toggle} className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10">{theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}</button>
          {user ? <Link to="/dashboard" className="btn-primary">Dashboard</Link> : (<><Link to="/login" className="btn-secondary hidden sm:inline-flex">Sign In</Link><Link to="/register" className="btn-primary">Get Started</Link></>)}
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-16 pt-10 text-center">
        <span className="rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">Personal finance, made simple</span>
        <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">Take Control of <span className="text-emerald-500">Your Money.</span></h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-slate-500 dark:text-slate-400">Track spending, plan your budget, and reach your financial goals — all from one simple dashboard.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/register" className="btn-primary !px-6 !py-3">Get Started <ArrowRight size={16} /></Link>
          <Link to="/login" className="btn-secondary !px-6 !py-3">Sign In</Link>
          <button onClick={demo} className="btn-secondary !px-6 !py-3">Try Demo</button>
        </div>

        {/* dashboard mockup */}
        <div className="card mx-auto mt-14 max-w-4xl animate-fade p-4 text-left shadow-2xl sm:p-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[['Balance', '$4,820', 'text-blue-500'], ['Income', '$1,900', 'text-emerald-500'], ['Expenses', '$1,240', 'text-orange-500'], ['Savings', '$660', 'text-purple-500']].map(([l, v, c]) => (
              <div key={l} className="rounded-xl bg-slate-50 p-3 dark:bg-white/5"><p className="text-xs text-slate-400">{l}</p><p className={`text-lg font-bold sm:text-xl ${c}`}>{v}</p></div>
            ))}
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-white/5 sm:col-span-2">
              <p className="mb-3 flex items-center gap-1 text-xs font-semibold text-slate-500"><TrendingUp size={14} />Cash flow</p>
              <div className="flex h-28 items-end gap-2">
                {[40, 65, 50, 80, 60, 90].map((h, i) => <div key={i} className="flex flex-1 items-end gap-1"><div className="w-full rounded-t bg-emerald-500" style={{ height: `${h}%` }} /><div className="w-full rounded-t bg-orange-400" style={{ height: `${h * 0.7}%` }} /></div>)}
              </div>
            </div>
            <div className="space-y-3 rounded-xl bg-slate-50 p-4 dark:bg-white/5">
              {[['Food', 80], ['Transport', 55], ['Fun', 105]].map(([l, p]) => (
                <div key={l}><div className="mb-1 flex justify-between text-xs"><span>{l}</span><span>{p}%</span></div>
                  <div className="h-2 rounded-full bg-slate-200 dark:bg-white/10"><div className={`h-full rounded-full ${p > 100 ? 'bg-red-500' : p > 70 ? 'bg-amber-400' : 'bg-emerald-500'}`} style={{ width: `${Math.min(p, 100)}%` }} /></div></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-center text-3xl font-extrabold">Everything you need, nothing you don't</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(([I, t, d, tone]) => (
            <div key={t} className="card p-6 transition hover:-translate-y-1 hover:shadow-lg">
              <div className={`mb-4 grid h-11 w-11 place-items-center rounded-xl ${tone}`}><I size={20} /></div>
              <h3 className="font-bold">{t}</h3><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-100/70 py-16 dark:bg-white/[0.03]">
        <div className="mx-auto max-w-5xl px-5">
          <h2 className="text-center text-3xl font-extrabold">How it works</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map(([n, t, d]) => (
              <div key={n} className="text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-500 text-lg font-bold text-white">{n}</div>
                <h3 className="mt-4 font-bold">{t}</h3><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl items-center gap-10 px-5 py-16 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-extrabold">Build better money habits</h2>
          <p className="mt-3 text-slate-500 dark:text-slate-400">FinFlow turns confusing numbers into clear answers so you always know where you stand.</p>
        </div>
        <ul className="space-y-3">
          {BENEFITS.map((b) => <li key={b} className="card flex items-center gap-3 p-4 font-medium"><span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-500/10 text-emerald-500"><Check size={16} /></span>{b}</li>)}
        </ul>
      </section>

      <section className="px-5 pb-16">
        <div className="mx-auto max-w-4xl rounded-3xl bg-navy-900 px-6 py-14 text-center text-white">
          <h2 className="text-3xl font-extrabold">Start managing your money smarter.</h2>
          <Link to="/register" className="btn-primary mt-6 !px-8 !py-3">Get Started Free</Link>
        </div>
      </section>
      <footer className="pb-8 text-center text-xs text-slate-400">© FinFlow</footer>
    </div>
  );
}