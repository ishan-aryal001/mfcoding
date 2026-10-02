jsx
import { Pencil, Trash2, Plus, Minus, CalendarDays } from 'lucide-react';
import ProgressBar from './ProgressBar';
import { useFmt } from '../utils/format';

// g from API: { name, targetAmount, currentAmount, percent, monthlyNeeded, deadline, category }
// onFunds(goal, 'add' | 'withdraw'), onEdit(goal), onDelete(goal) are optional
export default function GoalCard({ g, onFunds, onEdit, onDelete }) {
  const { money } = useFmt();
  const done = g.percent >= 100;
  return (
    <div className="card animate-fade p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-bold">{g.name}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
            <CalendarDays size={12} />
            {g.deadline ? new Date(g.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No deadline'}
          </p>
        </div>
        <div className="flex">
          {onEdit && <button onClick={() => onEdit(g)} className="rounded-lg p-1.5 text-slate-400 hover:text-blue-500"><Pencil size={15} /></button>}
          {onDelete && <button onClick={() => onDelete(g)} className="rounded-lg p-1.5 text-slate-400 hover:text-red-500"><Trash2 size={15} /></button>}
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <p className="text-sm text-slate-500">Saved <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{money(g.currentAmount)}</span></p>
        <p className="text-xs text-slate-400">of {money(g.targetAmount)}</p>
      </div>
      <div className="mt-2 flex items-center gap-3">
        <div className="flex-1"><ProgressBar percent={g.percent} color="bg-emerald-500" /></div>
        <span className="text-sm font-bold text-emerald-500">{g.percent}%</span>
      </div>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        {done ? '🎉 Goal reached!' : g.monthlyNeeded > 0 ? `You need to save ${money(g.monthlyNeeded)}/month to reach this goal on time.` : 'Add a deadline to see your monthly target.'}
      </p>
      {onFunds && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button onClick={() => onFunds(g, 'add')} className="btn-primary !py-2"><Plus size={15} />Add</button>
          <button onClick={() => onFunds(g, 'withdraw')} className="btn-secondary !py-2"><Minus size={15} />Withdraw</button>
        </div>
      )}
    </div>
  );
}