import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLES } from '../../constants/roles';

const EXPERIENCE_LEVELS = ['Junior', 'Mid', 'Senior', 'Expert'];

export function RegisterPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState('');
  const [errors, setErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);
    setIsSubmitting(true);

    const form = new FormData(e.currentTarget);

    const body = {
      name:     form.get('name'),
      surname:  form.get('surname'),
      username: form.get('username'),
      email:    form.get('email'),
      password: form.get('password'),
      role,
    };

    if (role === ROLES.FREELANCER) {
      body.experienceLevel = form.get('experienceLevel');
      body.hourlyRate = parseFloat(form.get('hourlyRate')) || null;
    }

    if (role === ROLES.CLIENT) {
      body.bio      = form.get('bio');
      body.industry = form.get('industry');
      body.budget   = parseFloat(form.get('budget')) ?? null;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        navigate('/auth/login', {
          replace: true,
          state: { message: null, registered: true },
        });
      } else {
        setErrors(data.errors ?? ['Registration failed. Please try again.']);
      }
    } catch {
      setErrors(['Network error. Please check your connection and try again.']);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl p-10 shadow-sm transition-all duration-300">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-50 text-teal-600 rounded-xl mb-6 shadow-sm ring-1 ring-teal-100">
            <svg width="32" height="32" viewBox="0 0 36 36" fill="none" aria-hidden="true">
              <path d="M11 18.5L16 23.5L25 13.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Create an account</h1>
          <p className="text-sm text-slate-500">Join as a freelancer or a client to get started</p>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <RoleCard
              id="role-freelancer"
              value={ROLES.FREELANCER}
              selected={role === ROLES.FREELANCER}
              onSelect={setRole}
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z"/>
                  <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                </svg>
              }
              label="Freelancer"
              description="Offer services & get hired"
            />
            <RoleCard
              id="role-client"
              value={ROLES.CLIENT}
              selected={role === ROLES.CLIENT}
              onSelect={setRole}
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                </svg>
              }
              label="Client"
              description="Post projects & hire talent"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest" htmlFor="name">First name</label>
              <input 
                id="name" name="name" type="text" autoComplete="given-name" placeholder="Jane" required 
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest" htmlFor="surname">Last name</label>
              <input 
                id="surname" name="surname" type="text" autoComplete="family-name" placeholder="Smith" required 
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest" htmlFor="username">Username</label>
              <input 
                id="username" name="username" type="text" autoComplete="username" placeholder="jane_smith" required 
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest" htmlFor="reg-email">Email address</label>
              <input 
                id="reg-email" name="email" type="email" autoComplete="email" placeholder="jane@example.com" required 
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest" htmlFor="reg-password">Password</label>
              <input 
                id="reg-password" name="password" type="password" autoComplete="new-password" placeholder="Min 8 chars, upper, digit, symbol" required 
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              />
            </div>
          </div>

          {role === ROLES.FREELANCER && (
            <div className="pt-6 border-t border-slate-100 flex flex-col gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="text-xs font-bold text-teal-600 uppercase tracking-widest">Freelancer details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest" htmlFor="experienceLevel">Experience level</label>
                  <select 
                    id="experienceLevel" name="experienceLevel" required defaultValue=""
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all appearance-none bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 12 12%22%3E%3Cpath fill=%22%238b8b9e%22 d=%22M6 8L1 3h10z%22/%3E%3C/svg%3E')] bg-no-repeat bg-position-[right_12px_center]"
                  >
                    <option value="" disabled>Select level</option>
                    {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest" htmlFor="hourlyRate">Hourly rate (USD)</label>
                  <input 
                    id="hourlyRate" name="hourlyRate" type="number" min="1" step="0.01" placeholder="e.g. 45.00" required 
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {role === ROLES.CLIENT && (
            <div className="pt-6 border-t border-slate-100 flex flex-col gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="text-xs font-bold text-teal-600 uppercase tracking-widest">Client details</p>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest" htmlFor="bio">Bio</label>
                <textarea 
                  id="bio" name="bio" placeholder="Tell freelancers about yourself…" maxLength={1000} required 
                  className="w-full px-4 py-2.5 min-h-25 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-y"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest" htmlFor="industry">Industry</label>
                  <input 
                    id="industry" name="industry" type="text" placeholder="e.g. Tech" required 
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest" htmlFor="budget">Budget (USD)</label>
                  <input 
                    id="budget" name="budget" type="number" min="0" step="0.01" placeholder="e.g. 5000.00" required 
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {errors.length > 0 && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-lg space-y-1">
              {errors.map((err, i) => (
                <p key={i} className="text-sm text-rose-600 font-medium">· {err}</p>
              ))}
            </div>
          )}

          <button 
            id="register-submit" 
            type="submit" 
            disabled={isSubmitting || !role}
            className="w-full flex items-center justify-center gap-2 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-semibold rounded-lg shadow-md hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Create account'
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          Already have an account? <a href="/auth/login" className="font-semibold text-teal-600 hover:text-teal-700 transition-colors">Sign in</a>
        </p>
      </div>
    </div>
  );
}

function RoleCard({ id, value, selected, onSelect, icon, label, description }) {
  return (
    <button
      id={id}
      type="button"
      className={`relative flex flex-col items-center gap-2 p-5 border-2 rounded-xl transition-all cursor-pointer text-center group ${
        selected 
          ? 'border-teal-600 bg-teal-50 shadow-sm shadow-teal-600/5' 
          : 'border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-slate-100'
      }`}
      onClick={() => onSelect(value)}
      aria-pressed={selected}
    >
      <div className={`flex items-center justify-center w-12 h-12 rounded-lg transition-colors ${
        selected ? 'bg-teal-600 text-white' : 'bg-white text-slate-400 group-hover:text-slate-500 shadow-sm'
      }`}>
        {icon}
      </div>
      <div className="space-y-0.5">
        <p className={`font-bold text-sm ${selected ? 'text-teal-900' : 'text-slate-700'}`}>{label}</p>
        <p className={`text-[11px] leading-tight ${selected ? 'text-teal-700/70' : 'text-slate-400'}`}>{description}</p>
      </div>
      {selected && (
        <div className="absolute top-2 right-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-teal-600">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      )}
    </button>
  );
}
