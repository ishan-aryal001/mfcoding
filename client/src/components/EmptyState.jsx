jsx
export default function EmptyState({ icon: Icon, title, text, action, onAction }) {
  return (
    <div className="flex animate-fade flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-500">{Icon && <Icon size={28} />}</div>
      <h3 className="text-base font-bold">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-slate-500 dark:text-slate-400">{text}</p>
      {action && <button onClick={onAction} className="btn-primary mt-5">{action}</button>}
    </div>
  );
}
