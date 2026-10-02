import { useEffect, useState } from 'react';
import { budgetState } from '../utils/constants';

// pass `color` (tailwind bg class) to override the budget colour states (e.g. goals use green)
export default function ProgressBar({ percent = 0, color }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(Math.min(100, percent)), 50); return () => clearTimeout(t); }, [percent]);
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
      <div className={`h-full rounded-full transition-all duration-700 ${color || budgetState(percent).bar}`} style={{ width: `${w}%` }} />
    </div>
  );
}
