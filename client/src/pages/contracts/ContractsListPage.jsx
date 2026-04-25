import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useContracts } from '../../hooks/useContracts';

const STATUS_STYLES = {
  Active: 'bg-teal-50 text-teal-700 border-teal-200',
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Completed: 'bg-blue-50 text-blue-700 border-blue-200',
  Cancelled: 'bg-red-50 text-red-700 border-red-200',
};

export default function ContractsListPage() {
  const { contracts, isLoading, error, fetchContracts, deleteContract } = useContracts();
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
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  return (
    
    <div className="p-8 max-w-7xl mx-auto text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">My Contracts</h1>
          <p className="text-slate-300 mt-1">View and manage your contracts</p>
        </div>
        <Link
          to="/admin/contracts/new"
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors shadow-sm"
        >
          + New Contract
        </Link>
      </div>
       

      {/* Filters */}
      <div className="bg-white text-slate-900 p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <select
            value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}
            className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 flex-1 max-w-xs"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block w-10 h-10 border-4 border-slate-200 border-t-purple-600 rounded-full animate-spin mb-4" />
          <p className="text-slate-500">Loading contracts...</p>
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 mb-6">
          {typeof error === 'string' ? error : error.message || 'Failed to load contracts.'}
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && (
        <div className="bg-white text-slate-900 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-slate-600">Description</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-600">Client</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-600">Freelancer</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-600">Price</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-600">Status</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-600">Start Date</th>
                  <th className="px-6 py-4 text-right font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contracts.items?.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      No contracts found matching your filters.
                    </td>
                  </tr>
                ) : (
                  contracts.items?.map(contract => (
                    <tr key={contract.contractID} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-700 max-w-[200px] truncate">
                        {contract.description}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{contract.clientName}</td>
                      <td className="px-6 py-4 text-slate-600">{contract.freelancerName}</td>
                      <td className="px-6 py-4 text-slate-800 font-semibold">
                        ${contract.agreedPrice?.toLocaleString() || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${STATUS_STYLES[contract.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {contract.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {contract.start_Date ? new Date(contract.start_Date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/admin/contracts/${contract.contractID}`}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                          >
                            View
                          </Link>
                          <Link
                            to={`/admin/contracts/${contract.contractID}/edit`}
                            className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-medium transition-colors"
                          >
                            Edit
                          </Link>
                          <Link
                            to={`/admin/contracts/${contract.contractID}/workflow`}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium transition-colors"
                          >
                            Workflow
                          </Link>
                          <button
                            onClick={() => handleDelete(contract.contractID)}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-medium transition-colors"
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

          {/* Pagination */}
          {contracts.totalCount > filters.pageSize && (
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Showing {(filters.page - 1) * filters.pageSize + 1} to {Math.min(filters.page * filters.pageSize, contracts.totalCount)} of{' '}
                  <span className="font-semibold text-slate-700">{contracts.totalCount}</span> contracts
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={filters.page <= 1}
                    onClick={() => handlePageChange(filters.page - 1)}
                    className="px-4 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-slate-500 px-3">
                    Page {filters.page} of {Math.ceil(contracts.totalCount / filters.pageSize)}
                  </span>
                  <button
                    disabled={filters.page >= Math.ceil(contracts.totalCount / filters.pageSize)}
                    onClick={() => handlePageChange(filters.page + 1)}
                    className="px-4 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
