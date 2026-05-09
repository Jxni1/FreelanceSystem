import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useContracts } from '../../hooks/useContracts';
import { useAuthorization } from '../../hooks/useAuthorization';
import { SmartBackButton } from '../../components/SmartBackButton';

const STATUS_STYLES = {
  Active: 'bg-teal-50 text-teal-700 border-teal-200',
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Completed: 'bg-blue-50 text-blue-700 border-blue-200',
  Cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function ContractDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { contract, isLoading, error, fetchContractById, deleteContract } = useContracts();
  const { isAdmin } = useAuthorization();

  const contractsPath = isAdmin ? '/admin/contracts' : '/contracts';

  useEffect(() => {
    if (id) fetchContractById(id);
  }, [id, fetchContractById]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this contract?')) {
      await deleteContract(id);
      navigate(contractsPath);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-500">
        <div className="inline-block w-10 h-10 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin mb-4" />
        <p>Loading contract details...</p>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="max-w-4xl mx-auto mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{typeof error === 'string' ? error : 'Contract not found.'}</p>
        <Link
          to={contractsPath}
          className="mt-4 inline-block text-rose-600 hover:text-rose-700 font-semibold"
        >
          &larr; Back to Contracts
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto text-slate-900 space-y-6">
      <SmartBackButton fallbackTo={contractsPath} label="Back to Contracts" />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />

        <div className="p-6 md:p-8 border-b border-slate-200 bg-slate-50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-slate-900">Contract Details</h1>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                    STATUS_STYLES[contract.status] ||
                    'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {contract.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
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
                className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold text-center transition-colors"
              >
                Workflow
              </Link>
              <button
                onClick={handleDelete}
                className="flex-1 md:flex-none px-5 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 text-sm font-semibold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500 mb-3">
                Description
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                {contract.description}
              </p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500 mb-2">
                Parties
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white border border-slate-200">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 mb-1">
                    Client
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {contract.clientName}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-slate-200">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 mb-1">
                    Freelancer
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {contract.freelancerName}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500 mb-3">
                Project
              </h3>
              <Link
                to={`/projects/${contract.projectID}`}
                className="text-sm font-semibold text-teal-600 hover:text-teal-700 hover:underline"
              >
                {contract.projectTitle ?? 'View Project'}
              </Link>
            </section>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-teal-50 border border-teal-200">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-teal-600 mb-1">
                Agreed Price
              </p>
              <div className="text-3xl font-bold text-teal-700">
                ${contract.agreedPrice?.toLocaleString() ?? 'N/A'}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 mb-1">
                Original Price
              </p>
              <div className="text-2xl font-semibold text-slate-700">
                ${contract.price?.toLocaleString() ?? 'N/A'}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-sm">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 mb-1">
                  Start Date
                </p>
                <p className="text-slate-700">
                  {contract.start_Date
                    ? new Date(contract.start_Date).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 mb-1">
                  End Date
                </p>
                <p className="text-slate-700">
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
