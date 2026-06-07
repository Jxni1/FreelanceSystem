import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export function Breadcrumbs({ items = [], className = '' }) {
  return (
    <nav className={`flex flex-wrap items-center gap-1.5 text-sm text-slate-500 ${className}`} aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={`${item.label}-${index}`} className="inline-flex items-center gap-1.5">
            {index > 0 ? <ChevronRight className="h-3.5 w-3.5 text-slate-300" aria-hidden="true" /> : null}
            {item.to && !isLast ? (
              <Link to={item.to} className="hover:text-slate-700">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'font-medium text-slate-700' : ''}>{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export default Breadcrumbs;
