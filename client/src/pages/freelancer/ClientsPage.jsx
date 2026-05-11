import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../lib/apiClient';
import { useClients } from '../../hooks/useClients';
import { ReportModal } from '../admin/reports/ReportModal';

function StarRating({ rating }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`text-xs ${
            i <= Math.round(rating) ? 'text-amber-400' : 'text-slate-300'
          }`}
        >
          ★
        </span>
      ))}
      <span className="ml-1 text-xs text-slate-500">
        {rating > 0 ? rating.toFixed(1) : 'No reviews'}
      </span>
    </span>
  );
}

export default function ClientsPage() {
  const { clients, isLoading, error, fetchClients } = useClients();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('');
  const [page, setPage] = useState(1);

  const [reportingClient, setReportingClient] = useState(null);

  const [projectsClient, setProjectsClient] = useState(null);
  const [clientProjects, setClientProjects] = useState([]);
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);
  const [isProjectsLoading, setIsProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState(null);

  const load = (overrides = {}) => {
    fetchClients({
      page,
      pageSize: 12,
      search: search || undefined,
      industry: industry || undefined,
      ...overrides,
    });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load({ page: 1 });
  };

  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(1);
    setTimeout(() => load({ page: 1 }), 0);
  };

  const openReportModal = (client) => {
    setReportingClient(client);
  };

  const closeReportModal = () => {
    setReportingClient(null);
  };

  const openProjectsModal = async (client) => {
    const clientId = client?.clientID || client?.clientId;
    if (!clientId) return;

    setProjectsClient(client);
    setClientProjects([]);
    setProjectsError(null);
    setIsProjectsLoading(true);
    setIsProjectsModalOpen(true);

    try {
      const response = await apiClient.get(`/api/clients/${clientId}/projects`);

      const data = response?.data;
      const items = data?.value || data?.items || data || [];

      setClientProjects(Array.isArray(items) ? items : []);
    } catch (err) {
      const raw = err?.response?.data;
      const message =
        raw?.message ||
        raw?.error ||
        raw?.title ||
        (typeof raw === 'string'
          ? raw
          : 'Failed to load this client’s projects.');

      setProjectsError(message);
      setClientProjects([]);
    } finally {
      setIsProjectsLoading(false);
    }
  };

  const closeProjectsModal = () => {
    setIsProjectsModalOpen(false);
    setProjectsClient(null);
    setClientProjects([]);
    setProjectsError(null);
  };

  const handleOpenProjectDetails = (projectId) => {
    closeProjectsModal();
    navigate(`/projects/${projectId}`);
  };

  const items = clients?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((clients?.totalCount ?? 0) / 12));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-slate-900">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Find Clients
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Browse and search clients by name or industry.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <input
            type="text"
            placeholder="Search by name or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg bg-white border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-sm font-semibold text-white transition-colors"
          >
            Search
          </button>
        </form>

        <input
          type="text"
          placeholder="Filter by industry..."
          value={industry}
          onChange={(e) => handleFilterChange(setIndustry, e.target.value)}
          className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 sm:w-48"
        />
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <p className="text-lg font-medium">No clients found</p>
          <p className="text-sm mt-1">
            Try adjusting your search or filters.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((c) => (
          <div
            key={c.clientID || c.clientId}
            className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 text-lg font-semibold">
                {c.name?.[0] ?? '?'}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 truncate">
                  {c.name}
                </p>
                <p className="text-xs text-slate-500">@{c.username}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-600 truncate max-w-[60%]">
                {c.industry || 'No industry set'}
              </span>
              <span className="text-teal-600 font-semibold">
                Budget: ${c.budget}
              </span>
            </div>

            <StarRating rating={c.averageRating} />

            {c.bio && (
              <p className="text-xs text-slate-600 line-clamp-3">
                {c.bio}
              </p>
            )}

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => openProjectsModal(c)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700"
              >
                <span>View Projects</span>
                <span aria-hidden>→</span>
              </button>

              <button
                type="button"
                onClick={() => openReportModal(c)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700"
              >
                <span aria-hidden>🚩</span>
                <span>Report</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 rounded-lg text-sm bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-3 py-1.5 text-sm text-slate-500">
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 rounded-lg text-sm bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      <ReportModal
        isOpen={!!reportingClient}
        onClose={closeReportModal}
        initialEntity="Client"
        initialEntityId={reportingClient?.clientID || reportingClient?.userID || ''}
        initialDisplayLabel={
          reportingClient
            ? `${reportingClient.name || 'Unknown'}${
                reportingClient.username ? ` (@${reportingClient.username})` : ''
              }`
            : ''
        }
      />

      {isProjectsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  {projectsClient?.name || 'Client'} Projects
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select a project to open its details page.
                </p>
              </div>
              <button
                type="button"
                onClick={closeProjectsModal}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                Close
              </button>
            </div>

            <div className="p-5 max-h-[70vh] overflow-y-auto">
              {isProjectsLoading ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin" />
                </div>
              ) : projectsError ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  {projectsError}
                </div>
              ) : clientProjects.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <p className="font-medium">No projects found</p>
                  <p className="text-sm mt-1">
                    This client has not posted any projects yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {clientProjects.map((project) => {
                    const projectId = project.projectID || project.projectId;

                    return (
                      <button
                        key={projectId}
                        type="button"
                        onClick={() => handleOpenProjectDetails(projectId)}
                        className="w-full text-left rounded-xl border border-slate-200 bg-slate-50 p-4 hover:border-teal-200 hover:bg-teal-50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate">
                              {project.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                              {project.description || 'No description provided.'}
                            </p>
                          </div>
                          <span className="shrink-0 text-[11px] px-2 py-0.5 rounded-full border bg-white text-slate-600">
                            {project.status || 'Open'}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                          <span>
                            Budget: $
                            {project.budget?.toLocaleString?.() ?? project.budget ?? 0}
                          </span>
                          <span>{project.categoryName || 'Uncategorized'}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}