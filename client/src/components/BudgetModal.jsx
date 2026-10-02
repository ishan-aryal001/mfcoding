jsx
import { useState } from 'react';
import Modal from './Modal';
import api, { errMsg } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useToast } from './Toast';
import { EXPENSE_CATEGORIES } from '../utils/constants';
import { currencySymbol } from '../utils/format';

// data: existing budget (has _id) to edit, or null for new
export default function BudgetModal({ data, onClose }) {
  const edit = !!data?._id;
  const { user } = useAuth();
  const toast = useToast();
  const { refresh } = useUI();
  const [category, setCategory] = useState(data?.category || 'Food');
  const [amount, setAmount] = useState(data?.amount || '');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!(Number(amount) > 0)) return setErr('Enter a budget amount.');
    setBusy(true);
    try {
      if (edit) await api.put(`/budgets/${data._id}`, { category, amount });
      else await api.post('/budgets', { category, amount });
      toast(edit ? 'Budget updated.' : 'Budget created successfully.');
      refresh();
      onClose();
    } catch (e2) {
      setErr(e2.response?.status === 409 ? 'You already have a budget for this category this month.' : errMsg(e2));
      setBusy(false);
    }
  };

  return (
    <Modal title={edit ? 'Edit budget' : 'Set budget'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Category</label>
          <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>{EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
        </div>
        <div>
          <label className="label">Monthly limit</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">{currencySymbol(user.currency)}</span>
            <input autoFocus type="number" min="1" className="input !pl-9 text-lg font-bold" placeholder="400" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
        </div>
        {err && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">{err}</p>}
        <button disabled={busy} className="btn-primary w-full">{busy ? 'Saving...' : edit ? 'Save changes' : 'Create budget'}</button>
      </form>
    </Modal>
  );
}