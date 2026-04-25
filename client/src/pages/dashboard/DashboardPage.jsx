import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { logout } = useAuth();

  return (
    <div className="p-10 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h2>
      <p className="text-slate-500 mt-2">
        Welcome to your workspace. All systems are operational.
      </p>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Projects */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="text-4xl mb-4">📦</div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Projects</h3>
          <p className="text-slate-500 mb-6 text-sm">
            Manage your projects and track progress.
          </p>
          <Link
            to="/projects"
            className="inline-block w-full text-center px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold rounded-lg"
          >
            Go to Projects
          </Link>
        </div>

        {/* Contracts (FIXED ROUTE) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="text-4xl mb-4">📄</div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Contracts</h3>
          <p className="text-slate-500 mb-6 text-sm">
            Manage contracts, agreements, and statuses.
          </p>
          <Link
            to="/admin/contracts"
            className="inline-block w-full text-center px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold rounded-lg"
          >
            Go to Contracts
          </Link>
        </div>

        {/* Profile */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="text-4xl mb-4">👤</div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Profile</h3>
          <p className="text-slate-500 mb-6 text-sm">
            Manage your profile and settings.
          </p>
          <Link
            to="/profile"
            className="inline-block w-full text-center px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg"
          >
            View Profile
          </Link>
        </div>

        {/* Skills */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Skills</h3>
          <p className="text-slate-500 mb-6 text-sm">
            Manage platform skills and expertise areas.
          </p>
          <Link
            to="/admin/skills"
            className="inline-block w-full text-center px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold rounded-lg"
          >
            Go to Skills
          </Link>
        </div>

      </div>

      <div className="mt-12 pt-8 border-t border-slate-200">
        <button
          onClick={logout}
          className="px-6 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}