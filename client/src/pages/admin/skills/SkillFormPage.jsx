import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, NavLink } from 'react-router-dom';
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

export default function SkillFormPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { skill, isLoading, error, fetchSkillById, createSkill, updateSkill } = useSkills();

  const [formData, setFormData] = useState({
    name: ''
  });

  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode && id) {
      fetchSkillById(id);
    }
  }, [id, isEditMode]);

  useEffect(() => {
    if (isEditMode && skill) {
      setFormData({
        name: skill.name || ''
      });
    }
  }, [isEditMode, skill]);

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
        await updateSkill(id, formData);
        navigate('/admin/skills');
      } else {
        await createSkill(formData);
        navigate('/admin/skills');
      }
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Failed to save skill');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  const displayName = user?.username ?? user?.email ?? 'Admin';

  if (isEditMode && isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 min-h-[50vh] flex flex-col items-center justify-center">
        <div className="inline-block w-10 h-10 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin mb-4" />
        <p>Loading skill...</p>
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
        {/* Form Section */}
        <section className="bg-[#e8ddd0] rounded-2xl p-8 max-w-2xl">
          {(error || formError) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error || formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl p-6 border border-slate-200">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-900 mb-2">
                Skill Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., React, Node.js, UI Design"
                maxLength="255"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow"
                required
              />
              <p className="text-xs text-slate-500 mt-1">{formData.name.length}/255 characters</p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-semibold rounded-lg transition-all"
              >
                {isSubmitting ? 'Saving...' : isEditMode ? 'Update Skill' : 'Create Skill'}
              </button>
              <Link
                to="/admin/skills"
                className="px-6 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}