import { Star } from 'lucide-react';

export function RatingStars({ rating = 0, showValue = true, size = 'sm', className = '' }) {
  const value = Number(rating) || 0;
  const rounded = Math.round(value);
  const dim = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${dim} ${i <= rounded ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
          aria-hidden="true"
        />
      ))}
      {showValue ? (
        <span className="ml-1 text-xs font-medium text-slate-500">{value > 0 ? value.toFixed(1) : '—'}</span>
      ) : null}
    </span>
  );
}

export default RatingStars;
