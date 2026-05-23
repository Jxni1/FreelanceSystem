import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useContracts } from '../../hooks/useContracts';
import { useAuthorization } from '../../hooks/useAuthorization';

const STATUS_STYLES = {
  Active: 'bg-teal-50 text-teal-700 border-teal-200',
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Completed: 'bg-blue-50 text-blue-700 border-blue-200',
  Cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function ContractsListPage() {
  const {
    contracts,
    isLoading,
    error,
    fetchContracts,
    deleteContract,
    exportContracts,
    importContracts,
  } = useContracts();

  const { isAdmin } = useAuthorization();
  const [filters, setFilters] = useState({ page: 1, pageSize: 10, status: '' });

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [importFormat, setImportFormat] = useState('csv');
  const [importFile, setImportFile] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [formError, setFormError] = useState(null);

  const exportMenuRef = useRef(null);

  useEffect(() => {
    fetchContracts(filters);
  }, [filters, fetchContracts]);

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

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contract?')) {
      try {
        await deleteContract(id);
        fetchContracts(filters);
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const totalPages = Math.max(
    1,
    Math.ceil((contracts.totalCount || 0) / (filters.pageSize || 10))
  );

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

  const getImportAccept = () => {
    if (importFormat === 'csv') return '.csv';
    if (importFormat === 'excel') return '.xlsx';
    return '.json';
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
      if (match && match[1]) {
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
      const response = await exportContracts(filters, format);
      const extension = format === 'excel' ? 'xlsx' : format;
      downloadBlob(response, `contracts-export.${extension}`);
    } catch (err) {
      console.error('Export failed:', err);
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
      const result = await importContracts(importFile, importFormat);
      setImportResult(result?.data ?? result?.value ?? result);
      await fetchContracts(filters);
    } catch (err) {
      const apiError =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        err?.response?.data?.detail ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        'Failed to import contracts.';

      setFormError(apiError);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6 text-slate-900 md:p-8">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Contract Management
          </h1>
          <p className="mt-1 text-xs text-slate-500 md:text-sm">
            View, create, and manage all contracts across the platform.
          </p>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative" ref={exportMenuRef}>
              <button
                type="button"
                onClick={() => setIsExportOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
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
              className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700 shadow-sm transition-colors hover:bg-amber-100"
            >
              ↑ Import
            </button>

            <Link
              to="/admin/contracts/new"
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-purple-700"
            >
              <span className="text-base leading-none">+</span>
              <span>New Contract</span>
            </Link>
          </div>
        )}
      </div>

      <div className="mb-4 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col items-start gap-4 p-4 sm:flex-row sm:items-center">
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))
            }
            className="max-w-xs rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {isLoading && (
        <div className="py-10 text-center text-slate-500">
          <div className="mb-4 inline-block h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-purple-500" />
          <p className="text-sm">Loading contracts...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
          {typeof error === 'string'
            ? error
            : error.message || 'Failed to load contracts.'}
        </div>
      )}

      {!isLoading && !error && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  <th className="px-5 py-3 text-left">Description</th>
                  <th className="px-5 py-3 text-left">Client</th>
                  <th className="px-5 py-3 text-left">Freelancer</th>
                  <th className="px-5 py-3 text-left">Agreed Price</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Start Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contracts.items?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-sm text-slate-500"
                    >
                      No contracts found matching your filters.
                    </td>
                  </tr>
                ) : (
                  contracts.items?.map((contract) => (
                    <tr
                      key={contract.contractID}
                      className="transition-colors hover:bg-slate-50"
                    >
                      <td className="max-w-[260px] truncate px-5 py-3 text-slate-900">
                        {contract.description}
                      </td>
                      <td className="px-5 py-3 font-medium text-slate-700">
                        {contract.clientName}
                      </td>
                      <td className="px-5 py-3 text-slate-700">
                        {contract.freelancerName}
                      </td>
                      <td className="px-5 py-3 font-semibold text-slate-900">
                        ${contract.agreedPrice?.toLocaleString() || 'N/A'}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
                            STATUS_STYLES[contract.status] ||
                            'border-slate-200 bg-slate-100 text-slate-600'
                          }`}
                        >
                          {contract.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-500">
                        {contract.start_Date
                          ? new Date(contract.start_Date).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={
                              isAdmin
                                ? `/admin/contracts/${contract.contractID}`
                                : `/contracts/${contract.contractID}`
                            }
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            View
                          </Link>
                          <Link
                            to={
                              isAdmin
                                ? `/admin/contracts/${contract.contractID}/edit`
                                : `/contracts/${contract.contractID}/edit`
                            }
                            className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700"
                          >
                            Edit
                          </Link>
                          <Link
                            to={
                              isAdmin
                                ? `/admin/contracts/${contract.contractID}/workflow`
                                : `/contracts/${contract.contractID}/workflow`
                            }
                            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                          >
                            Workflow
                          </Link>
                          <Link
                            to={
                              isAdmin
                                ? `/admin/contracts/${contract.contractID}/chat`
                                : `/contracts/${contract.contractID}/chat`
                            }
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                          >
                            Chat
                          </Link>
                          <button
                            onClick={() => handleDelete(contract.contractID)}
                            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {contracts.totalCount > filters.pageSize && (
            <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 text-xs text-slate-500 sm:flex-row">
              <p>
                Showing{' '}
                <span className="font-semibold text-slate-700">
                  {(filters.page - 1) * filters.pageSize + 1}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-slate-700">
                  {Math.min(filters.page * filters.pageSize, contracts.totalCount)}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-slate-700">
                  {contracts.totalCount}
                </span>{' '}
                contracts
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={filters.page <= 1}
                  onClick={() => handlePageChange(filters.page - 1)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="px-2">
                  Page {filters.page} of {totalPages}
                </span>
                <button
                  disabled={filters.page >= totalPages}
                  onClick={() => handlePageChange(filters.page + 1)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {isImportOpen && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Import Contracts</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Upload a supported file and import contracts in bulk.
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
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="csv">CSV</option>
                  <option value="excel">Excel</option>
                  <option value="json">JSON</option>
                </select>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                Accepted file type:{' '}
                <span className="font-semibold text-slate-800">{getImportAccept()}</span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase text-slate-500">
                  File
                </label>

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center hover:border-purple-400 hover:bg-purple-50/40">
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
                Expected fields: Description, ClientID, FreelancerID, ProjectID, ProposalID,
                AgreedPrice, StartDate, EndDate, Status
              </div>

              {importResult && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg border border-emerald-200 bg-white p-3">
                      <div className="text-[11px] font-semibold uppercase text-emerald-600">Total</div>
                      <div className="mt-1 text-lg font-semibold text-emerald-900">
                        {importResult.totalRows}
                      </div>
                    </div>
                    <div className="rounded-lg border border-emerald-200 bg-white p-3">
                      <div className="text-[11px] font-semibold uppercase text-emerald-600">Imported</div>
                      <div className="mt-1 text-lg font-semibold text-emerald-900">
                        {importResult.importedRows}
                      </div>
                    </div>
                    <div className="rounded-lg border border-emerald-200 bg-white p-3">
                      <div className="text-[11px] font-semibold uppercase text-emerald-600">Failed</div>
                      <div className="mt-1 text-lg font-semibold text-emerald-900">
                        {importResult.failedRows}
                      </div>
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
                  className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
                >
                  Import contracts
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}