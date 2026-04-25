import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProjects } from '../../hooks/useProjects';
import { SmartBackButton } from '../../components/SmartBackButton';

export default function ProjectFormPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { project, isLoading, error, fetchProjectById, createProject, updateProject } = useProjects();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    visibility: 'Public',
    status: 'Open',
    categoryID: ''
  });

  const categories = [
    { id: '00000000-0000-0000-0000-000000000000', name: 'Uncategorized' },
    { id: 'A1B2C3D4-E5F6-4A7B-8C9D-0123456789AB', name: 'Web Development' },
    { id: 'B2C3D4E5-F6A7-4B8C-9D01-23456789ABCD', name: 'Mobile Apps' },
    { id: 'C3D4E5F6-A7B8-4C9D-0123-456789ABCDEF', name: 'UI/UX Design' },
  ];

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
        categoryID: project.categoryID || ''
      });
    }
  }, [isEditMode, project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleValidation = () => {
    if (!formData.title.trim()) return "Title is required";
    if (!formData.description.trim()) return "Description is required";
    if (!formData.budget || isNaN(formData.budget) || Number(formData.budget) <= 0) return "Budget must be a number greater than 0";
    if (!formData.categoryID) return "Category is required";
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
        budget: Number(formData.budget)
      };

      if (isEditMode) {
        await updateProject(id, payload);
        navigate(`/projects/${id}`);
      } else {
        const result = await createProject(payload);
        navigate(`/projects/${result.projectID || ''}`);
      }
    } catch (err) {
      setFormError(typeof err?.response?.data === 'string' ? err?.response?.data : 'Failed to save project. Ensure your Client account has permissions to do this or Category IDs matches.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditMode && isLoading && !project) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin mb-4" />
        <p>Loading project form...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto text-slate-100">
      <SmartBackButton fallbackTo={isEditMode ? `/projects/${id}` : '/projects'} label="Back" />

      <div className="bg-white text-slate-900 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-teal-500 to-emerald-400" />
        <div className="p-8">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
            {isEditMode ? 'Edit Project' : 'Create New Project'}
          </h1>
          <p className="text-slate-500 mb-8">
            {isEditMode ? 'Make changes to your project configuration below.' : 'Fill out the initial details to create a new workspace for your project.'}
          </p>

          {(error || formError) && (
            <div className="p-4 mb-6 text-red-700 bg-red-50 rounded-lg border border-red-200 font-medium">
              {formError || (typeof error === 'string' ? error : 'Failed to load data')}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="title">
                  Project Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow bg-slate-50 focus:bg-white"
                  placeholder="e.g. Website Redesign Q3"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="description">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow bg-slate-50 focus:bg-white resize-y"
                  placeholder="Describe the main goals and scope..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="budget">
                    Budget ($) *
                  </label>
                  <input
                    type="number"
                    id="budget"
                    name="budget"
                    min="1"
                    step="0.01"
                    required
                    value={formData.budget}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow bg-slate-50 focus:bg-white"
                    placeholder="e.g. 5000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="visibility">
                    Visibility *
                  </label>
                  <select
                    id="visibility"
                    name="visibility"
                    value={formData.visibility}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow bg-slate-50 focus:bg-white"
                  >
                    <option value="Public">Public</option>
                    <option value="Private">Private</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="categoryID">
                  Category *
                </label>
                <select
                  id="categoryID"
                  name="categoryID"
                  required
                  value={formData.categoryID}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow bg-slate-50 focus:bg-white"
                >
                  <option value="" disabled>Select a Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {isEditMode && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="status">
                    Status *
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow bg-slate-50 focus:bg-white"
                  >
                    <option value="Open">Open</option>
                    <option value="InProgress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(isEditMode ? `/projects/${id}` : '/projects')}
                className="px-6 py-3 font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2 min-w-[140px]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  isEditMode ? 'Save Changes' : 'Create Project'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
