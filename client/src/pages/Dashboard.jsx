import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Plus, Target, Gauge, ArrowRight, PieChart as PieIcon } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useToast } from '../components/Toast';
import { useFmt, greeting } from '../utils/format';
import { catMeta, budgetState } from '../utils/constants';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import ProgressBar from '../components/ProgressBar';
import TransactionItem from '../components/TransactionItem';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton, { Skeleton } from '../components/LoadingSkeleton';

export default function Dashboard() {
  const { user } = useAuth();
  const { openModal, refreshKey, refresh } = useUI();
  const toast = useToast();
  const { money } = useFmt();
  const [data, setData] = useState(null);
  const [flow, setFlow] = useState([]);
  const [months, setMonths] = useState(6);
  const [sel, setSel] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get('/analytics/overview').then((r) => { setData(r.data); setError(false); }).catch(() => setError(true));
  }, [refreshKey]);
  useEffect(() => { api.get(`/analytics/monthly?months=${months}`).then((r) => setFlow(r.data)).catch(() => {}); }, [months, refreshKey]);

  const loadDemo = async () => { await api.post('/auth/demo-data'); toast('Sample data loaded.'); refresh(); };

  if (error) return <EmptyState icon={Gauge} title="Something went wrong" text="Something went wrong. Please try again." action="Retry" onAction={refresh} />;
  if (!data) return (<div className="space-y-4"><Skeleton className="h-16 w-72" /><LoadingSkeleton count={4} className="h-32" /><Skeleton className="h-80" /></div>);

  const totalSpent = data.categories.reduce((s, c) => s + c.total, 0);
  const picked = data.categories.find((c) => c.category === sel);
  const empty = !data.recent.length;
  const tip = { borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,.15)', fontSize: 12 };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">{greeting()}, {user.name.split(' ')[0]} 👋</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Here's your financial overview · {data.month} {data.year}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => openModal('transaction', { type: 'expense' })} className="btn-primary"><Plus size={16} />Add Expense</button>
          <button onClick={() => openModal('transaction', { type: 'income' })} className="btn-secondary"><Plus size={16} />Add Income</button>
          <button onClick={() => openModal('budget')} className="btn-secondary hidden sm:inline-flex"><Gauge size={16} />Set Budget</button>
          <button onClick={() => openModal('goal')} className="btn-secondary hidden sm:inline-flex"><Target size={16} />Create Goal</button>
        </div>
      </div>

      {empty ? (
        <div className="card">
          <EmptyState icon={Wallet} title="No transactions yet" text="Start tracking your spending to understand where your money goes."
            action="Add your first transaction" onAction={() => openModal('transaction', { type: 'expense' })} />
          <p className="-mt-8 pb-8 text-center text-sm text-slate-400">or <button onClick={loadDemo} className="font-semibold text-emerald-500">load sample data</button></p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Balance" value={money(data.balance)} icon={Wallet} tone="blue" />
            <StatCard title="Income" value={money(data.income)} change={data.changes.income} icon={TrendingUp} tone="green" />
            <StatCard title="Expenses" value={money(data.expenses)} change={data.changes.expenses} icon={TrendingDown} tone="orange" invert />
            <StatCard title="Savings" value={money(data.savings)} change={data.changes.savings} icon={PiggyBank} tone="purple" />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <ChartCard className="lg:col-span-2" title="Cash flow" subtitle="Income vs expenses"
              action={<div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold dark:bg-white/5">
                {[6, 12].map((m) => <button key={m} onClick={() => setMonths(m)} className={`rounded-md px-3 py-1 ${months === m ? 'bg-white shadow dark:bg-navy-800' : 'text-slate-500'}`}>{m}M</button>)}
              </div>}>
              <div className="h-64">
                <ResponsiveContainer>
                  <AreaChart data={flow}>
                    <defs>
                      <linearGradient id="gi" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.35} /><stop offset="100%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                      <linearGradient id="ge" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f97316" stopOpacity={0.35} /><stop offset="100%" stopColor="#f97316" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#94a3b822" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={45} />
                    <Tooltip contentStyle={tip} formatter={(v) => money(v)} />
                    <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2.5} fill="url(#gi)" />
                    <Area type="monotone" dataKey="expense" name="Expenses" stroke="#f97316" strokeWidth={2.5} fill="url(#ge)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard title="Spending breakdown" subtitle="Click a category for details">
              {data.categories.length === 0 ? <p className="py-16 text-center text-sm text-slate-400">No expenses this month.</p> : (
                <>
                  <div className="h-44">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={data.categories} dataKey="total" nameKey="category" innerRadius={50} outerRadius={78} paddingAngle={3} onClick={(d) => setSel(d.category === sel ? null : d.category)} cursor="pointer">
                          {data.categories.map((c) => <Cell key={c.category} fill={catMeta(c.category).color} opacity={sel && sel !== c.category ? 0.35 : 1} />)}
                        </Pie>
                        <Tooltip contentStyle={tip} formatter={(v) => money(v)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {picked ? (
                    <div className="mt-2 rounded-xl bg-slate-50 p-3 text-sm dark:bg-white/5">
                      <p className="font-bold" style={{ color: catMeta(picked.category).color }}>{picked.category}</p>
                      <p>{money(picked.total)} · {Math.round((picked.total / totalSpent) * 100)}% of spending</p>
                      <p className="text-xs text-slate-400">{picked.count} transaction{picked.count > 1 ? 's' : ''} this month</p>
                    </div>
                  ) : (
                    <div className="mt-2 space-y-1.5">
                      {data.categories.slice(0, 4).map((c) => (
                        <button key={c.category} onClick={() => setSel(c.category)} className="flex w-full items-center gap-2 text-xs">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: catMeta(c.category).color }} />
                          <span className="flex-1 text-left">{c.category}</span><b>{money(c.total)}</b>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </ChartCard>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="Budget overview" action={<Link to="/budgets" className="flex items-center gap-1 text-xs font-semibold text-emerald-500">Manage <ArrowRight size={13} /></Link>}>
              {data.budgets.length === 0 ? (
                <EmptyState icon={Gauge} title="Your budget hasn't been created" text="Set monthly limits to stay in control." action="Set budget" onAction={() => openModal('budget')} />
              ) : (
                <div className="space-y-4">
                  {data.budgets.map((b) => {
                    const s = budgetState(b.percent);
                    return (
                      <div key={b._id}>
                        <div className="mb-1.5 flex justify-between text-sm"><span className="font-semibold">{b.category}</span><span><b>{money(b.spent)}</b> <span className="text-slate-400">/ {money(b.amount)}</span></span></div>
                        <ProgressBar percent={b.percent} />
                        {b.percent > 100 && <p className={`mt-1 text-xs font-semibold ${s.text}`}>⚠️ You've exceeded your {b.category} budget by {money(b.spent - b.amount)}.</p>}
                      </div>
                    );
                  })}
                </div>
              )}
            </ChartCard>

            <ChartCard title="Recent transactions" action={<Link to="/transactions" className="flex items-center gap-1 text-xs font-semibold text-emerald-500">View all transactions <ArrowRight size={13} /></Link>}>
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {data.recent.map((t) => <TransactionItem key={t._id} t={t} />)}
              </div>
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}