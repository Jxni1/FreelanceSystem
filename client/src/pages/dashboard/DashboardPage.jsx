import { useAuth } from '../../context/AuthContext';

export default function DashboardPage() {
  const { logout } = useAuth();

  return (
    <div className="p-10">
      <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
      <p className="text-slate-500 mt-2">Welcome to your workspace. All systems are operational.</p>
      
      <div className="mt-8 flex gap-4">
        <a href="/profile" className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors">
          View Profile
        </a>
        <button 
          onClick={logout} 
          className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

