export function Card({
  title,
  icon: Icon,
  badge,
  action,
  children,
  className = '',
  bodyClassName = 'p-5',
  as = 'section',
}) {
  const Component = as;
  const hasHeader = title || action || badge;

  return (
    <Component className={`rounded-2xl border border-line bg-white shadow-sm ${className}`}>
      {hasHeader ? (
        <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div className="flex min-w-0 items-center gap-2.5">
            {Icon ? <Icon className="h-5 w-5 shrink-0 text-brand-700" aria-hidden="true" /> : null}
            {title ? <h2 className="truncate text-sm font-semibold text-slate-900">{title}</h2> : null}
            {badge ? <span className="shrink-0">{badge}</span> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
      ) : null}
      <div className={bodyClassName}>{children}</div>
    </Component>
  );
}

export default Card;
