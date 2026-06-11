import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '../../hooks/useProjects';
import { useAuthorization } from '../../hooks/useAuthorization';
import { apiClient } from '../../lib/apiClient';
import ProjectSearchFilter from '../../components/SearchFilters/ProjectSearchFilter';

export default function ProjectsListPage() {
  const {
    projects,
    myProjects,
    isLoading,
    isMyProjectsLoading,
    error,
    fetchProjects,
    fetchMyProjects,
    deleteProject,
  } = useProjects();
  const { isClient } = useAuthorization();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});

  const list = isClient ? myProjects : projects;
  const loading = isClient ? isMyProjectsLoading : isLoading;

  const loadProjects = useCallback(
    (params) => (isClient ? fetchMyProjects(params) : fetchProjects(params)),
    [isClient, fetchMyProjects, fetchProjects],
  );

  // reporting state
  const [reportingProjectId, setReportingProjectId] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [reportError, setReportError] = useState(null);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  useEffect(() => {
    const params = {
      page,
      pageSize: 10,
      ...filters,
    };
    loadProjects(params);
  }, [loadProjects, page, filters]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      await deleteProject(id);
      loadProjects({ page, pageSize: 10, ...filters });
    }
  };

  const handleSearch = (searchFilters) => {
    setFilters(searchFilters);
    setPage(1); // Reset to page 1 when searching
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
            {isClient ? 'My job posts' : 'Projects'}
          </h1>
        </div>
        {isClient && (
          <Link
            to="/projects/new"
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors"
          >
            + New Project
          </Link>
        )}
      </div>

      {/* ADD SEARCH FILTER HERE - ONLY ON THIS PAGE */}
      <ProjectSearchFilter onSearch={handleSearch} />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading && list.items.length === 0 ? (
        <div className="p-8 text-center text-slate-500">Loading projects...</div>
      ) : list.items.length === 0 ? (
        <div className="text-center py-16 text-slate-400">No projects found.</div>
      ) : (
        <div className="space-y-4">
          {list.items.map((project) => (
            <div
              key={project.projectID}
              className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <Link
                    to={`/projects/${project.projectID}`}
                    className="text-lg font-semibold text-teal-600 hover:text-teal-700"
                  >
                    {project.title}
                  </Link>
                  <p className="text-slate-600 text-sm mt-1">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${statusBadgeClass(project.status)}`}>
                      {project.status}
                    </span>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      ${project.budget?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {isClient && (
                    <>
                      <Link
                        to={`/projects/${project.projectID}/edit`}
                        className="px-3 py-1.5 text-sm border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(project.projectID)}
                        className="px-3 py-1.5 text-sm bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => startReporting(project.projectID)}
                    className="px-3 py-1.5 text-sm border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Report
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {list.totalCount > list.pageSize && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-slate-600">Page {page}</span>
          <button
            disabled={page * list.pageSize >= list.totalCount}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {reportingProjectId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Report Project</h3>
            {reportError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {reportError}
              </div>
            )}
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Explain why you're reporting this project..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4 resize-none"
              rows="4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={cancelReporting}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReport}
                disabled={isSubmittingReport}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}