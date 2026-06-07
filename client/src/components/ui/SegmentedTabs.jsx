export function SegmentedTabs({ tabs, value, onChange, className = '' }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {tabs.map((tab) => {
        const active = tab.key === value;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange?.(tab.key)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              active
                ? 'bg-slate-900 text-white'
                : 'border border-line bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
            {tab.count != null ? (
              <span className={active ? 'text-white/70' : 'text-slate-400'}>{tab.count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedTabs;
