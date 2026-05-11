import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAuthorization } from '../hooks/useAuthorization';


export function AppShell() {
  const { logout } = useAuth();
  const { isAdmin, isClient, isFreelancer } = useAuthorization();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <NavLink
            to={isFreelancer ? '/discover' : '/home'}
            className="font-semibold tracking-wide text-teal-600 hover:text-teal-700"
          >
            Freelance System
          </NavLink>

          <nav className="flex items-center gap-1">
            {isFreelancer && (
              <>
                <NavItem to="/discover">Discover</NavItem>
                <NavItem to="/clients">Clients</NavItem>
                <NavItem to="/my-work">My Work</NavItem>
                <NavItem to="/contracts">Contracts</NavItem>
                <NavItem to="/reviews">Reviews</NavItem>
              </>
            )}

            {isClient && (
              <>
                <NavItem to="/home">Dashboard</NavItem>
                <NavItem to="/projects">Projects</NavItem>
                <NavItem to="/freelancers">Freelancers</NavItem>
                <NavItem to="/contracts">Contracts</NavItem>
                <NavItem to="/reviews">Reviews</NavItem>
              </>
            )}

            {isAdmin && (
              <>
                <NavItem to="/admin">Admin Panel</NavItem>
              </>
            )}

            <NavItem to="/profile">Profile</NavItem>

            <button
              type="button"
              onClick={logout}
              className="ml-2 px-3 py-1.5 rounded-md text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
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

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-1.5 rounded-md text-sm transition-colors ${
          isActive
            ? 'bg-teal-600 text-white'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`
      }
    >
      {children}
    </NavLink>
  );
}