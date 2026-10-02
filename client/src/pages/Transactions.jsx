import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, ArrowLeftRight } from 'lucide-react';
import api, { errMsg } from '../services/api';
import { useUI } from '../context/UIContext';
import { useToast } from '../components/Toast';
import { useFmt } from '../utils/format';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS, catMeta } from '../utils/constants';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import TransactionItem from '../components/TransactionItem';
import { Skeleton } from '../components/LoadingSkeleton';

const RANGES = [['', 'All time'], ['today', 'Today'], ['week', 'This week'], ['month', 'This month'], ['lastMonth', 'Last month'], ['custom', 'Custom range']];
const SORTS = [['newest', 'Newest'], ['oldest', 'Oldest'], ['highest', 'Highest amount'], ['lowest', 'Lowest amount']];

export default function Transactions() {
  const [params] = useSearchParams();
  const { openModal, refreshKey, refresh } = useUI();
  const toast = useToast();
  const { money, date } = useFmt();
  const [f, setF] = useState({ type: '', category: '', paymentMethod: '', range: '', from: '', to: '', sort: 'newest' });
  const [search, setSearch] = useState(params.get('search') || '');
  const [q, setQ] = useState(search);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [del, setDel] = useState(null);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  // navbar search updates the URL
  useEffect(() => { const s = params.get('search') || ''; setSearch(s); setQ(s); }, [params]);
  // debounce typing
  useEffect(() => { const t = setTimeout(() => setQ(search), 300); return () => clearTimeout(t); }, [search]);

  useEffect(() => {
    const p = { ...f, search: q };
    Object.keys(p).forEach((k) => !p[k] && delete p[k]);
    if (p.range === 'custom' && !(p.from && p.to)) delete p.range;
    setLoading(true);
    api.get('/transactions', { params: p }).then((r) => { setItems(r.data.items); setTotal(r.data.total); }).catch(() => toast('Something went wrong. Please try again.', 'error')).finally(() => setLoading(false));
  }, [f, q, refreshKey]);

  const confirmDelete = async () => {
    const t = del;
    setDel(null);
    setItems((l) => l.filter((x) => x._id !== t._id)); // optimistic
    try { await api.delete(`/transactions/${t._id}`); toast('Transaction deleted.'); refresh(); }
    catch (e) { toast(errMsg(e), 'error'); refresh(); }
  };

  const cats = f.type === 'income' ? INCOME_CATEGORIES : f.type === 'expense' ? EXPENSE_CATEGORIES : [...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])];
  const filtered = f.type || f.category || f.paymentMethod || f.range || q;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-extrabold">Transactions</h1><p className="text-sm text-slate-500">{total} total</p></div>
        <div className="flex gap-2">
          <button onClick={() => openModal('transaction', { type: 'expense' })} className="btn-primary"><Plus size={16} />Add Expense</button>
          <button onClick={() => openModal('transaction', { type: 'income' })} className="btn-secondary"><Plus size={16} />Add Income</button>
        </div>
      </div>

      <div className="card space-y-3 p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input !pl-10" placeholder="Search by description..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
          <select className="input" value={f.type} onChange={(e) => setF((p) => ({ ...p, type: e.target.value, category: '' }))}>
            <option value="">All types</option><option value="income">Income</option><option value="expense">Expense</option>
          </select>
          <select className="input" value={f.category} onChange={set('category')}><option value="">All categories</option>{cats.map((c) => <option key={c}>{c}</option>)}</select>
          <select className="input" value={f.paymentMethod} onChange={set('paymentMethod')}><option value="">All payments</option>{PAYMENT_METHODS.map((c) => <option key={c}>{c}</option>)}</select>
          <select className="input" value={f.range} onChange={set('range')}>{RANGES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          <select className="input" value={f.sort} onChange={set('sort')}>{SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        </div>
        {f.range === 'custom' && (
          <div className="grid grid-cols-2 gap-2">
            <div><label className="label">From</label><input type="date" className="input" value={f.from} onChange={set('from')} /></div>
            <div><label className="label">To</label><input type="date" className="input" value={f.to} onChange={set('to')} /></div>
          </div>
        )}
      </div>

      {loading ? <div className="space-y-2">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-14" />)}</div>
        : items.length === 0 ? (
          <div className="card">
            {filtered
              ? <EmptyState icon={Search} title="No matching transactions" text="Try changing your search or filters." />
              : <EmptyState icon={ArrowLeftRight} title="No transactions yet" text="Start tracking your spending to understand where your money goes." action="Add your first transaction" onAction={() => openModal('transaction', { type: 'expense' })} />}
          </div>
        ) : (
          <>
            {/* desktop table */}
            <div className="card hidden overflow-hidden md:block">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs text-slate-500 dark:bg-white/5">
                  <tr>{['Date', 'Description', 'Category', 'Payment Method', 'Amount', 'Actions'].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {items.map((t) => {
                    const { icon: I, color } = catMeta(t.category);
                    return (
                      <tr key={t._id} className="transition hover:bg-slate-50 dark:hover:bg-white/5">
                        <td className="px-4 py-3 text-slate-500">{date(t.date)}</td>
                        <td className="px-4 py-3 font-semibold">{t.description}</td>
                        <td className="px-4 py-3"><span className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium" style={{ background: color + '1a', color }}><I size={13} />{t.category}</span></td>
                        <td className="px-4 py-3 text-slate-500">{t.paymentMethod}</td>
                        <td className={`px-4 py-3 font-bold ${t.type === 'income' ? 'text-emerald-500' : ''}`}>{t.type === 'income' ? '+' : '-'}{money(t.amount)}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => openModal('transaction', t)} className="rounded-lg p-1.5 text-slate-400 hover:text-blue-500"><Pencil size={15} /></button>
                          <button onClick={() => setDel(t)} className="rounded-lg p-1.5 text-slate-400 hover:text-red-500"><Trash2 size={15} /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* mobile list */}
            <div className="card divide-y divide-slate-100 px-4 dark:divide-white/5 md:hidden">
              {items.map((t) => <TransactionItem key={t._id} t={t} onEdit={(x) => openModal('transaction', x)} onDelete={setDel} />)}
            </div>
          </>
        )}

      {del && (
        <Modal title="Delete transaction?" onClose={() => setDel(null)}>
          <p className="text-sm text-slate-500">"{del.description}" ({money(del.amount)}) will be permanently removed.</p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button onClick={() => setDel(null)} className="btn-secondary">Cancel</button>
            <button onClick={confirmDelete} className="btn-danger">Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}