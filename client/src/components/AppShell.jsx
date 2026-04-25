import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/projects', label: 'Projects' },
  { to: '/admin/contracts', label: 'Contracts' },
  { to: '/profile', label: 'Profile' },
];

export function AppShell() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <NavLink to="/dashboard" className="font-semibold tracking-wide text-teal-300 hover:text-teal-200">
            Freelance System
          </NavLink>
          <nav className="flex items-center gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-sm transition-colors ${
                    isActive
                      ? 'bg-teal-600 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={logout}
              className="ml-2 px-3 py-1.5 rounded-md text-sm bg-slate-800 text-slate-200 hover:bg-slate-700"
            >
              Sign Out
            </button>
          </nav>
        </div>
      </header>

      <main className="py-6">
        <Outlet />
      </main>
    </div>
  );
}
