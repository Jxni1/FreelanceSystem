import { Check } from 'lucide-react';

export function Checkbox({ checked = false, onChange, label, count, className = '' }) {
  return (
    <label className={`flex cursor-pointer select-none items-center gap-2.5 text-sm ${className}`}>
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
          checked ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 bg-white'
        }`}
      >
        {checked ? <Check className="h-3 w-3" aria-hidden="true" /> : null}
      </span>
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <span className={checked ? 'text-slate-800' : 'text-slate-600'}>{label}</span>
      {count != null ? <span className="ml-auto text-xs text-slate-400">{count}</span> : null}
    </label>
  );
}

export default Checkbox;
