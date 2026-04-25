import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSkills } from '../../../hooks/useSkills';

export default function SkillFormPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
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

  if (isEditMode && isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 min-h-[50vh] flex flex-col items-center justify-center">
        <div className="inline-block w-10 h-10 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin mb-4" />
        <p>Loading skill...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link to="/admin/skills" className="inline-block mb-6 text-slate-500 hover:text-teal-600 font-medium transition-colors">
        &larr; Back to Skills
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">
          {isEditMode ? 'Edit Skill' : 'Create New Skill'}
        </h1>

        {(error || formError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error || formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow"
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
      </div>
    </div>
  );
}