import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProposals } from '../../hooks/useProposals';
import { useContracts } from '../../hooks/useContracts';

const PROPOSAL_STATUS_STYLES = {
  Pending:  'bg-amber-50 text-amber-700 border-amber-200',
  Accepted: 'bg-teal-50 text-teal-700 border-teal-200',
  Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
};

const CONTRACT_STATUS_STYLES = {
  Active:    'bg-teal-50 text-teal-700 border-teal-200',
  Pending:   'bg-amber-50 text-amber-700 border-amber-200',
  Completed: 'bg-blue-50 text-blue-700 border-blue-200',
  Cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
};

const TABS = ['Proposals', 'Contracts'];

export default function MyWorkPage() {
  const [tab, setTab] = useState('Proposals');
  const [proposalStatus, setProposalStatus] = useState('');
  const [contractStatus, setContractStatus] = useState('');

  const { proposals, isLoading: proposalsLoading, fetchProposals } = useProposals();
  const { contracts, isLoading: contractsLoading, fetchContracts } = useContracts();

  useEffect(() => {
    if (tab === 'Proposals') fetchProposals({ pageSize: 50, status: proposalStatus || undefined });
  }, [tab, proposalStatus, fetchProposals]);

  useEffect(() => {
    if (tab === 'Contracts') fetchContracts({ pageSize: 50, status: contractStatus || undefined });
  }, [tab, contractStatus, fetchContracts]);

  const proposalItems = proposals?.items ?? [];
  const contractItems = contracts?.items ?? contracts ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-slate-900">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Work</h1>
        <p className="text-sm text-slate-500 mt-1">Track your proposals and active contracts.</p>
      </div>

      <div className="flex gap-1 border-b border-slate-200">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t
                ? 'border-teal-500 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Proposals' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <select
              value={proposalStatus}
              onChange={e => setProposalStatus(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {proposalsLoading && (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin" />
            </div>
          )}

          {!proposalsLoading && proposalItems.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <p>No proposals yet.</p>
              <Link to="/discover" className="mt-2 inline-block text-teal-600 hover:text-teal-700 text-sm">
                Browse open projects →
              </Link>
            </div>
          )}

          <div className="space-y-3">
            {proposalItems.map(p => (
              <div
                key={p.proposalId}
                className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{p.projectTitle ?? `Project ${p.projectId?.slice(0, 8)}`}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Bid: <span className="text-teal-600 font-medium">${p.bidAmount?.toLocaleString()}</span>
                      {p.deliveryDays && <> · {p.deliveryDays} days</>}
                    </p>
                  </div>
                  <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${PROPOSAL_STATUS_STYLES[p.status] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                    {p.status}
                  </span>
                </div>
                {p.message && <p className="text-xs text-slate-500 line-clamp-2">{p.message}</p>}
                {p.status === 'Accepted' && p.contractId && (
                  <Link
                    to={`/contracts/${p.contractId}/workflow`}
                    className="inline-block text-xs text-teal-600 hover:text-teal-700 font-medium"
                  >
                    Open workflow →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'Contracts' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <select
              value={contractStatus}
              onChange={e => setContractStatus(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {contractsLoading && (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin" />
            </div>
          )}

          {!contractsLoading && contractItems.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <p>No contracts yet.</p>
            </div>
          )}

          <div className="space-y-3">
            {contractItems.map(c => {
              const cid = c.contractID ?? c.contractId;
              return (
                <div
                  key={cid}
                  className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{c.title ?? `Contract ${cid?.slice(0, 8)}`}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Budget: <span className="text-teal-600 font-medium">${c.budget?.toLocaleString()}</span>
                      </p>
                    </div>
                    <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${CONTRACT_STATUS_STYLES[c.status] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                      {c.status}
                    </span>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <Link
                      to={`/contracts/${cid}`}
                      className="text-xs text-slate-500 hover:text-slate-700"
                    >
                      Details
                    </Link>
                    <Link
                      to={`/contracts/${cid}/workflow`}
                      className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                    >
                      Open workflow →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
