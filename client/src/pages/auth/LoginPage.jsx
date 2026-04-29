import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/roles';
import { hasRole } from '../../lib/jwt';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login } = useAuth();

  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';
  const message = location.state?.message;
  const registered = location.state?.registered;

   // Effect to redirect based on user role after login
  useEffect(() => {
    if (justLoggedIn && user) {
      let redirectPath = from;

      // Determine redirect path based on role if coming from default path
      // (/dashboard is the default catchall route)
      if (from === '/' || from === '/dashboard') {
        if (hasRole(user, ROLES.FREELANCER)) {
          redirectPath = '/freelancer/dashboard';
        } else if (hasRole(user, ROLES.CLIENT)) {
          redirectPath = '/client/dashboard';
        } else if (hasRole(user, ROLES.ADMIN)) {
          redirectPath = '/admin/dashboard';
        } else {
          redirectPath = '/dashboard';
        }
      }

      navigate(redirectPath, { replace: true });
    }
  }, [justLoggedIn, user, from, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const data = new FormData(e.currentTarget);
    const email = data.get('email');
    const password = data.get('password');

    try {
      const result = await login(email, password);
      if (result.success) {
        setJustLoggedIn(true);
      } else {
        setError(result.error || 'Invalid email or password.');
        setIsSubmitting(false);
      }
    } catch {
      setError('An error occurred. Please try again later.');
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f0e6d8]">
      <div className="w-full max-w-md bg-white rounded-2xl p-10 shadow-sm transition-all duration-300">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 mb-2">Welcome back</h1>
          <p className="text-sm text-slate-500">Sign in to your account to continue</p>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
            {message}
          </div>
        )}
        
        {registered && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
            Account created! You can now sign in.
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-widest" htmlFor="email">Email address</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              autoComplete="email" 
              required 
              placeholder="name@company.com" 
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-widest" htmlFor="password">Password</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              autoComplete="current-password" 
              required 
              placeholder="••••••••" 
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700" role="alert">
              {error}
            </div>
          )}

          <button 
            id="login-submit" 
            type="submit" 
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#122C4F] hover:bg-[#0f1f38] disabled:bg-[#1a3a5c] text-white font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                Signing in…
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-600">
          Don't have an account? <a href="/auth/register" className="font-semibold text-#122C4F hover:text-bg-[#0f1f38] transition-colors">Create one</a>
        </p>
      </div>
    </div>
  );
}
