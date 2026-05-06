import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '../../hooks/useProjects';

export default function ProjectsListPage() {
  const { projects, isLoading, error, fetchProjects, deleteProject } = useProjects();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchProjects({ page, pageSize: 10, search: searchTerm });
  }, [fetchProjects, page, searchTerm]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      await deleteProject(id);
      fetchProjects({ page, pageSize: 10, search: searchTerm });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProjects({ page: 1, pageSize: 10, search: searchTerm });
  };

  const statusBadgeClass = (status) => {
    switch (status) {
      case 'Open':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'InProgress':
        return 'bg-teal-500/10 text-teal-300 border-teal-500/30';
      case 'Completed':
        return 'bg-blue-500/10 text-blue-300 border-blue-500/30';
      case 'Cancelled':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto text-slate-100 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-100 tracking-tight">
            Projects
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Manage projects, budgets, statuses, and visibility from one place.
          </p>
        </div>

        <Link
          to="/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-sm font-semibold text-white shadow-sm transition-colors"
        >
          <span className="text-base leading-none">+</span>
          <span>New Project</span>
        </Link>
      </div>

      {/* Filters / Search bar */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 shadow-sm">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search projects by title..."
              className="w-full pl-4 pr-10 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-3 top-2.5 text-slate-500 hover:text-teal-400 text-sm font-semibold"
            >
              &#x21B5;
            </button>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 border-b border-rose-900/60 bg-rose-950/40 text-xs text-rose-200">
            {typeof error === 'string' ? error : 'Failed to load projects'}
          </div>
        )}

        {/* Loading / empty / table */}
        {isLoading && !projects?.items?.length ? (
          <div className="p-10 text-center text-slate-400">
            <div className="inline-block w-8 h-8 border-4 border-slate-700 border-t-teal-500 rounded-full animate-spin mb-4" />
            <p className="text-sm">Loading projects...</p>
          </div>
        ) : projects?.items?.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <div className="text-5xl mb-4 opacity-40">📁</div>
            <p className="text-base font-medium text-slate-100 mb-1">
              No projects found
            </p>
            <p className="text-xs text-slate-400">
              Get started by creating a new project.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/80 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 border-b border-slate-800">
                  <th className="px-5 py-3">Title</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Budget</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {projects?.items?.map((project) => (
                  <tr
                    key={project.projectID}
                    className="hover:bg-slate-900/70 transition-colors"
                  >
                    <td className="px-5 py-3 align-middle">
                      <div className="font-semibold text-slate-50">
                        {project.title}
                      </div>
                      <div className="text-xs text-slate-400 truncate max-w-xs">
                        {project.description}
                      </div>
                    </td>
                    <td className="px-5 py-3 align-middle">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${statusBadgeClass(
                          project.status
                        )}`}
                      >
                        {project.status || 'Open'}
                      </span>
                    </td>
                    <td className="px-5 py-3 align-middle font-medium text-slate-100">
                      ${project.budget?.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 align-middle text-right space-x-2">
                      <Link
                        to={`/projects/${project.projectID}`}
                        className="text-xs font-semibold text-teal-300 hover:text-teal-200"
                      >
                        View
                      </Link>
                      <Link
                        to={`/projects/${project.projectID}/edit`}
                        className="text-xs font-semibold text-indigo-300 hover:text-indigo-200"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(project.projectID)}
                        className="text-xs font-semibold text-rose-300 hover:text-rose-200"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {projects?.totalCount > 10 && (
          <div className="p-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/70 text-xs text-slate-400">
            <span>
              Showing{' '}
              <span className="font-semibold text-slate-200">
                {(projects.page - 1) * projects.pageSize + 1}
              </span>{' '}
              to{' '}
              <span className="font-semibold text-slate-200">
                {Math.min(projects.page * projects.pageSize, projects.totalCount)}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-slate-200">
                {projects.totalCount}
              </span>{' '}
              results
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={projects.page === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={projects.page * projects.pageSize >= projects.totalCount}
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}