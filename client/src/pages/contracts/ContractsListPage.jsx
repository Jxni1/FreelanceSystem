import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Download,
  Upload,
  ChevronDown,
  X,
  Eye,
  Pencil,
  Trash2,
  MessageSquare,
  GitBranch,
  FileText,
} from 'lucide-react';
import { useContracts } from '../../hooks/useContracts';
import { useAuthorization } from '../../hooks/useAuthorization';
import { PageHeading } from '../../components/ui/PageHeading';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

const STATUS_TONE = {
  Active: 'emerald',
  Pending: 'amber',
  Completed: 'blue',
  Cancelled: 'rose',
};

const iconBtn =
  'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-brand-700';

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatMoney(value) {
  const n = Number(value);
  return Number.isFinite(n) ? `$${n.toLocaleString()}` : '—';
}

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
        console.error(err);
      }
    }
  };

  const handlePageChange = (newPage) => setFilters((prev) => ({ ...prev, page: newPage }));

  const totalPages = Math.max(1, Math.ceil((contracts.totalCount || 0) / (filters.pageSize || 10)));

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
      if (match && match[1]) fileName = match[1];
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

  const viewPath = (contractId) => (isAdmin ? `/admin/contracts/${contractId}` : `/contracts/${contractId}`);
  const editPath = (contractId) => (isAdmin ? `/admin/contracts/${contractId}/edit` : `/contracts/${contractId}/edit`);
  const workflowPath = (contractId) =>
    isAdmin ? `/admin/contracts/${contractId}/workflow` : `/contracts/${contractId}/workflow`;

  const items = contracts.items ?? [];
  const showingFrom = (filters.page - 1) * filters.pageSize + 1;
  const showingTo = Math.min(filters.page * filters.pageSize, contracts.totalCount);

  return (
    <div className="space-y-6">
      <PageHeading
        title="Contracts"
        subtitle="Track agreements, milestones and payments across your engagements."
        actions={
          isAdmin ? (
            <>
              <div className="relative" ref={exportMenuRef}>
                <Button
                  as="button"
                  type="button"
                  variant="outline"
                  icon={Download}
                  iconRight={ChevronDown}
                  onClick={() => setIsExportOpen((prev) => !prev)}
                  aria-haspopup="menu"
                  aria-expanded={isExportOpen}
                >
                  Export
                </Button>
                {isExportOpen ? (
                  <div
                    className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-line bg-white shadow-lg"
                    role="menu"
                  >
                    {[
                      ['csv', 'CSV'],
                      ['excel', 'Excel'],
                      ['json', 'JSON'],
                    ].map(([fmt, label]) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => handleExport(fmt)}
                        className="flex w-full items-center justify-between border-b border-line px-4 py-2.5 text-left text-sm text-slate-700 last:border-0 hover:bg-slate-50"
                        role="menuitem"
                      >
                        <span>Export as {label}</span>
                        <span className="text-[10px] font-semibold uppercase text-slate-400">
                          {fmt === 'excel' ? 'xlsx' : fmt}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <Button as="button" type="button" variant="outline" icon={Upload} onClick={openImportModal}>
                Import
              </Button>
              <Button to="/admin/contracts/new" icon={Plus}>
                New contract
              </Button>
            </>
          ) : null
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))}
          className="h-10 rounded-xl border border-line bg-white px-3.5 text-sm text-slate-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        >
          <option value="">All statuses</option>
          <option value="Pending">Pending</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        {!isLoading && !error ? (
          <p className="text-sm text-slate-500">
            {contracts.totalCount || 0} {contracts.totalCount === 1 ? 'contract' : 'contracts'}
          </p>
        ) : null}
      </div>

      {error && !isLoading ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {typeof error === 'string' ? error : error.message || 'Failed to load contracts.'}
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-brand-100 border-t-brand-700" />
        </div>
      ) : null}

      {!isLoading && !error ? (
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                <FileText className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <p className="font-semibold text-slate-900">No contracts yet</p>
                <p className="mt-1 text-sm text-slate-500">
                  Contracts appear here once a proposal is accepted and an agreement is created.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-line bg-slate-50">
                  <tr className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    <th className="px-5 py-3 text-left">Contract</th>
                    <th className="px-5 py-3 text-left">Client</th>
                    <th className="px-5 py-3 text-left">Freelancer</th>
                    <th className="px-5 py-3 text-left">Value</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left">Period</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {items.map((contract) => (
                    <tr key={contract.contractID} className="transition-colors hover:bg-slate-50">
                      <td className="px-5 py-3.5">
                        <Link
                          to={viewPath(contract.contractID)}
                          className="block max-w-xs truncate font-semibold text-slate-900 hover:text-brand-700"
                        >
                          {contract.description || 'Untitled contract'}
                        </Link>
                        {contract.projectTitle ? (
                          <p className="mt-0.5 max-w-xs truncate text-xs text-slate-400">{contract.projectTitle}</p>
                        ) : null}
                      </td>
                      <td className="px-5 py-3.5 text-slate-700">{contract.clientName || '—'}</td>
                      <td className="px-5 py-3.5 text-slate-700">{contract.freelancerName || '—'}</td>
                      <td className="px-5 py-3.5 font-semibold text-slate-900 tabular-nums">
                        {formatMoney(contract.agreedPrice)}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge tone={STATUS_TONE[contract.status] || 'slate'}>{contract.status || 'Unknown'}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">
                        {formatDate(contract.start_Date)} – {formatDate(contract.end_Date)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link to={viewPath(contract.contractID)} className={iconBtn} title="View" aria-label="View contract">
                            <Eye className="h-4 w-4" aria-hidden="true" />
                          </Link>
                          <Link to={workflowPath(contract.contractID)} className={iconBtn} title="Workflow" aria-label="Open workflow">
                            <GitBranch className="h-4 w-4" aria-hidden="true" />
                          </Link>
                          {!isAdmin ? (
                            <Link
                              to={`/chat/new?contractId=${contract.contractID}`}
                              className={iconBtn}
                              title="Message"
                              aria-label="Message"
                            >
                              <MessageSquare className="h-4 w-4" aria-hidden="true" />
                            </Link>
                          ) : null}
                          <Link to={editPath(contract.contractID)} className={iconBtn} title="Edit" aria-label="Edit contract">
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                          </Link>
                          {isAdmin ? (
                            <button
                              type="button"
                              onClick={() => handleDelete(contract.contractID)}
                              className={`${iconBtn} hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600`}
                              title="Delete"
                              aria-label="Delete contract"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {contracts.totalCount > filters.pageSize ? (
            <div className="flex flex-col items-center justify-between gap-3 border-t border-line bg-slate-50 px-5 py-3.5 text-xs text-slate-500 sm:flex-row">
              <p>
                Showing <span className="font-semibold text-slate-700">{showingFrom}</span> to{' '}
                <span className="font-semibold text-slate-700">{showingTo}</span> of{' '}
                <span className="font-semibold text-slate-700">{contracts.totalCount}</span> contracts
              </p>
              <div className="flex items-center gap-2">
                <Button
                  as="button"
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={filters.page <= 1}
                  onClick={() => handlePageChange(filters.page - 1)}
                >
                  Previous
                </Button>
                <span className="px-1">
                  Page {filters.page} of {totalPages}
                </span>
                <Button
                  as="button"
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={filters.page >= totalPages}
                  onClick={() => handlePageChange(filters.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {isImportOpen && isAdmin ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-line bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Import contracts</h3>
                <p className="mt-1 text-xs text-slate-500">Upload a supported file and import contracts in bulk.</p>
              </div>
              <button
                type="button"
                onClick={closeImportModal}
                className="text-slate-400 transition-colors hover:text-slate-600"
                aria-label="Close"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-4 p-6">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">Format</label>
                <select
                  value={importFormat}
                  onChange={(e) => {
                    setImportFormat(e.target.value);
                    setImportFile(null);
                    setImportResult(null);
                    setFormError(null);
                  }}
                  className="h-10 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-slate-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                >
                  <option value="csv">CSV</option>
                  <option value="excel">Excel</option>
                  <option value="json">JSON</option>
                </select>
              </div>

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-line bg-slate-50 px-4 py-6 text-center transition-colors hover:border-brand-300 hover:bg-brand-50/40">
                <Upload className="mb-2 h-5 w-5 text-slate-400" aria-hidden="true" />
                <span className="text-sm font-medium text-slate-700">{importFile ? importFile.name : 'Choose a file'}</span>
                <span className="mt-1 text-xs text-slate-500">Accepted: {getImportAccept()}</span>
                <input
                  type="file"
                  accept={getImportAccept()}
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>

              <div className="rounded-xl border border-line bg-slate-50 p-3 text-xs text-slate-600">
                Expected fields: Description, ClientID, FreelancerID, ProjectID, ProposalID, AgreedPrice, StartDate,
                EndDate, Status
              </div>

              {importResult ? (
                <div className="grid grid-cols-3 gap-3">
                  {[
                    ['Total', importResult.totalRows],
                    ['Imported', importResult.importedRows],
                    ['Failed', importResult.failedRows],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-line bg-white p-3 text-center">
                      <div className="text-[11px] font-semibold uppercase text-slate-500">{label}</div>
                      <div className="mt-1 text-lg font-bold text-slate-900">{value ?? 0}</div>
                    </div>
                  ))}
                  {importResult.errors?.length > 0 ? (
                    <div className="col-span-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                      {importResult.errors.slice(0, 5).map((err, idx) => (
                        <div key={idx}>- {err}</div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {formError ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{formError}</div>
              ) : null}

              <div className="flex items-center justify-end gap-2">
                <Button as="button" type="button" variant="outline" onClick={closeImportModal}>
                  Cancel
                </Button>
                <Button as="button" type="submit">
                  Import contracts
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
