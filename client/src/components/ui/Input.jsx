export default function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors ${className}`}
      {...props}
    />
  );
}