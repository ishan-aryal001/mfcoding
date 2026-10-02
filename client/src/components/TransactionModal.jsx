import { useState } from 'react';
import Modal from './Modal';
import api, { errMsg } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useToast } from './Toast';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS, catMeta } from '../utils/constants';
import { currencySymbol, toInputDate, toISODate } from '../utils/format';

// data: existing transaction (has _id) to edit, or { type } for a new one
export default function TransactionModal({ data, onClose }) {
  const edit = !!data?._id;
  const { user } = useAuth();
  const toast = useToast();
  const { refresh } = useUI();
  const [f, setF] = useState({
    type: data?.type || 'expense', amount: data?.amount || '', category: data?.category || '',
    description: data?.description || '', paymentMethod: data?.paymentMethod || 'Cash',
    date: toInputDate(data?.date), note: data?.note || '',
  });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const cats = f.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const submit = async (e) => {
    e.preventDefault();
    if (!(Number(f.amount) > 0)) return setErr('Enter a valid amount.');
    if (!f.category) return setErr('Choose a category.');
    if (!f.description.trim()) return setErr('Add a description.');
    setBusy(true);
    try {
      const body = { ...f, date: toISODate(f.date) };
      if (edit) await api.put(`/transactions/${data._id}`, body);
      else await api.post('/transactions', body);
      toast(`${f.type === 'income' ? 'Income' : 'Expense'} ${edit ? 'updated' : 'added'} successfully.`);
      refresh();
      onClose();
    } catch (e2) { setErr(errMsg(e2)); setBusy(false); }
  };

  return (
    <Modal title={edit ? 'Edit transaction' : f.type === 'income' ? 'Add income' : 'Add expense'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-white/5">
          {['expense', 'income'].map((t) => (
            <button type="button" key={t} onClick={() => { set('type', t); set('category', ''); }}
              className={`rounded-lg py-2 text-sm font-semibold capitalize transition ${f.type === t ? 'bg-white shadow dark:bg-navy-800' : 'text-slate-500'}`}>{t}</button>
          ))}
        </div>
        <div>
          <label className="label">Amount</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">{currencySymbol(user.currency)}</span>
            <input autoFocus type="number" step="0.01" min="0" className="input !pl-9 text-lg font-bold" placeholder="0.00" value={f.amount} onChange={(e) => set('amount', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Category</label>
          <div className="grid grid-cols-3 gap-2">
            {cats.map((c) => {
              const { icon: I, color } = catMeta(c);
              const on = f.category === c;
              return (
                <button type="button" key={c} onClick={() => set('category', c)}
                  className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-xs transition ${on ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-200 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5'}`}>
                  <I size={18} style={{ color }} />{c}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <label className="label">Description</label>
          <input className="input" placeholder="e.g. Lunch at McDonald's" value={f.description} onChange={(e) => set('description', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Date</label><input type="date" className="input" value={f.date} onChange={(e) => set('date', e.target.value)} /></div>
          <div>
            <label className="label">Payment method</label>
            <select className="input" value={f.paymentMethod} onChange={(e) => set('paymentMethod', e.target.value)}>{PAYMENT_METHODS.map((p) => <option key={p}>{p}</option>)}</select>
          </div>
        </div>
        <div><label className="label">Note (optional)</label><input className="input" value={f.note} onChange={(e) => set('note', e.target.value)} /></div>
        {err && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">{err}</p>}
        <button disabled={busy} className="btn-primary w-full">{busy ? 'Saving...' : edit ? 'Save changes' : f.type === 'income' ? 'Add income' : 'Add expense'}</button>
      </form>
    </Modal>
  );
}