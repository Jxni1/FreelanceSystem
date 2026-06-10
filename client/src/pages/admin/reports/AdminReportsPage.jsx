import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReports } from '../../../hooks/useReports';

const PAGE_SIZE = 10;
const STATUS_OPTIONS = ['Pending', 'Reviewed', 'Resolved', 'Rejected'];
const ENTITY_OPTIONS = ['Project', 'Client', 'Freelancer', 'Proposal', 'Review'];

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
    exportReports,
    importReports,
  } = useReports();

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [importFormat, setImportFormat] = useState('csv');
  const [importFile, setImportFile] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [formError, setFormError] = useState(null);

  const exportMenuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports({
      page,
      pageSize: PAGE_SIZE,
      status: statusFilter || undefined,
      entity: entityFilter || undefined,
    });
  }, [fetchReports, page, statusFilter, entityFilter]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setIsExportOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsExportOpen(false);
        setIsImportOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const currentFilters = {
    page,
    pageSize: PAGE_SIZE,
    status: statusFilter || undefined,
    entity: entityFilter || undefined,
  };

  const openImportModal = () => {
    setImportFormat('csv');
    setImportFile(null);
    setImportResult(null);
    setFormError(null);
    setIsImportOpen(true);
    setIsExportOpen(false);
  };

  const closeImportModal = () => {
    setImportFormat('csv');
    setImportFile(null);
    setImportResult(null);
    setFormError(null);
    setIsImportOpen(false);
  };

  const downloadBlob = (response, fallbackName) => {
    const blob = new Blob([response.data], {
      type: response.headers['content-type'] || 'application/octet-stream',
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    const disposition = response.headers['content-disposition'];
    let fileName = fallbackName;

    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match?.[1]) {
        fileName = match[1];
      }
    }

    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleExport = async (format) => {
    try {
      setIsExportOpen(false);
      const response = await exportReports(currentFilters, format);
      const extension = format === 'excel' ? 'xlsx' : format;
      downloadBlob(response, `reports-export.${extension}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!importFile) {
      setFormError('Please choose a file to import.');
      return;
    }

    try {
      const result = await importReports(importFile, importFormat);
      setImportResult(result?.data ?? result?.value ?? result);

      await fetchReports({
        page,
        pageSize: PAGE_SIZE,
        status: statusFilter || undefined,
        entity: entityFilter || undefined,
      });
    } catch (err) {
      const apiError =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        err?.response?.data?.detail ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        'Failed to import reports.';

      setFormError(apiError);
    }
  };

  const getImportAccept = () => {
    if (importFormat === 'csv') return '.csv';
    if (importFormat === 'excel') return '.xlsx';
    return '.json';
  };

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

  const getEntityLabel = (report) => {
    if (report.entity === 'User' && report.reportedUserRole) {
      return report.reportedUserRole;
    }
    return report.entity;
  };

  const handleOpenDetails = async (reportId) => {
    await fetchReportById(reportId);
  };

  const handleReview = (report) => {
    if (report.entity === 'Project') {
      navigate(`/projects/${report.entityID}`, {
        state: {
          moderationMode: true,
          reportId: report.reportsID,
          reportReason: report.reason,
          reportStatus: report.status,
          reporterName: report.username || report.created_by,
          reportEntity: getEntityLabel(report),
        },
      });
      return;
    }

    alert(`Review flow for ${getEntityLabel(report)} is not implemented yet.`);
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
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Reports
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review user-submitted reports and update moderation status.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <select
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All entities</option>
            {ENTITY_OPTIONS.map((entity) => (
              <option key={entity} value={entity}>
                {entity}
              </option>
            ))}
          </select>

          <div className="relative" ref={exportMenuRef}>
            <button
              type="button"
              onClick={() => setIsExportOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              aria-haspopup="menu"
              aria-expanded={isExportOpen}
            >
              ↓ Export
              <svg
                className={`h-4 w-4 transition-transform ${isExportOpen ? 'rotate-180' : ''}`}
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {isExportOpen && (
              <div
                className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
                role="menu"
              >
                <button
                  type="button"
                  onClick={() => handleExport('csv')}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                  role="menuitem"
                >
                  <span>Export as CSV</span>
                  <span className="text-[10px] font-semibold uppercase text-slate-400">.csv</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExport('excel')}
                  className="flex w-full items-center justify-between border-t border-slate-100 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                  role="menuitem"
                >
                  <span>Export as Excel</span>
                  <span className="text-[10px] font-semibold uppercase text-slate-400">.xlsx</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExport('json')}
                  className="flex w-full items-center justify-between border-t border-slate-100 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                  role="menuitem"
                >
                  <span>Export as JSON</span>
                  <span className="text-[10px] font-semibold uppercase text-slate-400">.json</span>
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={openImportModal}
            className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 hover:bg-amber-100"
          >
            ↑ Import
          </button>
        </div>
      </div>

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
                        {getEntityLabel(report)}
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

                        {/* <button
                          type="button"
                          onClick={() => handleReview(report)}
                          className="px-2.5 py-1 rounded-md bg-sky-50 text-sky-700 text-xs font-medium hover:bg-sky-100"
                        >
                         
                        </button> */}

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

        {reports?.totalCount > PAGE_SIZE && (
          <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 text-xs text-slate-500">
            <span>
              Showing{' '}
              <span className="font-semibold text-slate-700">
                {(reports.page - 1) * reports.pageSize + 1}
              </span>{' '}
              to{' '}
              <span className="font-semibold text-slate-700">
                {Math.min(reports.page * reports.pageSize, reports.totalCount)}
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
                disabled={reports.page * reports.pageSize >= reports.totalCount}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

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
                  {getEntityLabel(selectedReport)}
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
                  {selectedReport.username || selectedReport.created_by || '-'}
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

      {isImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Import Reports</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Upload a supported file and import reports in bulk.
                </p>
              </div>
              <button
                type="button"
                onClick={closeImportModal}
                className="text-sm text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-4 p-6">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase text-slate-500">
                  Format
                </label>
                <select
                  value={importFormat}
                  onChange={(e) => {
                    setImportFormat(e.target.value);
                    setImportFile(null);
                    setImportResult(null);
                    setFormError(null);
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="csv">CSV</option>
                  <option value="excel">Excel</option>
                  <option value="json">JSON</option>
                </select>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                Accepted file type: <span className="font-semibold text-slate-800">{getImportAccept()}</span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase text-slate-500">
                  File
                </label>

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center hover:border-teal-400 hover:bg-teal-50/40">
                  <span className="text-sm font-medium text-slate-700">
                    {importFile ? importFile.name : 'Choose a file'}
                  </span>
                  <span className="mt-1 text-xs text-slate-500">
                    Click to browse {getImportAccept()} file
                  </span>
                  <input
                    type="file"
                    accept={getImportAccept()}
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                Expected fields: Entity, EntityID, Reason, Status, UserID
              </div>

              {importResult && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg border border-emerald-200 bg-white p-3">
                      <div className="text-[11px] font-semibold uppercase text-emerald-600">Total</div>
                      <div className="mt-1 text-lg font-semibold text-emerald-900">{importResult.totalRows}</div>
                    </div>
                    <div className="rounded-lg border border-emerald-200 bg-white p-3">
                      <div className="text-[11px] font-semibold uppercase text-emerald-600">Imported</div>
                      <div className="mt-1 text-lg font-semibold text-emerald-900">{importResult.importedRows}</div>
                    </div>
                    <div className="rounded-lg border border-emerald-200 bg-white p-3">
                      <div className="text-[11px] font-semibold uppercase text-emerald-600">Failed</div>
                      <div className="mt-1 text-lg font-semibold text-emerald-900">{importResult.failedRows}</div>
                    </div>
                  </div>

                  {importResult.errors?.length > 0 && (
                    <div className="mt-3 rounded-lg border border-rose-200 bg-white p-3 text-xs text-rose-700">
                      {importResult.errors.slice(0, 5).map((err, idx) => (
                        <div key={idx}>- {err}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {formError && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  {formError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeImportModal}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
                >
                  Import reports
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}