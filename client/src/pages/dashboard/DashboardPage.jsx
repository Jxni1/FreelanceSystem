import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { logout } = useAuth();

  return (
    <div className="p-10 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h2>
      <p className="text-slate-500 mt-2">Welcome to your workspace. All systems are operational.</p>
      
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="text-4xl mb-4">&#128188;</div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Projects</h3>
          <p className="text-slate-500 mb-6 text-sm">Manage your web and app development projects, track budgets, and view status.</p>
          <Link to="/projects" className="inline-block w-full text-center px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold rounded-lg transition-colors">
            Go to Projects
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="text-4xl mb-4">&#128100;</div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Profile</h3>
          <p className="text-slate-500 mb-6 text-sm">Manage your personal information, settings, and subscription plans.</p>
          <Link to="/profile" className="inline-block w-full text-center px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg transition-colors">
            View Profile
          </Link>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-slate-200">
        <button 
          onClick={logout} 
          className="px-6 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-colors shadow-sm"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

