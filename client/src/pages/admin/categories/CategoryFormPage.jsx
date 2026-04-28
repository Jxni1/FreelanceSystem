import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, NavLink } from 'react-router-dom';
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

export default function CategoryFormPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { category, isLoading, error, fetchCategoryById, createCategory, updateCategory } = useCategories();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    photo: ''
  });

  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode && id) {
      fetchCategoryById(id);
    }
  }, [id, isEditMode]);

  useEffect(() => {
    if (isEditMode && category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        photo: category.photo || ''
      });
    }
  }, [isEditMode, category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setFormError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      if (isEditMode) {
        await updateCategory(id, formData);
        navigate('/admin/categories');
      } else {
        await createCategory(formData);
        navigate('/admin/categories');
      }
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  if (isEditMode && isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 min-h-[50vh] flex flex-col items-center justify-center">
        <div className="inline-block w-10 h-10 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin mb-4" />
        <p>Loading category...</p>
      </div>
    );
  }

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

       
      <main className="flex-1 overflow-auto flex items-center justify-center p-8">
        <div className="w-full max-w-2xl">
        
        <section className="bg-[#e8ddd0] rounded-2xl p-8">
          <Link
            to="/admin/categories"
            className="inline-block mb-6 text-slate-600 hover:text-teal-600 font-medium transition-colors"
          >
            &larr; Back to Categories
          </Link>

          {(error || formError) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error || formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl p-6 border border-slate-200">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-900 mb-2">
                Category Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Web Development, Graphic Design"
                maxLength="100"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow"
                required
              />
              <p className="text-xs text-slate-500 mt-1">{formData.name.length}/100 characters</p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-slate-900 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of the category..."
                maxLength="500"
                rows={3}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow resize-none"
              />
              <p className="text-xs text-slate-500 mt-1">{formData.description.length}/500 characters</p>
            </div>

            <div>
              <label htmlFor="photo" className="block text-sm font-semibold text-slate-900 mb-2">
                Photo URL
              </label>
              <input
                type="url"
                id="photo"
                name="photo"
                value={formData.photo}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                maxLength="500"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow"
              />
              {formData.photo && (
                <div className="mt-2">
                  <img
                    src={formData.photo}
                    alt="Preview"
                    className="w-20 h-20 rounded-lg object-cover border border-slate-200"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-semibold rounded-lg transition-all"
              >
                {isSubmitting ? 'Saving...' : isEditMode ? 'Update Category' : 'Create Category'}
              </button>
              <Link
                to="/admin/categories"
                className="px-6 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </section>
        </div>
      </main>
    </div>
  );
}
