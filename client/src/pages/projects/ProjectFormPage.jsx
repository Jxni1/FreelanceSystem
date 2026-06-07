import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useProjects } from '../../hooks/useProjects';
import { useCategories } from '../../hooks/useCategories';
import { skillService } from '../../lib/skillService';
import { SmartBackButton } from '../../components/SmartBackButton';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PageHeading } from '../../components/ui/PageHeading';

const inputClass =
  'h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100';
const labelClass = 'mb-1.5 block text-sm font-medium text-slate-700';

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
    if (isEditMode) fetchProjectById(id);
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
    skillService
      .getAll({ pageSize: 200 })
      .then((data) => {
        const skills = data?.items ?? data ?? [];
        setAllSkills(skills);
        if (isEditMode && project?.skills?.length > 0) {
          setSelectedSkillIds(skills.filter((s) => project.skills.includes(s.name)).map((s) => s.skillsID));
        }
      })
      .catch(() => {});
  }, [isEditMode, project]);

  useEffect(() => {
    fetchCategories({ pageSize: 100 });
  }, [fetchCategories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleSkill = (skillId) => {
    setSelectedSkillIds((prev) => (prev.includes(skillId) ? prev.filter((s) => s !== skillId) : [...prev, skillId]));
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
      const payload = { ...formData, budget: Number(formData.budget), skillIds: selectedSkillIds };
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
          : 'Failed to save project. Ensure your account has permission and the category is valid.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditMode && isLoading && !project) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-slate-500">
        <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-700" />
        <p>Loading…</p>
      </div>
    );
  }

  const selectedSkills = allSkills.filter((s) => selectedSkillIds.includes(s.skillsID));
  const filteredSkills = allSkills.filter((s) => s.name.toLowerCase().includes(skillSearch.toLowerCase()));

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <SmartBackButton fallbackTo={isEditMode ? `/projects/${id}` : '/projects'} label="Back" />

      <PageHeading
        title={isEditMode ? 'Edit job post' : 'Post a job'}
        subtitle={isEditMode ? 'Update the details, budget, status and required skills.' : 'Describe the work, set a budget, and pick the skills you need.'}
      />

      {(error || formError) ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {formError || (typeof error === 'string' ? error : 'Failed to load data')}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card title="Job details">
          <div className="space-y-5">
            <div>
              <label className={labelClass} htmlFor="title">Job title</label>
              <input id="title" name="title" type="text" value={formData.title} onChange={handleChange} className={inputClass} placeholder="e.g. Senior Product Designer — B2B SaaS Dashboard" />
            </div>

            <div>
              <label className={labelClass} htmlFor="description">Description</label>
              <textarea id="description" name="description" rows="5" value={formData.description} onChange={handleChange} className={`${inputClass} h-auto resize-y py-3`} placeholder="Describe the scope, deliverables, and overall goal…" />
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="budget">Budget ($)</label>
                <input id="budget" name="budget" type="number" min="1" step="0.01" value={formData.budget} onChange={handleChange} className={inputClass} placeholder="5000" />
              </div>
              <div>
                <label className={labelClass} htmlFor="visibility">Visibility</label>
                <select id="visibility" name="visibility" value={formData.visibility} onChange={handleChange} className={inputClass}>
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="categoryID">Category</label>
                <select id="categoryID" name="categoryID" value={formData.categoryID} onChange={handleChange} className={inputClass}>
                  <option value="">Select a category</option>
                  {categoriesData.items?.map((cat) => (
                    <option key={cat.categoryID} value={cat.categoryID}>{cat.name}</option>
                  ))}
                </select>
              </div>
              {isEditMode ? (
                <div>
                  <label className={labelClass} htmlFor="status">Status</label>
                  <select id="status" name="status" value={formData.status} onChange={handleChange} className={inputClass}>
                    <option value="Open">Open</option>
                    <option value="InProgress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              ) : null}
            </div>
          </div>
        </Card>

        <Card title="Required skills">
          {selectedSkills.length > 0 ? (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {selectedSkills.map((s) => (
                <span key={s.skillsID} className="inline-flex items-center gap-1 rounded-full border border-brand-100 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
                  {s.name}
                  <button type="button" onClick={() => toggleSkill(s.skillsID)} className="text-brand-500 hover:text-brand-700" aria-label={`Remove ${s.name}`}>
                    <X className="h-3 w-3" aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>
          ) : null}

          <input type="text" placeholder="Search skills…" value={skillSearch} onChange={(e) => setSkillSearch(e.target.value)} className={`${inputClass} mb-3`} />

          <div className="flex max-h-44 flex-wrap gap-2 overflow-y-auto">
            {filteredSkills.map((s) => (
              <button
                key={s.skillsID}
                type="button"
                onClick={() => toggleSkill(s.skillsID)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  selectedSkillIds.includes(s.skillsID)
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : 'border-line bg-white text-slate-600 hover:border-brand-300 hover:text-brand-700'
                }`}
              >
                {s.name}
              </button>
            ))}
            {filteredSkills.length === 0 ? <p className="text-xs text-slate-400">No skills found.</p> : null}
          </div>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button as="button" type="button" variant="outline" onClick={() => navigate(isEditMode ? `/projects/${id}` : '/projects')} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button as="button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : isEditMode ? 'Save changes' : 'Post job'}
          </Button>
        </div>
      </form>
    </div>
  );
}
