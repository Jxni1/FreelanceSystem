import Modal from '../../../components/ui/Modal';
import StatusBadge from '../components/StatusBadge';
import VisibilityBadge from '../components/VisibilityBadge';

export default function ProjectDetailModal({ project, onClose, onEdit, onDelete }) {
  return (
    <Modal title="Project Details" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">{project.title}</h3>
          <p className="mt-1 text-sm text-slate-500">{project.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-1">Budget</p>
            <p className="font-semibold text-slate-800">${Number(project.budget).toLocaleString()}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-1">Status</p>
            <StatusBadge status={project.status} />
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-1">Visibility</p>
            <VisibilityBadge visibility={project.visibility} />
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-1">Category</p>
            <p className="font-medium text-slate-800 truncate">{project.categoryName ?? '—'}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 col-span-2">
            <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-1">Client</p>
            <p className="font-medium text-slate-800">{project.clientName ?? '—'}</p>
          </div>
        </div>

        <div className="text-xs text-slate-400 space-y-0.5">
          <p>Created: {new Date(project.createdAt).toLocaleString()}</p>
          <p>Updated: {new Date(project.updatedAt).toLocaleString()}</p>
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <button onClick={() => { onClose(); onDelete(project); }}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors">
            Delete
          </button>
          <button onClick={() => { onClose(); onEdit(project); }}
            className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors">
            Edit
          </button>
        </div>
      </div>
    </Modal>
  );
}