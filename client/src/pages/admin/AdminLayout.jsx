import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { key: 'users', label: 'User Management', to: '/admin/users' },
  { key: 'projects', label: 'Project Management', to: '/admin/projects' },
  { key: 'contracts', label: 'Contract Management', to: '/admin/contracts' },
  { key: 'settings', label: 'Settings', to: '/admin/settings' },
  { key: 'reports', label: 'Reports & Analytics', to: '/admin/reports' }
];

export function AdminLayout() {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-teal-50 text-teal-600 ring-1 ring-teal-200 shadow-sm">
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
            <h1 className="text-sm font-semibold tracking-tight text-slate-900">
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
                    ? 'bg-teal-50 text-teal-700 border border-teal-200'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                ].join(' ')
              }
            >
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-xs font-semibold text-teal-700">
              {user?.name?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="text-xs">
              <p className="font-semibold text-slate-900 truncate max-w-27.5">
                {user?.name} {user?.surname}
              </p>
              <p className="text-slate-500">Admin</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="text-xs text-slate-500 hover:text-rose-500 transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col bg-slate-50">
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Overview</h2>
            <p className="text-xs text-slate-500">
              Monitor users, projects, contracts and reports in one place.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 text-xs text-teal-700 border border-teal-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              System status: <span className="font-semibold">Operational</span>
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
