import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { key: 'users', label: 'User Management', to: '/admin/users' },
  { key: 'projects', label: 'Project Management', to: '/admin/projects' },
  { key: 'contracts', label: 'Contract Management', to: '/admin/contracts' },
  { key: 'reports', label: 'Reports & Analytics', to: '/admin/reports' }
];

export function AdminLayout() {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col">
        <div className="px-6 py-5 border-b border-slate-800 flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 ring-1 ring-teal-500/30 shadow-sm">
            <svg width="20" height="20" viewBox="0 0 36 36" fill="none" aria-hidden="true">
              <path
                d="M10 24L15 11L19 17L26 9"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-slate-100">
              Admin Dashboard
            </h1>
            <p className="text-xs text-slate-500">Freelance platform control panel</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.key}
              to={item.to}
              className={({ isActive }) =>
                [
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-teal-500/10 text-teal-300 border border-teal-500/40'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-slate-100'
                ].join(' ')
              }
            >
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-200">
              {user?.name?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="text-xs">
              <p className="font-semibold text-slate-100 truncate max-w-[110px]">
                {user?.name} {user?.surname}
              </p>
              <p className="text-slate-500">Admin</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col bg-slate-900/40">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/60 backdrop-blur">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Overview</h2>
            <p className="text-xs text-slate-500">
              Monitor users, projects, contracts and reports in one place.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 text-xs text-slate-300 border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              System status: <span className="font-semibold text-emerald-300">Operational</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}