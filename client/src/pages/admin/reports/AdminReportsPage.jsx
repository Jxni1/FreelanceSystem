import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReports } from '../../../hooks/useReports';

const STATUS_OPTIONS = ['Pending', 'Reviewed', 'Resolved', 'Rejected'];
const ENTITY_OPTIONS = ['Project', 'User', 'Proposal', 'Review'];

export default function AdminReportsPage() {
  const {
    reports,
    selectedReport,
    isLoading,
    isDetailsLoading,
    isUpdatingStatus,
    error,
    fetchReports,
    fetchReportById,
  updateReportStatus,
deleteReport,
    setSelectedReport,
  } = useReports();

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports({
      page,
      pageSize: 10,
      status: statusFilter || undefined,
      entity: entityFilter || undefined,
    });
  }, [fetchReports, page, statusFilter, entityFilter]);

  const statusBadgeClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Reviewed':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const handleOpenDetails = async (reportId) => {
    await fetchReportById(reportId);
  };

  // NEW: open the reported entity when clicking Review
  const handleReview = (report) => {
    if (report.entity === 'Project') {
      navigate(`/projects/${report.entityID}`, {
        state: {
          moderationMode: true,
          reportId: report.reportsID,
          reportReason: report.reason,
          reportStatus: report.status,
          reporterName: report.username || report.created_by,
          reportEntity: report.entity,
        },
      });
      return;
    }

    // For other entities, you can add routes later
    alert(`Review flow for ${report.entity} is not implemented yet.`);
  };
const handleStatusUpdate = async (reportId, status) => {
  await updateReportStatus(reportId, status);
};

const handleDelete = async (reportId) => {
  if (!window.confirm('Are you sure you want to delete this report?')) return;
  await deleteReport(reportId);

  if (selectedReport?.reportsID === reportId) {
    setSelectedReport(null);
  }
};
  return (
    <div className="space-y-6">
      {/* Header + filters */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Reports
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review user-submitted reports and update moderation status.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
            className="px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            value={entityFilter}
            onChange={(e) => {
              setPage(1);
              setEntityFilter(e.target.value);
            }}
            className="px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All entities</option>
            {ENTITY_OPTIONS.map((entity) => (
              <option key={entity} value={entity}>
                {entity}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table + list */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {error && (
          <div className="p-4 border-b border-rose-200 bg-rose-50 text-sm text-rose-700">
            {error}
          </div>
        )}

        {isLoading && !reports?.items?.length ? (
          <div className="p-10 text-center text-slate-500">
            <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin mb-4" />
            <p className="text-sm">Loading reports...</p>
          </div>
        ) : reports?.items?.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <div className="text-5xl mb-4 opacity-40">🚩</div>
            <p className="text-base font-medium text-slate-700 mb-1">
              No reports found
            </p>
            <p className="text-xs text-slate-500">
              Try changing filters or wait for new reports to arrive.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 border-b border-slate-200">
                  <th className="px-5 py-3">Entity</th>
                  <th className="px-5 py-3">Reason</th>
                  <th className="px-5 py-3">Reporter</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {reports?.items?.map((report) => (
                  <tr
                    key={report.reportsID}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-3 align-middle">
                      <div className="font-semibold text-slate-900">
                        {report.entity}
                      </div>
                      <div className="text-xs text-slate-500 break-all">
                        {report.entityID}
                      </div>
                    </td>

                    <td className="px-5 py-3 align-middle max-w-md">
                      <div className="text-slate-700 truncate">
                        {report.reason}
                      </div>
                    </td>

                    <td className="px-5 py-3 align-middle">
                      <div className="text-slate-900">
                        {report.username || report.created_by || '-'}
                      </div>
                      <div className="text-xs text-slate-500 break-all">
                        {report.userID}
                      </div>
                    </td>

                    <td className="px-5 py-3 align-middle">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${statusBadgeClass(
                          report.status
                        )}`}
                      >
                        {report.status}
                      </span>
                    </td>

                    <td className="px-5 py-3 align-middle text-slate-600 text-xs whitespace-nowrap">
                      {report.created_at
                        ? new Date(report.created_at).toLocaleString()
                        : '-'}
                    </td>

                    <td className="px-5 py-3 align-middle">
                      <div className="flex justify-end flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenDetails(report.reportsID)}
                          className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200"
                        >
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() => handleReview(report)}
                          className="px-2.5 py-1 rounded-md bg-sky-50 text-sky-700 text-xs font-medium hover:bg-sky-100"
                        >
                          Review
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleStatusUpdate(report.reportsID, 'Resolved')
                          }
                          disabled={
                            isUpdatingStatus || report.status === 'Resolved'
                          }
                          className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 disabled:opacity-50"
                        >
                          Resolve
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleStatusUpdate(report.reportsID, 'Rejected')
                          }
                          disabled={
                            isUpdatingStatus || report.status === 'Rejected'
                          }
                          className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-medium hover:bg-amber-100 disabled:opacity-50"
                        >
                          Reject
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(report.reportsID)}
                          className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 text-xs font-medium hover:bg-rose-100"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reports?.totalCount > 10 && (
          <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 text-xs text-slate-500">
            <span>
              Showing{' '}
              <span className="font-semibold text-slate-700">
                {(reports.page - 1) * reports.pageSize + 1}
              </span>{' '}
              to{' '}
              <span className="font-semibold text-slate-700">
                {Math.min(
                  reports.page * reports.pageSize,
                  reports.totalCount
                )}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-slate-700">
                {reports.totalCount}
              </span>{' '}
              results
            </span>

            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={reports.page === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={
                  reports.page * reports.pageSize >= reports.totalCount
                }
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details panel */}
      {selectedReport && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Report details
              </h2>
              <p className="text-xs text-slate-500 mt-1 break-all">
                {selectedReport.reportsID}
              </p>
            </div>
            <button
              onClick={() => setSelectedReport(null)}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Close
            </button>
          </div>

          {isDetailsLoading ? (
            <p className="text-sm text-slate-500">Loading details...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                  Entity
                </p>
                <p className="font-medium text-slate-900">
                  {selectedReport.entity}
                </p>
                <p className="text-xs text-slate-500 break-all mt-1">
                  {selectedReport.entityID}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                  Status
                </p>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${statusBadgeClass(
                    selectedReport.status
                  )}`}
                >
                  {selectedReport.status}
                </span>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 md:col-span-2">
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                  Reason
                </p>
                <p className="text-slate-800 whitespace-pre-wrap">
                  {selectedReport.reason}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                  Reporter
                </p>
                <p className="font-medium text-slate-900">
                  {selectedReport.username ||
                    selectedReport.created_by ||
                    '-'}
                </p>
                <p className="text-xs text-slate-500 break-all mt-1">
                  {selectedReport.userID}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                  Created at
                </p>
                <p className="text-slate-800">
                  {selectedReport.created_at
                    ? new Date(selectedReport.created_at).toLocaleString()
                    : '-'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}