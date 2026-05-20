import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '../../hooks/useProjects';
import { SmartBackButton } from '../../components/SmartBackButton';
import { useCategories } from '../../hooks/useCategories';
import { skillService } from '../../lib/skillService';

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

  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [allSkills, setAllSkills] = useState([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState([]);
  const [skillSearch, setSkillSearch] = useState('');

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
    skillService.getAll({ pageSize: 200 }).then(data => {
      const skills = data?.items ?? data ?? [];
      setAllSkills(skills);
      if (isEditMode && project?.skills?.length > 0) {
        const matched = skills
          .filter(s => project.skills.includes(s.name))
          .map(s => s.skillsID);
        setSelectedSkillIds(matched);
      }
    }).catch(() => {});
  }, [isEditMode, project]);

  useEffect(() => {
    fetchCategories({ pageSize: 100 });
  }, [fetchCategories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleSkill = (skillId) => {
    setSelectedSkillIds(prev =>
      prev.includes(skillId) ? prev.filter(s => s !== skillId) : [...prev, skillId]
    );
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
        skillIds: selectedSkillIds,
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

  const filteredSkills = allSkills.filter(s =>
    s.name.toLowerCase().includes(skillSearch.toLowerCase())
  );

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

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4">
              <div>
                <p className={labelClass}>Required Skills</p>
                <p className="text-xs text-slate-400 mb-3">
                  Select the skills freelancers will need to complete this project.
                </p>
                {selectedSkillIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {allSkills
                      .filter(s => selectedSkillIds.includes(s.skillsID))
                      .map(s => (
                        <span
                          key={s.skillsID}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200"
                        >
                          {s.name}
                          <button
                            type="button"
                            onClick={() => toggleSkill(s.skillsID)}
                            className="text-teal-500 hover:text-teal-700 leading-none"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                  </div>
                )}
                <input
                  type="text"
                  placeholder="Search skills..."
                  value={skillSearch}
                  onChange={e => setSkillSearch(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 mb-2"
                />
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                  {filteredSkills.map(s => (
                    <button
                      key={s.skillsID}
                      type="button"
                      onClick={() => toggleSkill(s.skillsID)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        selectedSkillIds.includes(s.skillsID)
                          ? 'bg-teal-600 border-teal-600 text-white'
                          : 'bg-white border-slate-300 text-slate-600 hover:border-teal-400 hover:text-teal-600'
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                  {filteredSkills.length === 0 && (
                    <p className="text-xs text-slate-400">No skills found.</p>
                  )}
                </div>
              </div>
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
