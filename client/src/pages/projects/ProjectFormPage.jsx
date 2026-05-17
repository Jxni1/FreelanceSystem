import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '../../hooks/useProjects';
import { SmartBackButton } from '../../components/SmartBackButton';
import { useCategories } from '../../hooks/useCategories';

export default function ProjectFormPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { project, isLoading, error, fetchProjectById, createProject, updateProject } = useProjects();
  const { categories: categoriesData, fetchCategories } = useCategories();
  const [formData, setFormData] = useState({

    title: '',
    description: '',
    budget: '',
    visibility: 'Public',
    status: 'Open',
    categoryID: '',
  });

  // const categories = [
  //   { id: '00000000-0000-0000-0000-000000000000', name: 'Uncategorized' },
  //   { id: 'A1B2C3D4-E5F6-4A7B-8C9D-0123456789AB', name: 'Web Development' },
  //   { id: 'B2C3D4E5-F6A7-4B8C-9D01-23456789ABCD', name: 'Mobile Apps' },
  //   { id: 'C3D4E5F6-A7B8-4C9D-0123-456789ABCDEF', name: 'UI/UX Design' },
  // ];

  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      fetchProjectById(id);
    }
  }, [id, isEditMode, fetchProjectById]);

  useEffect(() => {
    if (isEditMode && project) {
      setFormData({
        title: project.title || '',
        description: project.description || '',
        budget: project.budget || '',
        visibility: project.visibility || 'Public',
        status: project.status || 'Open',
        categoryID: project.categoryID || '',
      });
    }
  }, [isEditMode, project]);

  useEffect(() => {
  fetchCategories({ pageSize: 100 });
}, [fetchCategories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleValidation = () => {
    if (!formData.title.trim()) return 'Title is required';
    if (!formData.description.trim()) return 'Description is required';
    if (!formData.budget || isNaN(formData.budget) || Number(formData.budget) <= 0) {
      return 'Budget must be a number greater than 0';
    }
    if (!formData.categoryID) return 'Category is required';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = handleValidation();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        budget: Number(formData.budget),
      };

      if (isEditMode) {
        await updateProject(id, payload);
        navigate(`/projects/${id}`);
      } else {
        const result = await createProject(payload);
        navigate(`/projects/${result.projectID || ''}`);
      }
    } catch (err) {
      setFormError(
        typeof err?.response?.data === 'string'
          ? err.response.data
          : 'Failed to save project. Ensure your account has permission and the category is valid.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditMode && isLoading && !project) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-500">
        <div className="inline-block w-10 h-10 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin mb-4" />
        <p>Loading project form...</p>
      </div>
    );
  }

  const inputClass =
    'w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent';
  const labelClass =
    'block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 mb-2';

  return (
    <div className="max-w-4xl mx-auto text-slate-900 space-y-6">
      <SmartBackButton fallbackTo={isEditMode ? `/projects/${id}` : '/projects'} label="Back" />

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="h-1 bg-linear-to-r from-teal-500 to-emerald-400" />

        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
          <h1 className="text-2xl font-bold text-slate-900">
            {isEditMode ? 'Edit Project' : 'Create New Project'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isEditMode
              ? 'Update project details, visibility, status, and category.'
              : 'Create a new project for the platform using the required fields below.'}
          </p>
        </div>

        <div className="p-6 md:p-8">
          {(error || formError) && (
            <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {formError || (typeof error === 'string' ? error : 'Failed to load data')}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-5">
              <div>
                <label className={labelClass} htmlFor="title">
                  Project Title
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="e.g. Website Redesign Q3"
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="5"
                  value={formData.description}
                  onChange={handleChange}
                  className={`${inputClass} resize-y`}
                  placeholder="Describe the scope, deliverables, and overall goal..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass} htmlFor="budget">
                    Budget
                  </label>
                  <input
                    id="budget"
                    name="budget"
                    type="number"
                    min="1"
                    step="0.01"
                    value={formData.budget}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="5000"
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="visibility">
                    Visibility
                  </label>
                  <select
                    id="visibility"
                    name="visibility"
                    value={formData.visibility}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="Public">Public</option>
                    <option value="Private">Private</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass} htmlFor="categoryID">
                  Category
                </label>
                <select
                  id="categoryID"
                  name="categoryID"
                  value={formData.categoryID}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select a category</option>
                  {categoriesData.items?.map((cat) => (
                    <option key={cat.categoryID} value={cat.categoryID}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {isEditMode && (
                <div>
                  <label className={labelClass} htmlFor="status">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="Open">Open</option>
                    <option value="InProgress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(isEditMode ? `/projects/${id}` : '/projects')}
                className="px-6 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="min-w-40 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isEditMode ? (
                  'Save Changes'
                ) : (
                  'Create Project'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
