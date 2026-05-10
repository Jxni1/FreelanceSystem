import { useEffect, useState } from 'react';
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
  const { contracts, isLoading, error, fetchContracts, deleteContract } = useContracts();
  const { isAdmin } = useAuthorization();
  const [filters, setFilters] = useState({ page: 1, pageSize: 10, status: '' });

  useEffect(() => {
    fetchContracts(filters);
  }, [filters, fetchContracts]);

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

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto text-slate-900 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Contract Management
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            View, create, and manage all contracts across the platform.
          </p>
        </div>
        {isAdmin && (
          <Link
            to="/admin/contracts/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-sm font-semibold text-white shadow-sm transition-colors"
          >
            <span className="text-base leading-none">+</span>
            <span>New Contract</span>
          </Link>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm mb-4">
        <div className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))
            }
            className="px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent max-w-xs"
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
          <div className="inline-block w-9 h-9 border-4 border-slate-200 border-t-purple-500 rounded-full animate-spin mb-4" />
          <p className="text-sm">Loading contracts...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-xs text-rose-700">
          {typeof error === 'string'
            ? error
            : error.message || 'Failed to load contracts.'}
        </div>
      )}

      {!isLoading && !error && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
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
                      className="px-6 py-10 text-center text-slate-500 text-sm"
                    >
                      No contracts found matching your filters.
                    </td>
                  </tr>
                ) : (
                  contracts.items?.map((contract) => (
                    <tr
                      key={contract.contractID}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-5 py-3 max-w-[260px] text-slate-900 truncate">
                        {contract.description}
                      </td>
                      <td className="px-5 py-3 text-slate-700 font-medium">
                        {contract.clientName}
                      </td>
                      <td className="px-5 py-3 text-slate-700">
                        {contract.freelancerName}
                      </td>
                      <td className="px-5 py-3 text-slate-900 font-semibold">
                        ${contract.agreedPrice?.toLocaleString() || 'N/A'}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`px-3 py-1 text-[11px] font-semibold rounded-full border ${
                            STATUS_STYLES[contract.status] ||
                            'bg-slate-100 text-slate-600 border-slate-200'
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
                            to={isAdmin ? `/admin/contracts/${contract.contractID}` : `/contracts/${contract.contractID}`}
                            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            View
                          </Link>
                          <Link
                            to={isAdmin ? `/admin/contracts/${contract.contractID}/edit` : `/contracts/${contract.contractID}/edit`}
                            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-xs font-semibold text-white"
                          >
                            Edit
                          </Link>
                          <Link
                            to={isAdmin ? `/admin/contracts/${contract.contractID}/workflow` : `/contracts/${contract.contractID}/workflow`}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white"
                          >
                            Workflow
                          </Link>
                          <button
                            onClick={() => handleDelete(contract.contractID)}
                            className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 text-xs font-semibold text-rose-600"
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
            <div className="px-5 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
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
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-2">
                  Page {filters.page} of {totalPages}
                </span>
                <button
                  disabled={filters.page >= totalPages}
                  onClick={() => handlePageChange(filters.page + 1)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
