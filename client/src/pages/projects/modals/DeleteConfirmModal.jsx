import { useState } from 'react';
import { projectsApi } from '../../../lib/projectsApi';
import Modal from '../../../components/ui/Modal';

export default function DeleteConfirmModal({ project, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await projectsApi.remove(project.projectID);
      onDeleted(project.projectID);
    } catch (err) {
      console.error('[Delete project error]', err.response?.status, err.response?.data);
      const msg = err.response?.data?.errorMessage ?? err.response?.data?.title ?? err.message ?? 'Failed to delete project.';
      setError(msg);
      setDeleting(false);
    }
  };

  return (
    <Modal title="Delete Project" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-slate-900">"{project.title}"</span>?
          This action cannot be undone.
        </p>
        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
            {error}
          </div>
        )}
        <div className="flex justify-end gap-3">
          <button onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={deleting}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors">
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </Modal>
  );
}