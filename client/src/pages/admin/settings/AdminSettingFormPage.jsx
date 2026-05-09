import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSettings } from '../../../hooks/useSettings';

const emptyForm = {
  key: '',
  value: '',
  description: ''
};

export default function AdminSettingFormPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { setting, isLoading, error, fetchSettingById, createSetting, updateSetting } = useSettings();

  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode && id) {
      fetchSettingById(id);
    }
  }, [id, isEditMode]);

  useEffect(() => {
    if (isEditMode && setting) {
      setFormData({
        key: setting.key || '',
        value: setting.value || '',
        description: setting.description || ''
      });
    }
  }, [isEditMode, setting]);

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
        await updateSetting(id, {
          value: formData.value,
          description: formData.description
        });
        navigate('/admin/settings');
      } else {
        await createSetting(formData);
        navigate('/admin/settings');
      }
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Failed to save setting');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditMode && isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 min-h-[50vh] flex flex-col items-center justify-center">
        <div className="inline-block w-10 h-10 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin mb-4" />
        <p>Loading setting...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link to="/admin/settings" className="inline-block mb-6 text-slate-500 hover:text-teal-600 font-medium transition-colors">
        &larr; Back to Settings
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">
          {isEditMode ? 'Edit Setting' : 'Create New Setting'}
        </h1>

        {(error || formError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error || formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="key" className="block text-sm font-semibold text-slate-900 mb-2">
              Setting Key <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="key"
              name="key"
              value={formData.key}
              onChange={handleChange}
              placeholder="e.g., min_withdrawal_amount, currency_code"
              maxLength="255"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow"
              required
              disabled={isEditMode}
            />
            <p className="text-xs text-slate-500 mt-1">Unique identifier for this setting</p>
          </div>

          <div>
            <label htmlFor="value" className="block text-sm font-semibold text-slate-900 mb-2">
              Value <span className="text-red-600">*</span>
            </label>
            <textarea
              id="value"
              name="value"
              value={formData.value}
              onChange={handleChange}
              placeholder="Enter the setting value"
              rows="4"
              maxLength="5000"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow resize-none"
              required
            />
            <p className="text-xs text-slate-500 mt-1">{formData.value.length}/5000 characters</p>
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
              placeholder="Optional description for this setting"
              rows="3"
              maxLength="1000"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow resize-none"
            />
            <p className="text-xs text-slate-500 mt-1">{formData.description.length}/1000 characters</p>
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-semibold rounded-lg transition-all"
            >
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update Setting' : 'Create Setting'}
            </button>
            <Link
              to="/admin/settings"
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