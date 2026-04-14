import StatusBadge from './StatusBadge';
import VisibilityBadge from './VisibilityBadge';

export default function ProjectsTable({ projects, onDetail, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            <th className="text-left px-5 py-3 font-semibold text-slate-500 uppercase tracking-wider text-xs">Title</th>
            <th className="text-left px-5 py-3 font-semibold text-slate-500 uppercase tracking-wider text-xs">Client</th>
            <th className="text-left px-5 py-3 font-semibold text-slate-500 uppercase tracking-wider text-xs">Category</th>
            <th className="text-right px-5 py-3 font-semibold text-slate-500 uppercase tracking-wider text-xs">Budget</th>
            <th className="text-left px-5 py-3 font-semibold text-slate-500 uppercase tracking-wider text-xs">Status</th>
            <th className="text-left px-5 py-3 font-semibold text-slate-500 uppercase tracking-wider text-xs">Visibility</th>
            <th className="text-right px-5 py-3 font-semibold text-slate-500 uppercase tracking-wider text-xs">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {projects.map((project) => (
            <tr key={project.projectID} className="hover:bg-slate-50/70 transition-colors group">
              <td className="px-5 py-3.5">
                <button
                  onClick={() => onDetail(project)}
                  className="font-medium text-slate-900 hover:text-teal-600 transition-colors text-left"
                >
                  {project.title}
                </button>
              </td>
              <td className="px-5 py-3.5 text-slate-500">{project.clientName ?? '—'}</td>
              <td className="px-5 py-3.5 text-slate-500">{project.categoryName ?? '—'}</td>
              <td className="px-5 py-3.5 text-right font-medium text-slate-800">
                ${Number(project.budget).toLocaleString()}
              </td>
              <td className="px-5 py-3.5"><StatusBadge status={project.status} /></td>
              <td className="px-5 py-3.5"><VisibilityBadge visibility={project.visibility} /></td>
              <td className="px-5 py-3.5">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit(project)}
                    className="p-1.5 rounded-lg hover:bg-teal-50 text-slate-400 hover:text-teal-600 transition-colors"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(project)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}