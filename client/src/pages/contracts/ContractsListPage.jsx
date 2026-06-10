import { useEffect, useState, useRef } from 'react';   
import { Link } from 'react-router-dom';
import { useContracts } from '../../hooks/useContracts';
import { useAuthorization } from '../../hooks/useAuthorization';
import ContractSearchFilter from '../../components/SearchFilters/ContractSearchFilter';

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
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [importFormat, setImportFormat] = useState('csv');
  const [importFile, setImportFile] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [formError, setFormError] = useState(null);

  const exportMenuRef = useRef(null);

  useEffect(() => {
    const params = {
      page,
      pageSize: 10,
      ...filters,
    };
    fetchContracts(params);
  }, [filters, page, fetchContracts]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setIsExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this contract?')) {
      await deleteContract(id);
      fetchContracts({ page, pageSize: 10, ...filters });
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleSearch = (searchFilters) => {
    setFilters(searchFilters);
    setPage(1);
  };

  const totalPages = Math.max(
    1,
    Math.ceil((contracts.totalCount || 0) / 10)
  );

  const openImportModal = () => {
    setImportFile(null);
    setImportFormat('csv');
    setFormError(null);
    setImportResult(null);
    setIsImportOpen(true);
  };

  const closeImportModal = () => {
    setIsImportOpen(false);
    setImportFile(null);
    setImportFormat('csv');
    setFormError(null);
    setImportResult(null);
  };

  const getImportAccept = () => {
    return importFormat === 'csv' ? '.csv' : '.xlsx';
  };

  const downloadBlob = (response, fallbackName) => {
    try {
      const contentDisposition = response.headers['content-disposition'];
      let filename = fallbackName;

      if (contentDisposition) {
        const matches = contentDisposition.match(/filename="?([^"]+)"?/);
        if (matches?.[1]) {
          filename = matches[1];
        }
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await exportContracts({ format });
      downloadBlob(response, `contracts.${format}`);
      setIsExportOpen(false);
    } catch (err) {
      alert('Export failed', err);
    }
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importFile) {
      setFormError('Please select a file to import.');
      return;
    }
    try {
      setFormError(null);
      const result = await importContracts(importFile, importFormat);
      setImportResult(result);
      setTimeout(() => {
        closeImportModal();
        fetchContracts({ page, pageSize: 10, ...filters });
      }, 2000);
    } catch (err) {
      const raw = err?.response?.data;
      setFormError(
        typeof raw === 'string' ? raw : raw?.message || 'Import failed'
      );
    }
  };

  const getViewContractPath = (contractId) => `/contracts/${contractId}`;
  const getWorkflowPath = (contractId) => `/contracts/${contractId}/workflow`;
  const getChatPath = (contractId) => `/contracts/${contractId}/chat`;

  if (isLoading && contracts.items.length === 0) {
    return <div className="p-8 text-center text-slate-500">Loading contracts...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Contracts</h1>
        {isAdmin && (
          <div className="flex gap-2">
            <button
              onClick={openImportModal}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Import
            </button>
            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => setIsExportOpen(!isExportOpen)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors font-medium"
              >
                Export
              </button>
              {isExportOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white border border-slate-300 rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => handleExport('csv')}
                    className="block w-full text-left px-4 py-2 hover:bg-slate-50"
                  >
                    CSV
                  </button>
                  <button
                    onClick={() => handleExport('xlsx')}
                    className="block w-full text-left px-4 py-2 hover:bg-slate-50"
                  >
                    XLSX
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <ContractSearchFilter onSearch={handleSearch} />

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {contracts.items.length === 0 && !isLoading ? (
        <div className="text-center py-16 text-slate-400">No contracts found.</div>
      ) : (
        <div className="space-y-4">
          {contracts.items.map((c) => (
            <div
              key={c.contractID}
              className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-900">{c.projectTitle}</h3>
                  <p className="text-slate-600 text-sm">{c.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-slate-500">Client</p>
                  <p className="font-medium text-slate-900">{c.clientName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Freelancer</p>
                  <p className="font-medium text-slate-900">{c.freelancerName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Status</p>
                  <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-teal-50 text-teal-700">
                    {c.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Price</p>
                  <p className="font-medium text-slate-900">${c.agreedPrice?.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  to={getViewContractPath(c.contractID)}
                  className="px-3 py-1.5 text-sm border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  View
                </Link>
                <Link
                  to={getWorkflowPath(c.contractID)}
                  className="px-3 py-1.5 text-sm border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Workflow
                </Link>
                <Link
                  to={getChatPath(c.contractID)}
                  className="px-3 py-1.5 text-sm border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Chat
                </Link>
                <button
                  onClick={() => handleDelete(c.contractID)}
                  className="px-3 py-1.5 text-sm bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {contracts.totalCount > 10 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            disabled={page === 1}
            onClick={() => handlePageChange(page - 1)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-slate-600">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => handlePageChange(page + 1)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {isImportOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Import Contracts</h3>
            {importResult && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                ✓ Import successful!
              </div>
            )}
            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {formError}
              </div>
            )}
            <form onSubmit={handleImportSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Format</label>
                <select
                  value={importFormat}
                  onChange={(e) => setImportFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="csv">CSV</option>
                  <option value="xlsx">XLSX</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">File</label>
                <input
                  type="file"
                  accept={getImportAccept()}
                  onChange={(e) => setImportFile(e.target.files?.[0])}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={closeImportModal}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg"
                >
                  Import
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}