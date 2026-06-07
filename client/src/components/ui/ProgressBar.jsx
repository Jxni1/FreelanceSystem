const TONES = {
  brand: 'bg-brand-600',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
  sky: 'bg-sky-500',
};

export function ProgressBar({ value = 0, tone = 'brand', className = '' }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <div
      className={`h-2 w-full overflow-hidden rounded-full bg-slate-100 ${className}`}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={`h-full rounded-full ${TONES[tone] ?? TONES.brand}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default ProgressBar;
