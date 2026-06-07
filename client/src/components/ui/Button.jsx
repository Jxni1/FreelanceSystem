import { Link } from 'react-router-dom';

const VARIANTS = {
  primary: 'bg-brand-700 text-white hover:bg-brand-800 shadow-sm',
  accent: 'bg-clay-500 text-white hover:bg-clay-600 shadow-sm',
  outline: 'bg-white text-slate-700 border border-line hover:bg-slate-50',
  soft: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
  ghost: 'text-slate-600 hover:bg-slate-100',
  inverse: 'bg-white/10 text-white hover:bg-white/20',
  link: 'text-brand-700 hover:text-brand-800',
};

const SIZES = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  link: 'text-sm gap-1',
};

export function Button({
  to,
  href,
  as,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  className = '',
  children,
  ...props
}) {
  const classes = [
    'inline-flex items-center justify-center font-semibold transition-colors',
    'disabled:opacity-50 disabled:pointer-events-none',
    VARIANTS[variant] ?? VARIANTS.primary,
    SIZES[size] ?? SIZES.md,
    className,
  ].join(' ');

  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

  const content = (
    <>
      {Icon ? <Icon className={iconSize} aria-hidden="true" /> : null}
      {children ? <span>{children}</span> : null}
      {IconRight ? <IconRight className={iconSize} aria-hidden="true" /> : null}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {content}
      </a>
    );
  }

  const Component = as ?? 'button';
  return (
    <Component className={classes} {...props}>
      {content}
    </Component>
  );
}

export default Button;
