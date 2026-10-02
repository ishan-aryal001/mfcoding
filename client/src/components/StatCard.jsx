import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const tones = {
  blue: 'bg-blue-500/10 text-blue-500',
  green: 'bg-emerald-500/10 text-emerald-500',
  orange: 'bg-orange-500/10 text-orange-500',
  purple: 'bg-purple-500/10 text-purple-500',
};

// invert=true for expenses (an increase is bad)
export default function StatCard({ title, value, change, icon: Icon, tone = 'blue', invert = false }) {
  const up = (change || 0) >= 0;
  const good = invert ? !up : up;
  return (
    <div className="card animate-fade p-5 transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500 dark:text-slate-400">{title}</span>
        <div className={`rounded-xl p-2 ${tones[tone]}`}><Icon size={18} /></div>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight">{value}</p>
      {change !== undefined && (
        <p className={`mt-1 flex items-center gap-1 text-xs font-semibold ${good ? 'text-emerald-500' : 'text-red-500'}`}>
          {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(change)}% <span className="font-normal text-slate-400">vs last month</span>
        </p>
      )}
    </div>
  );
}
