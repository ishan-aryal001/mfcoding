export const Skeleton = ({ className = "h-24" }) => (
  <div
    className={`animate-pulse rounded-2xl bg-slate-200/70 dark:bg-white/5 ${className}`}
  />
);

export default function LoadingSkeleton({ count = 3, className = "h-24" }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={className} />
      ))}
    </div>
  );
}
