import { useState } from 'react';
import { categoriesApi } from '../../../lib/projectsApi';
import Modal from '../../../components/ui/Modal';
import FormField from '../../../components/ui/FormField';
import Input from '../../../components/ui/Input';
import Textarea from '../../../components/ui/Textarea';

export default function CreateCategoryModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required.'); return; }
    setSubmitting(true);
    setError(null);
    try {
      const res = await categoriesApi.create({ name: name.trim(), description: description.trim() || null });
      onCreated(res.data);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to create category.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="New Category" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>
        )}
        <FormField label="Name">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Web Development" autoFocus />
        </FormField>
        <FormField label="Description (optional)">
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description…" />
        </FormField>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={submitting}
            className="px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors">
            {submitting ? 'Creating…' : 'Create Category'}
          </button>
        </div>
      </form>
    </Modal>
  );
}