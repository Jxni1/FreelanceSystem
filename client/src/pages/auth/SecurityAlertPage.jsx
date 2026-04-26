import { Link } from 'react-router-dom';

export function SecurityAlertPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950">
      <div className="w-full max-w-lg bg-white border border-rose-100 rounded-2xl p-12 shadow-sm text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-rose-50 text-rose-600 rounded-full mb-8 ring-8 ring-rose-50/50">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">Security Alert</h1>
        <p className="text-slate-500 leading-relaxed mb-6">
          Multiple active sessions were detected for your account, or a session was reused. 
          To protect your data, all active sessions have been invalidated.
        </p>
        <p className="text-sm text-slate-400 mb-10">
          Please sign in again. If you did not initiate any unusual activity,
          change your password and contact support.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            to="/auth/login" 
            className="w-full sm:w-auto px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-all active:scale-[0.98]"
          >
            Return to Login
          </Link>
          <a 
            href="/support" 
            className="text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
