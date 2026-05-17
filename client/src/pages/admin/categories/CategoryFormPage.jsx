import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useCategories } from '../../../hooks/useCategories';

export default function CategoryFormPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { category, isLoading, error, fetchCategoryById, createCategory, updateCategory } = useCategories();

  const [formData, setFormData] = useState({ name: '', description: '' });
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode && id) fetchCategoryById(id);
  }, [id, isEditMode]);

  useEffect(() => {
    if (isEditMode && category) {
      setFormData({ name: category.name, description: category.description });
    }
  }, [isEditMode, category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      if (isEditMode) {
        await updateCategory(id, formData);
      } else {
        await createCategory(formData);
      }
      navigate('/admin/categories');
    } catch (err) {
      setFormError(err?.response?.data?.error || err?.response?.data?.[0] || 'Failed to save category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditMode && isLoading)
    return <div className="p-8 text-center text-slate-500">Loading category...</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link to="/admin/categories" className="inline-block mb-6 text-slate-500 hover:text-teal-600 font-medium transition-colors">
        &larr; Back to Categories
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">
          {isEditMode ? 'Edit Category' : 'Create New Category'}
        </h1>

        {(error || formError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error || formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-slate-900 mb-2">
              Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Web Development"
              maxLength="100"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow"
              required
            />
            <p className="text-xs text-slate-500 mt-1">{formData.name.length}/100 characters</p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-slate-900 mb-2">
              Description <span className="text-red-600">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe this category..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow resize-none"
              required
            />
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
      </div>
    </div>
  );
}