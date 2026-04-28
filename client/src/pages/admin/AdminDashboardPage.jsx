import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { contractService } from '../../lib/contractService';
import { projectService } from '../../lib/projectService';

const sidebarNavItems = [
  {
    label: 'Dashboard', to: '/admin/dashboard',
    icon: <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  },
  {
    label: 'User Management', to: '/admin/users',
    icon: <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m6-4a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  },
  {
    label: 'Contracts', to: '/admin/contracts',
    icon: <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  },
  {
    label: 'Milestones', to: '/admin/milestones',
    icon: <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6H13l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>,
  },
  {
    label: 'Skills', to: '/admin/skills',
    icon: <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
  },
  {
    label: 'Categories', to: '/admin/categories',
    icon: <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
  },
  {
    label: 'Financials', to: '/admin/financials',
    icon: <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
  {
    label: 'Global Settings', to: '/admin/settings',
    icon: <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  },
  {
    label: 'Audit Logs', to: '/admin/logs',
    icon: <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
  },
];

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats]               = useState({ contracts: null, projects: null });
  const [recentContracts, setRecentContracts] = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [contractsResult, projectsResult] = await Promise.allSettled([
          contractService.getAll({ page: 1, pageSize: 5 }),
          projectService.getAll({ page: 1, pageSize: 1 }),
        ]);

        if (contractsResult.status === 'fulfilled' && contractsResult.value) {
          const data = contractsResult.value;
          setStats(prev => ({
            ...prev,
            contracts: data.totalCount ?? data.items?.length ?? 0,
          }));
          setRecentContracts(data.items ?? []);
        }

        if (projectsResult.status === 'fulfilled' && projectsResult.value) {
          const data = projectsResult.value;
          setStats(prev => ({
            ...prev,
            projects: data.totalCount ?? data.items?.length ?? 0,
          }));
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  const displayName = user?.username ?? user?.email ?? 'Admin';

  return (
    <div className="flex h-screen overflow-hidden bg-[#f0e6d8]">
      
      <aside className="w-56 flex-shrink-0 bg-[#1a2d4a] flex flex-col py-6 px-3">
       
        <div className="flex items-center justify-between px-3 mb-8">
          <span className="text-white text-xl font-bold tracking-tight">FreelanceSystem</span>
          <div className="w-8 h-8 rounded-full bg-[#2e4d73] flex items-center justify-center text-white text-sm font-bold select-none">
            {displayName[0]?.toUpperCase() ?? 'A'}
          </div>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {sidebarNavItems.map(({ label, to, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#2e4d73] text-white'
                    : 'text-slate-400 hover:bg-[#243b5a] hover:text-white'
                }`
              }
            >
              {icon}
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-[#243b5a] hover:text-white transition-colors"
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Log out
        </button>
      </aside>
 
      <main className="flex-1 overflow-auto p-8 space-y-6">
        
        <section className="flex items-center bg-[#e8ddd0] rounded-2xl px-8 py-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">Hi {displayName}</h1>
            <p className="text-slate-500 mt-1 text-sm">Welcome to your workspace</p>
          </div>
        </section>
 
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="New Users"              value="—" />
          <StatCard label="Active Projects"        value={loading ? '…' : (stats.projects ?? '—')} />
          <StatCard label="Reviews number"         value="—" />
          <StatCard label="Number of Transactions" value={loading ? '…' : (stats.contracts ?? '—')} />
        </div>
 
        <section className="bg-[#e8ddd0] rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-slate-700 mb-4">Recent Contracts</h2>

          {loading ? (
            <p className="text-slate-400 text-sm">Loading…</p>
          ) : recentContracts.length === 0 ? (
            <p className="text-slate-400 text-sm">No contracts found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-slate-600">
                <thead>
                  <tr className="text-left border-b border-slate-300 text-slate-500">
                    <th className="pb-2 pr-4 font-semibold">Project</th>
                    <th className="pb-2 pr-4 font-semibold">Client</th>
                    <th className="pb-2 pr-4 font-semibold">Freelancer</th>
                    <th className="pb-2 pr-4 font-semibold">Status</th>
                    <th className="pb-2 font-semibold">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {recentContracts.map((c) => (
                    <tr
                      key={c.contractID}
                      className="border-b border-slate-200 last:border-0 hover:bg-[#ddd0c3] transition-colors"
                    >
                      <td className="py-3 pr-4 font-medium text-slate-700">{c.projectTitle || '—'}</td>
                      <td className="py-3 pr-4">{c.clientName || '—'}</td>
                      <td className="py-3 pr-4">{c.freelancerName || '—'}</td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="py-3">
                        {c.agreedPrice != null
                          ? `$${Number(c.agreedPrice).toLocaleString()}`
                          : c.price != null
                          ? `$${Number(c.price).toLocaleString()}`
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-[#e8ddd0] rounded-2xl p-6 flex flex-col items-center justify-center min-h-[120px] gap-2">
      <span className="text-slate-500 text-sm font-medium text-center">{label}</span>
      <span className="text-3xl font-bold text-slate-700">{value}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const colorMap = {
    Active:    'bg-green-100 text-green-700',
    Completed: 'bg-blue-100 text-blue-700',
    Cancelled: 'bg-red-100 text-red-700',
    Pending:   'bg-yellow-100 text-yellow-700',
    Draft:     'bg-slate-100 text-slate-600',
  };
  const cls = colorMap[status] ?? 'bg-slate-100 text-slate-600';
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status ?? '—'}
    </span>
  );
}