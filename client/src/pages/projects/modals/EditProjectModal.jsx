import { useState } from 'react';
import { projectsApi } from '../../../lib/projectsApi';
import { STATUS_OPTIONS, STATUS_LABELS, VISIBILITY_OPTIONS, VISIBILITY_LABELS, isValidGuid } from '../../../constants/projectConstants';
import Modal from '../../../components/ui/Modal';
import FormField from '../../../components/ui/FormField';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Textarea from '../../../components/ui/Textarea';

export default function EditProjectModal({ project, categories, onClose, onUpdated }) {
  const [form, setForm] = useState({
    title: project.title,
    description: project.description,
    budget: String(project.budget),
    categoryID: project.categoryID,
    visibility: project.visibility ?? 'public',
    status: project.status ?? 'open',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (form.title !== undefined && !form.title.trim()) e.title = 'Title cannot be empty.';
    if (form.budget !== undefined && (isNaN(Number(form.budget)) || Number(form.budget) <= 0))
      e.budget = 'Budget must be a positive number.';
    if (form.categoryID && !isValidGuid(form.categoryID)) e.categoryID = 'Category ID must be a valid GUID.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setServerError(null);
    try {
      const payload = {
        title: form.title.trim() || undefined,
        description: form.description.trim() || undefined,
        budget: form.budget ? Number(form.budget) : undefined,
        categoryID: form.categoryID || undefined,
        visibility: form.visibility,
        status: form.status,
      };
      const res = await projectsApi.update(project.projectID, payload);
      onUpdated(res.data.data);
    } catch (err) {
      console.error('[Update project error]', err.response?.status, err.response?.data);
      const msgs = err.response?.data?.errors;
      const msg = err.response?.data?.errorMessage ?? err.response?.data?.title ?? err.message ?? 'Failed to update project.';
      setServerError(Array.isArray(msgs) && msgs.length ? msgs.join(' ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Edit Project" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {serverError && (
          <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
            {serverError}
          </div>
        )}

        <FormField label="Title" error={errors.title}>
          <Input value={form.title} onChange={set('title')} placeholder="Project title" />
        </FormField>

        <FormField label="Description" error={errors.description}>
          <Textarea value={form.description} onChange={set('description')} placeholder="Describe the project..." />
        </FormField>

        <FormField label="Budget ($)" error={errors.budget}>
          <Input type="number" min="0" step="0.01" value={form.budget} onChange={set('budget')} placeholder="5000.00" />
        </FormField>

        <FormField label="Category ID" error={errors.categoryID}>
          <Input value={form.categoryID} onChange={set('categoryID')} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
          {categories.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {categories.map((c) => (
                <button
                  key={c.categoryID}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, categoryID: c.categoryID }))}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                    form.categoryID === c.categoryID
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400 hover:text-teal-600'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
          {categories.length === 0 && (
            <p className="mt-1 text-xs text-amber-600">No categories yet — use "New Category" to create one first.</p>
          )}
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Status">
            <Select value={form.status} onChange={set('status')}>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </Select>
          </FormField>
          <FormField label="Visibility">
            <Select value={form.visibility} onChange={set('visibility')}>
              {VISIBILITY_OPTIONS.map((v) => <option key={v} value={v}>{VISIBILITY_LABELS[v]}</option>)}
            </Select>
          </FormField>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={submitting}
            className="px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors">
            {submitting ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}