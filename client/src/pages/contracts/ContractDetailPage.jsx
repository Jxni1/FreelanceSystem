import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useContracts } from '../../hooks/useContracts';

const STATUS_STYLES = {
  Active: 'bg-teal-50 text-teal-700 border-teal-200',
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Completed: 'bg-blue-50 text-blue-700 border-blue-200',
  Cancelled: 'bg-red-50 text-red-700 border-red-200',
};

export default function ContractDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { contract, isLoading, error, fetchContractById, deleteContract } = useContracts();

  useEffect(() => {
    if (id) fetchContractById(id);
  }, [id, fetchContractById]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this contract?')) {
      await deleteContract(id);
      navigate('/admin/contracts');
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center min-h-[50vh] flex flex-col items-center justify-center">
        <div className="inline-block w-10 h-10 border-4 border-slate-200 border-t-purple-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-500">Loading contract details...</p>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="p-8 max-w-4xl mx-auto mt-8 bg-red-50 border border-red-200 rounded-xl text-red-700">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{typeof error === 'string' ? error : 'Contract not found.'}</p>
        <Link to="/admin/contracts" className="mt-6 inline-block text-red-700 font-semibold hover:underline">
          &larr; Back to Contracts
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link
        to="/admin/contracts"
        className="inline-block mb-6 text-slate-500 hover:text-purple-600 font-medium transition-colors"
      >
        &larr; Back to Contracts
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-4 bg-gradient-to-r from-purple-500 to-indigo-400" />

        <div className="p-8 md:p-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-8 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-extrabold text-slate-900">Contract Details</h1>
                <span
                  className={`px-3 py-1 text-sm font-semibold rounded-full border ${
                    STATUS_STYLES[contract.status] ||
                    'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {contract.status}
                </span>
              </div>
              <p className="text-slate-400 text-sm font-mono">
                {contract.contractID}
              </p>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <Link
                to={`/admin/contracts/${contract.contractID}/edit`}
                className="flex-1 md:flex-none px-6 py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium rounded-lg transition-colors text-center"
              >
                Edit
              </Link>

              <button
                onClick={handleDelete}
                className="flex-1 md:flex-none px-6 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-medium rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              {/* Description */}
              <section>
                <h3 className="text-lg font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2">
                  Description
                </h3>
                <p className="text-slate-700 leading-relaxed">
                  {contract.description}
                </p>
              </section>

              {/* Parties */}
              <section>
                <h3 className="text-lg font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2">
                  Parties
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Client
                    </p>
                    <p className="text-slate-800 font-semibold">
                      {contract.clientName}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Freelancer
                    </p>
                    <p className="text-slate-800 font-semibold">
                      {contract.freelancerName}
                    </p>
                  </div>
                </div>
              </section>

              {/* ✅ Project (CLICKABLE) */}
              <section>
                <h3 className="text-lg font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2">
                  Project
                </h3>

                <Link
                  to={`/projects/${contract.projectID}`}
                  className="text-purple-600 font-semibold hover:underline cursor-pointer"
                >
                  {contract.projectTitle}
                </Link>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Agreed Price
                </p>
                <div className="text-4xl font-extrabold text-purple-600">
                  ${contract.agreedPrice?.toLocaleString()}
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Original Price
                </p>
                <div className="text-2xl font-bold text-slate-700">
                  ${contract.price?.toLocaleString()}
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 space-y-4 text-sm">
                <div>
                  <p className="font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Start Date
                  </p>
                  <p className="text-slate-800 font-medium">
                    {new Date(contract.start_Date).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    End Date
                  </p>
                  <p className="text-slate-800 font-medium">
                    {new Date(contract.end_Date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}