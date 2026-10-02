jsx
import { Pencil, Trash2 } from 'lucide-react';
import { catMeta } from '../utils/constants';
import { useFmt } from '../utils/format';

// onEdit / onDelete are optional. Without them it renders as a read-only row.
export default function TransactionItem({ t, onEdit, onDelete }) {
  const { money, date } = useFmt();
  const { icon: Icon, color } = catMeta(t.category);
  const inc = t.type === 'income';
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: color + '1a', color }}><Icon size={18} /></div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{t.description}</p>
        <p className="text-xs text-slate-400">{t.category} · {date(t.date)}</p>
      </div>
      <p className={`text-sm font-bold ${inc ? 'text-emerald-500' : ''}`}>{inc ? '+' : '-'}{money(t.amount)}</p>
      {(onEdit || onDelete) && (
        <div className="flex gap-1">
          {onEdit && <button onClick={() => onEdit(t)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-500 dark:hover:bg-white/10"><Pencil size={15} /></button>}
          {onDelete && <button onClick={() => onDelete(t)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-500 dark:hover:bg-white/10"><Trash2 size={15} /></button>}
        </div>
      )}
    </div>
  );
}
