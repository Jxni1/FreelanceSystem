export default function Select({ className = '', children, ...props }) {
  return (
    <select
      className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors bg-white ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}