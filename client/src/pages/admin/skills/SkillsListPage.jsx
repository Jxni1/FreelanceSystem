import { useEffect, useState } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { useSkills } from '../../../hooks/useSkills';
import { useAuth } from '../../../context/AuthContext';

const sidebarNavItems = [
  { label: 'Dashboard', to: '/admin/dashboard' },
  { label: 'User Management', to: '/admin/users' },
  { label: 'Contracts', to: '/admin/contracts' },
  { label: 'Milestones', to: '/admin/milestones' },
  { label: 'Financials', to: '/admin/financials' },
  { label: 'Global Settings', to: '/admin/skills' },
  { label: 'Audit Logs', to: '/admin/logs' },
];

export default function SkillsListPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { skills, isLoading, error, fetchSkills, deleteSkill } = useSkills();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchSkills({ page, pageSize: 10, search: searchTerm });
  }, [page, searchTerm]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this skill?')) {
      await deleteSkill(id);
      fetchSkills({ page, pageSize: 10, search: searchTerm });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchSkills({ page: 1, pageSize: 10, search: searchTerm });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  const displayName = user?.username ?? user?.email ?? 'Admin';

  if (isLoading && skills.items.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500 min-h-[50vh] flex flex-col items-center justify-center">
        <div className="inline-block w-10 h-10 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin mb-4" />
        <p>Loading skills...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f0e6d8]">
      {/* ── Sidebar ── */}
      <aside className="w-52 flex-shrink-0 bg-[#1a2d4a] flex flex-col py-8 px-4">
        <p className="text-slate-400 text-xs font-bold tracking-widest uppercase text-center mb-6">
          Nav Bar
        </p>

        <nav className="flex flex-col gap-2 flex-1">
          {sidebarNavItems.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `px-4 py-2.5 rounded-full text-sm font-medium text-center transition-colors ${
                  isActive
                    ? 'bg-[#2e4d73] text-white'
                    : 'bg-[#243b5a] text-slate-300 hover:bg-[#2e4d73] hover:text-white'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 px-4 py-2.5 rounded-full text-sm font-medium text-center bg-[#243b5a] text-slate-300 hover:bg-[#2e4d73] hover:text-white transition-colors"
        >
          Log out
        </button>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-auto p-8 space-y-6">
        {/* Skills Table Section */}
        <section className="bg-[#e8ddd0] rounded-2xl p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-slate-700">All Skills</h2>
            <Link
              to="/admin/skills/new"
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span className="text-xl leading-none">+</span> New Skill
            </Link>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="mb-6">
            <div className="relative w-full max-w-sm">
              <input
                type="text"
                placeholder="Search skills..."
                className="w-full pl-4 pr-10 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                🔍
              </button>
            </div>
          </form>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {typeof error === 'string' ? error : 'Error loading skills'}
            </div>
          )}

          {skills.items.length === 0 ? (
            <div className="p-12 text-center text-slate-600 bg-white rounded-xl border border-slate-200">
              <p className="text-lg mb-4">No skills found</p>
              <Link to="/admin/skills/new" className="text-teal-600 font-semibold hover:underline">
                Create the first skill
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {skills.items.map((skill) => (
                    <tr key={skill.skillsID} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-900 font-medium">{skill.name}</td>
                      <td className="px-6 py-4 text-right space-x-3 flex justify-end">
                        <Link
                          to={`/admin/skills/${skill.skillsID}/edit`}
                          className="text-teal-600 hover:text-teal-700 font-semibold transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(skill.skillsID)}
                          className="text-red-600 hover:text-red-700 font-semibold transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {skills.totalCount > skills.pageSize && (
            <div className="mt-6 p-4 border border-slate-300 rounded-xl flex justify-between items-center bg-white">
              <div className="text-sm text-slate-600">
                Showing {(page - 1) * skills.pageSize + 1} to {Math.min(page * skills.pageSize, skills.totalCount)} of {skills.totalCount}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => (p * skills.pageSize < skills.totalCount ? p + 1 : p))}
                  disabled={page * skills.pageSize >= skills.totalCount}
                  className="px-3 py-1 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}