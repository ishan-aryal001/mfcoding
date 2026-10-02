import { useState } from 'react';
import Modal from './Modal';
import api, { errMsg } from '../services/api';
import { useUI } from '../context/UIContext';
import { useToast } from './Toast';
import { GOAL_CATEGORIES } from '../utils/constants';
import { toInputDate, toISODate } from '../utils/format';

// data: existing goal (has _id) to edit, or null for new
export default function GoalModal({ data, onClose }) {
  const edit = !!data?._id;
  const toast = useToast();
  const { refresh } = useUI();
  const [f, setF] = useState({
    name: data?.name || '', targetAmount: data?.targetAmount || '', currentAmount: data?.currentAmount ?? '',
    deadline: data?.deadline ? toInputDate(data.deadline) : '', category: data?.category || 'General',
  });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!f.name.trim()) return setErr('Give your goal a name.');
    if (!(Number(f.targetAmount) > 0)) return setErr('Enter a target amount.');
    setBusy(true);
    try {
      const body = { ...f, currentAmount: Number(f.currentAmount) || 0, deadline: toISODate(f.deadline) };
      if (edit) await api.put(`/goals/${data._id}`, body);
      else await api.post('/goals', body);
      toast(edit ? 'Goal updated.' : 'Goal created successfully.');
      refresh();
      onClose();
    } catch (e2) { setErr(errMsg(e2)); setBusy(false); }
  };

  return (
    <Modal title={edit ? 'Edit goal' : 'Create goal'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div><label className="label">Goal name</label><input autoFocus className="input" placeholder="e.g. New Laptop" value={f.name} onChange={(e) => set('name', e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Target amount</label><input type="number" min="1" className="input" value={f.targetAmount} onChange={(e) => set('targetAmount', e.target.value)} /></div>
          <div><label className="label">Already saved</label><input type="number" min="0" className="input" placeholder="0" value={f.currentAmount} onChange={(e) => set('currentAmount', e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Deadline</label><input type="date" className="input" value={f.deadline} onChange={(e) => set('deadline', e.target.value)} /></div>
          <div><label className="label">Category</label><select className="input" value={f.category} onChange={(e) => set('category', e.target.value)}>{GOAL_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
        </div>
        {err && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">{err}</p>}
        <button disabled={busy} className="btn-primary w-full">{busy ? 'Saving...' : edit ? 'Save changes' : 'Create goal'}</button>
      </form>
    </Modal>
  );
}