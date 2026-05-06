import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useContracts } from '../../hooks/useContracts';
import { SmartBackButton } from '../../components/SmartBackButton';

const STATUS_STYLES = {
  Active: 'bg-teal-500/10 text-teal-300 border-teal-500/40',
  Pending: 'bg-amber-500/10 text-amber-300 border-amber-500/40',
  Completed: 'bg-blue-500/10 text-blue-300 border-blue-500/40',
  Cancelled: 'bg-rose-500/10 text-rose-300 border-rose-500/40',
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
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-400">
        <div className="inline-block w-10 h-10 border-4 border-slate-700 border-t-purple-500 rounded-full animate-spin mb-4" />
        <p>Loading contract details...</p>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="max-w-4xl mx-auto mt-6 rounded-2xl border border-rose-800 bg-rose-950/30 p-6 text-rose-200">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{typeof error === 'string' ? error : 'Contract not found.'}</p>
        <Link
          to="/admin/contracts"
          className="mt-4 inline-block text-rose-200 hover:text-rose-100 font-semibold"
        >
          &larr; Back to Contracts
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto text-slate-100 space-y-6">
      <SmartBackButton fallbackTo="/admin/contracts" label="Back to Contracts" />

      <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />

        <div className="p-6 md:p-8 border-b border-slate-800 bg-slate-900/60">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-slate-100">Contract Details</h1>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                    STATUS_STYLES[contract.status] ||
                    'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {contract.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {contract.contractID}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Link
                to={`/admin/contracts/${contract.contractID}/edit`}
                className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold text-center transition-colors"
              >
                Edit
              </Link>
              <Link
                to={`/contracts/${contract.contractID}/workflow`}
                className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold text-center transition-colors"
              >
                Workflow
              </Link>
              <button
                onClick={handleDelete}
                className="flex-1 md:flex-none px-5 py-2.5 rounded-xl border border-rose-700 bg-rose-950/20 text-rose-200 hover:bg-rose-950/40 text-sm font-semibold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Description */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-400 mb-3">
                Description
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed">
                {contract.description}
              </p>
            </section>

            {/* Parties */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-400 mb-2">
                Parties
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-700">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 mb-1">
                    Client
                  </p>
                  <p className="text-sm font-semibold text-slate-100">
                    {contract.clientName}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-700">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 mb-1">
                    Freelancer
                  </p>
                  <p className="text-sm font-semibold text-slate-100">
                    {contract.freelancerName}
                  </p>
                </div>
              </div>
            </section>

            {/* Project link */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-400 mb-3">
                Project
              </h3>
              <Link
                to={`/projects/${contract.projectID}`}
                className="text-sm font-semibold text-purple-300 hover:text-purple-200 hover:underline"
              >
                {contract.projectTitle ?? 'View Project'}
              </Link>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 mb-1">
                Agreed Price
              </p>
              <div className="text-3xl font-bold text-purple-300">
                ${contract.agreedPrice?.toLocaleString() ?? 'N/A'}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 mb-1">
                Original Price
              </p>
              <div className="text-2xl font-semibold text-slate-100">
                ${contract.price?.toLocaleString() ?? 'N/A'}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 text-sm">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 mb-1">
                  Start Date
                </p>
                <p className="text-slate-200">
                  {contract.start_Date
                    ? new Date(contract.start_Date).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 mb-1">
                  End Date
                </p>
                <p className="text-slate-200">
                  {contract.end_Date
                    ? new Date(contract.end_Date).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}