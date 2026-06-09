import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useProposals } from '../../hooks/useProposals';

const STATUS_STYLES = {
  Pending:  'bg-amber-50 text-amber-700 border-amber-200',
  Accepted: 'bg-teal-50 text-teal-700 border-teal-200',
  Rejected: 'bg-slate-100 text-slate-500 border-slate-200',
};

const STATUS_OPTIONS = ['All', 'Pending', 'Accepted', 'Rejected'];

export default function ReceivedProposalsPage() {
  const { proposals, isLoading, error, fetchProposals, acceptProposal, rejectProposal } = useProposals();
  const [statusFilter, setStatusFilter] = useState('All');
  const [actionKey, setActionKey] = useState('');
  const [actionError, setActionError] = useState(null);

  const load = useCallback(() => {
    fetchProposals({
      pageSize: 50,
      status: statusFilter === 'All' ? undefined : statusFilter,
    });
  }, [fetchProposals, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAccept = async (proposalId) => {
    setActionError(null);
    setActionKey(`accept-${proposalId}`);
    try {
      const res = await acceptProposal(proposalId);
      if (!res?.success) {
        setActionError(res?.error || 'Failed to accept proposal.');
        return;
      }
      load();
    } finally {
      setActionKey('');
    }
  };

  const handleReject = async (proposalId) => {
    setActionError(null);
    setActionKey(`reject-${proposalId}`);
    try {
      const res = await rejectProposal(proposalId);
      if (!res?.success) {
        setActionError(res?.error || 'Failed to reject proposal.');
        return;
      }
      load();
    } finally {
      setActionKey('');
    }
  };

  const items = proposals?.items ?? [];

  // Group proposals by project
  const grouped = items.reduce((acc, p) => {
    const key = p.projectId;
    if (!acc[key]) acc[key] = { projectId: key, projectTitle: p.projectTitle, proposals: [] };
    acc[key].proposals.push(p);
    return acc;
  }, {});
  const groups = Object.values(grouped);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-slate-900">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Received Proposals</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review and respond to freelancer offers on your projects.
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              statusFilter === s
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {s}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-400">{items.length} proposal{items.length !== 1 ? 's' : ''}</span>
      </div>

      {actionError && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {actionError}
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {typeof error === 'string' ? error : 'Failed to load proposals.'}
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && groups.length === 0 && (
        <div className="text-center py-16 border border-dashed border-slate-300 rounded-2xl text-slate-400">
          <p className="text-lg mb-2">No proposals yet.</p>
          <p className="text-sm">
            Freelancers will send proposals once you{' '}
            <Link to="/projects" className="text-teal-600 hover:underline font-medium">
              post a project
            </Link>.
          </p>
        </div>
      )}

      {!isLoading && groups.length > 0 && (
        <div className="space-y-8">
          {groups.map(({ projectId, projectTitle, proposals: groupProposals }) => (
            <div key={projectId} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-slate-900 text-base">
                    {projectTitle || 'Untitled Project'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {groupProposals.length} proposal{groupProposals.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <Link
                  to={`/projects/${projectId}`}
                  className="text-xs font-semibold text-teal-600 hover:text-teal-700 hover:underline"
                >
                  View project →
                </Link>
              </div>

              <div className="divide-y divide-slate-100">
                {groupProposals.map((p) => (
                  <div key={p.proposalId} className="px-6 py-5 flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Left: freelancer info + message */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="font-semibold text-slate-900">
                          {p.freelancerName || 'Freelancer'}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
                            STATUS_STYLES[p.status] ?? STATUS_STYLES.Rejected
                          }`}
                        >
                          {p.status}
                        </span>
                        <span className="text-xs text-slate-400">
                          {p.created_at || p.createdAt
                            ? new Date(p.created_at ?? p.createdAt).toLocaleDateString()
                            : ''}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-sm mb-2">
                        <span className="font-bold text-teal-600 text-base">
                          ${p.bidAmount?.toLocaleString()}
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-600">{p.deliveryDays} day{p.deliveryDays !== 1 ? 's' : ''} delivery</span>
                      </div>

                      <p className="text-sm text-slate-600 leading-relaxed">
                        {p.message}
                      </p>
                    </div>

                    {/* Right: actions */}
                    {p.status === 'Pending' && (
                      <div className="flex sm:flex-col gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleAccept(p.proposalId)}
                          disabled={!!actionKey}
                          className="px-4 py-2 text-sm rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold disabled:opacity-60 transition-colors"
                        >
                          {actionKey === `accept-${p.proposalId}` ? 'Accepting…' : 'Accept'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(p.proposalId)}
                          disabled={!!actionKey}
                          className="px-4 py-2 text-sm rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-60 transition-colors"
                        >
                          {actionKey === `reject-${p.proposalId}` ? 'Rejecting…' : 'Decline'}
                        </button>
                      </div>
                    )}

                    {p.status === 'Accepted' && (
                      <div className="shrink-0 self-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
                          ✓ Accepted
                        </span>
                      </div>
                    )}

                    {p.status === 'Rejected' && (
                      <div className="shrink-0 self-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 text-slate-400 border border-slate-200">
                          Declined
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
