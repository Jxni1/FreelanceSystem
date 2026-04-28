import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCategories } from '../../../hooks/useCategories';
import { useAuth } from '../../../context/AuthContext';

const sidebarNavItems = [
  { label: 'Dashboard', to: '/admin/dashboard' },
  { label: 'User Management', to: '/admin/users' },
  { label: 'Contracts', to: '/admin/contracts' },
  { label: 'Milestones', to: '/admin/milestones' },
  { label: 'Skills', to: '/admin/skills' },
  { label: 'Categories', to: '/admin/categories' },
  { label: 'Financials', to: '/admin/financials' },
  { label: 'Global Settings', to: '/admin/settings' },
  { label: 'Audit Logs', to: '/admin/logs' },
];

export default function CategoriesListPage() {
  const { categories, isLoading, error, fetchCategories, deleteCategory } = useCategories();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchCategories({ page, pageSize: 10, search: searchTerm });
  }, [page, searchTerm]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      await deleteCategory(id);
      fetchCategories({ page, pageSize: 10, search: searchTerm });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCategories({ page: 1, pageSize: 10, search: searchTerm });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f0e6d8]">
      
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
 
      <main className="flex-1 overflow-auto p-8 space-y-6">
       
        <section className="bg-[#e8ddd0] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-800">Categories Management</h1>
            <Link
              to="/admin/categories/new"
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2"
            >
              <span className="text-xl leading-none">+</span> New Category
            </Link>
          </div>
         
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-sm mb-4">
            <input
              type="text"
              placeholder="Search categories..."
              className="w-full pl-4 pr-10 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              🔍
            </button>
          </form>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {typeof error === 'string' ? error : 'Error loading categories'}
            </div>
          )}

          {isLoading && categories.items.length === 0 ? (
            <div className="py-12 text-center text-slate-500 flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin" />
              <p>Loading categories...</p>
            </div>
          ) : categories.items.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <p className="text-lg mb-4">No categories found</p>
              <Link to="/admin/categories/new" className="text-teal-600 font-semibold hover:underline">
                Create the first category
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
              <table className="w-full text-sm text-slate-600">
                <thead>
                  <tr className="text-left border-b border-slate-200 bg-slate-50 text-slate-500">
                    <th className="px-6 py-3 font-semibold uppercase text-xs tracking-wider">Photo</th>
                    <th className="px-6 py-3 font-semibold uppercase text-xs tracking-wider">Name</th>
                    <th className="px-6 py-3 font-semibold uppercase text-xs tracking-wider">Description</th>
                    <th className="px-6 py-3 font-semibold uppercase text-xs tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {categories.items.map((cat) => (
                    <tr key={cat.categoryID} className="hover:bg-[#f7f3ef] transition-colors">
                      <td className="px-6 py-4">
                        {cat.photo ? (
                          <img
                            src={cat.photo}
                            alt={cat.name}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                            N/A
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">{cat.name}</td>
                      <td className="px-6 py-4 text-slate-500 max-w-xs truncate">{cat.description || '—'}</td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <Link
                          to={`/admin/categories/${cat.categoryID}/edit`}
                          className="text-teal-600 hover:text-teal-700 font-semibold transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(cat.categoryID)}
                          className="text-red-600 hover:text-red-700 font-semibold transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {categories.totalCount > categories.pageSize && (
                <div className="px-6 py-4 border-t border-slate-200 flex justify-between items-center bg-slate-50">
                  <span className="text-sm text-slate-600">
                    Showing {(page - 1) * categories.pageSize + 1} to {Math.min(page * categories.pageSize, categories.totalCount)} of {categories.totalCount}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(p => (p * categories.pageSize < categories.totalCount ? p + 1 : p))}
                      disabled={page * categories.pageSize >= categories.totalCount}
                      className="px-3 py-1 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
