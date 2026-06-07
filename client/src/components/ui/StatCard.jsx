import { ArrowUp, ArrowDown } from 'lucide-react';

const ICON_TONES = {
  brand: 'bg-brand-50 text-brand-700',
  blue: 'bg-blue-50 text-blue-600',
  violet: 'bg-violet-50 text-violet-600',
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-600',
  sky: 'bg-sky-50 text-sky-600',
  emerald: 'bg-emerald-50 text-emerald-600',
};

const DELTA_TONES = {
  up: 'text-brand-600',
  down: 'text-rose-500',
  warn: 'text-amber-600',
  neutral: 'text-slate-400',
};

export function StatCard({ label, value, icon: Icon, iconTone = 'brand', delta, deltaDir = 'neutral' }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        {Icon ? (
          <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${ICON_TONES[iconTone] ?? ICON_TONES.brand}`}>
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        ) : null}
      </div>

      <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 tabular-nums">{value}</p>

      {delta ? (
        <p className={`mt-1.5 flex items-center gap-1 text-xs font-medium ${DELTA_TONES[deltaDir] ?? DELTA_TONES.neutral}`}>
          {deltaDir === 'up' ? <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" /> : null}
          {deltaDir === 'down' || deltaDir === 'warn' ? <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" /> : null}
          <span>{delta}</span>
        </p>
      ) : null}
    </div>
  );
}

export default StatCard;
