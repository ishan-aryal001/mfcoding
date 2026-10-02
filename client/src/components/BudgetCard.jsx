jsx
import { Pencil, Trash2 } from 'lucide-react';
import ProgressBar from './ProgressBar';
import { budgetState, catMeta } from '../utils/constants';
import { useFmt } from '../utils/format';

// b = { category, amount, spent, percent }  (onEdit/onDelete optional)
export default function BudgetCard({ b, onEdit, onDelete }) {
  const { money } = useFmt();
  const s = budgetState(b.percent);
  const { icon: Icon, color } = catMeta(b.category);
  const remaining = b.amount - b.spent;
  return (
    <div className="card animate-fade p-5">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: color + '1a', color }}><Icon size={18} /></div>
        <div className="flex-1">
          <p className="font-semibold">{b.category}</p>
          <span className={`text-xs font-semibold ${s.text}`}>{s.label}</span>
        </div>
        {onEdit && <button onClick={() => onEdit(b)} className="rounded-lg p-1.5 text-slate-400 hover:text-blue-500"><Pencil size={15} /></button>}
        {onDelete && <button onClick={() => onDelete(b)} className="rounded-lg p-1.5 text-slate-400 hover:text-red-500"><Trash2 size={15} /></button>}
      </div>
      <div className="mt-4 flex items-end justify-between text-sm">
        <span className="font-bold">{money(b.spent)} <span className="font-normal text-slate-400">/ {money(b.amount)}</span></span>
        <span className={`font-bold ${s.text}`}>{b.percent}%</span>
      </div>
      <div className="mt-2"><ProgressBar percent={b.percent} /></div>
      <p className={`mt-2 text-xs ${remaining < 0 ? 'font-semibold text-red-500' : 'text-slate-400'}`}>
        {remaining < 0 ? `⚠️ You've exceeded your ${b.category} budget by ${money(-remaining)}.` : `${money(remaining)} remaining`}
      </p>
    </div>
  );
}