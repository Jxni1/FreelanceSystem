import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '../../hooks/useProjects';
import { useAuthorization } from '../../hooks/useAuthorization';
import { apiClient } from '../../lib/apiClient';

export default function ProjectsListPage() {
  const { projects, isLoading, error, fetchProjects, deleteProject } = useProjects();
  const { isClient } = useAuthorization();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  // reporting state
  const [reportingProjectId, setReportingProjectId] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [reportError, setReportError] = useState(null);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

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
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'InProgress':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Completed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const startReporting = (projectId) => {
    setReportingProjectId(projectId);
    setReportReason('');
    setReportError(null);
  };

  const cancelReporting = () => {
    setReportingProjectId(null);
    setReportReason('');
    setReportError(null);
  };

  const handleSubmitReport = async () => {
    if (!reportReason.trim()) {
      setReportError('Please enter a reason for this report.');
      return;
    }

    try {
      setIsSubmittingReport(true);
      setReportError(null);

      await apiClient.post('/api/reports', {
        entity: 'Project',
        entityID: reportingProjectId,
        reason: reportReason.trim(),
      });

      cancelReporting();
      alert('Report submitted successfully.');
    } catch (err) {
      const raw = err?.response?.data;
      setReportError(
        raw?.message ||
          raw?.error ||
          raw?.title ||
          (typeof raw === 'string' ? raw : 'Failed to submit report.')
      );
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto text-slate-900 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Projects
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Manage projects, budgets, statuses, and visibility from one place.
          </p>
        </div>

        {isClient && (
          <Link
            to="/projects/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-sm font-semibold text-white shadow-sm transition-colors"
          >
            <span className="text-base leading-none">+</span>
            <span>New Project</span>
          </Link>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search projects by title..."
              className="w-full pl-4 pr-10 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-3 top-2.5 text-slate-400 hover:text-teal-600 text-sm font-semibold"
            >
              &#x21B5;
            </button>
          </form>
        </div>

        {error && (
          <div className="p-4 border-b border-rose-200 bg-rose-50 text-xs text-rose-700">
            {typeof error === 'string' ? error : 'Failed to load projects'}
          </div>
        )}

        {isLoading && !projects?.items?.length ? (
          <div className="p-10 text-center text-slate-500">
            <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin mb-4" />
            <p className="text-sm">Loading projects...</p>
          </div>
        ) : projects?.items?.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <div className="text-5xl mb-4 opacity-40">📁</div>
            <p className="text-base font-medium text-slate-700 mb-1">
              No projects found
            </p>
            <p className="text-xs text-slate-500">
              Get started by creating a new project.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 border-b border-slate-200">
                    <th className="px-5 py-3">Title</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Budget</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {projects?.items?.map((project) => (
                    <tr
                      key={project.projectID}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-5 py-3 align-middle">
                        <div className="font-semibold text-slate-900">
                          {project.title}
                        </div>
                        <div className="text-xs text-slate-500 truncate max-w-xs">
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
                      <td className="px-5 py-3 align-middle font-medium text-slate-900">
                        ${project.budget?.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 align-middle text-right space-x-2">
                        <Link
                          to={`/projects/${project.projectID}`}
                          className="text-xs font-semibold text-teal-600 hover:text-teal-700"
                        >
                          View
                        </Link>
                        <Link
                          to={`/projects/${project.projectID}/edit`}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(project.projectID)}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => startReporting(project.projectID)}
                          className="text-xs font-semibold text-amber-600 hover:text-amber-700"
                        >
                          Report
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {reportingProjectId && (
              <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">
                <div className="max-w-xl">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-slate-800">
                      Report project
                    </p>
                    <button
                      type="button"
                      onClick={cancelReporting}
                      className="text-[11px] text-slate-500 hover:text-slate-700"
                    >
                      Cancel
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Describe why this project should be reported..."
                  />
                  {reportError && (
                    <p className="mt-1 text-[11px] text-rose-600">{reportError}</p>
                  )}
                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={cancelReporting}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700 hover:bg-slate-100"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitReport}
                      disabled={isSubmittingReport}
                      className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-xs font-semibold text-white disabled:bg-amber-300"
                    >
                      {isSubmittingReport ? 'Sending...' : 'Submit report'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {projects?.totalCount > 10 && (
          <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 text-xs text-slate-500">
            <span>
              Showing{' '}
              <span className="font-semibold text-slate-700">
                {(projects.page - 1) * projects.pageSize + 1}
              </span>{' '}
              to{' '}
              <span className="font-semibold text-slate-700">
                {Math.min(projects.page * projects.pageSize, projects.totalCount)}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-slate-700">
                {projects.totalCount}
              </span>{' '}
              results
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={projects.page === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={projects.page * projects.pageSize >= projects.totalCount}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
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