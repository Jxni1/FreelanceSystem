import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProjects } from '../../hooks/useProjects';
import { useContracts } from '../../hooks/useContracts';
import { useProposals } from '../../hooks/useProposals';
import { useAuthorization } from '../../hooks/useAuthorization';
import { SmartBackButton } from '../../components/SmartBackButton';

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { project, isLoading, error, fetchProjectById, deleteProject } = useProjects();
  const { contracts, fetchContracts, isLoading: contractLoading } = useContracts();
  const { proposals, fetchProposals, createProposal, acceptProposal, rejectProposal, deleteProposal } = useProposals();
  const { isClient, isFreelancer } = useAuthorization();

  const [proposalForm, setProposalForm] = useState({ message: '', bidAmount: '', deliveryDays: '' });
  const [proposalError, setProposalError] = useState(null);
  const [proposalActionKey, setProposalActionKey] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadProjectContext = async () => {
      if (!id) return;
      await fetchProjectById(id);

      try {
        await fetchContracts({ projectID: id, page: 1, pageSize: 10 });
      } catch {
        if (!isMounted) return;
      }

      try {
        await fetchProposals({ projectId: id, pageSize: 50 });
      } catch {}
    };

    if (id) loadProjectContext();

    return () => {
      isMounted = false;
    };
  }, [id, fetchProjectById, fetchContracts, fetchProposals]);

  const handleCreateProposal = async (e) => {
    e.preventDefault();
    setProposalError(null);
    setProposalActionKey('create');
    try {
      const res = await createProposal({
        projectId: project.projectID,
        message: proposalForm.message.trim(),
        bidAmount: Number(proposalForm.bidAmount),
        deliveryDays: Number(proposalForm.deliveryDays),
      });
      if (!res?.success) { setProposalError(res?.error || 'Failed to submit proposal.'); return; }
      setProposalForm({ message: '', bidAmount: '', deliveryDays: '' });
      await fetchProposals({ projectId: id, pageSize: 50 });
    } finally {
      setProposalActionKey('');
    }
  };

  const handleAcceptProposal = async (proposalId) => {
    setProposalError(null);
    setProposalActionKey(`accept-${proposalId}`);
    try {
      const res = await acceptProposal(proposalId);
      if (!res?.success) { setProposalError(res?.error || 'Failed to accept proposal.'); return; }
      await Promise.all([
        fetchProposals({ projectId: id, pageSize: 50 }),
        fetchContracts({ projectID: id, page: 1, pageSize: 10 }),
      ]);
    } finally {
      setProposalActionKey('');
    }
  };

  const handleRejectProposal = async (proposalId) => {
    setProposalError(null);
    setProposalActionKey(`reject-${proposalId}`);
    try {
      const res = await rejectProposal(proposalId);
      if (!res?.success) { setProposalError(res?.error || 'Failed to reject proposal.'); return; }
      await fetchProposals({ projectId: id, pageSize: 50 });
    } finally {
      setProposalActionKey('');
    }
  };

  const handleDeleteProposal = async (proposalId) => {
    setProposalError(null);
    setProposalActionKey(`delete-${proposalId}`);
    try {
      const res = await deleteProposal(proposalId);
      if (!res?.success) { setProposalError(res?.error || 'Failed to withdraw proposal.'); return; }
      await fetchProposals({ projectId: id, pageSize: 50 });
    } finally {
      setProposalActionKey('');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      await deleteProject(id);
      navigate('/projects');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-500">
        <div className="inline-block w-10 h-10 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin mb-4" />
        <p>Loading project details...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-4xl mx-auto rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{typeof error === 'string' ? error : 'Project not found.'}</p>
        <div className="mt-6">
          <Link to="/projects" className="text-rose-600 font-semibold hover:text-rose-700">
            &larr; Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const milestoneCount = project.milestones?.length ?? 0;
  const deliverableCount = project.deliverables?.length ?? 0;
  const linkedContract =
    contracts?.items?.find(
      (contract) => (contract.projectID || contract.projectId) === project.projectID
    ) ??
    contracts?.items?.[0] ??
    null;

  const statusClasses =
    project.status === 'Open'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : project.status === 'InProgress'
      ? 'bg-teal-50 text-teal-700 border-teal-200'
      : project.status === 'Completed'
      ? 'bg-blue-50 text-blue-700 border-blue-200'
      : 'bg-slate-100 text-slate-600 border-slate-200';

  return (
    <div className="max-w-5xl mx-auto text-slate-900 space-y-6">
      <SmartBackButton fallbackTo="/projects" label="Back to Projects" />

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-teal-500 to-emerald-400" />

        <div className="p-6 md:p-8 border-b border-slate-200 bg-slate-50">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                  {project.title}
                </h1>

                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusClasses}`}>
                  {project.status || 'Open'}
                </span>

                <span className="px-3 py-1 text-xs font-semibold rounded-full border bg-purple-50 text-purple-700 border-purple-200">
                  {project.visibility || 'Private'}
                </span>
              </div>

              <p className="text-sm text-slate-500">
                Project ID:{' '}
                <span className="font-mono text-slate-700">{project.projectID}</span>
              </p>
            </div>

            {isClient && (
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <Link
                  to={`/projects/${project.projectID}/edit`}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors"
                >
                  Edit Project
                </Link>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500 mb-3">
                Description
              </h3>
              <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {project.description || 'No description provided.'}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500 mb-3">
                Category
              </h3>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700">
                <span>{project.categoryName || 'Uncategorized'}</span>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600">
                    ⚡
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">
                      Project Workflow
                    </h3>
                    <p className="text-sm text-slate-500">
                      Manage milestones, deliverables, and the connected contract workflow.
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {milestoneCount} Milestones
                      </span>
                      <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                        {deliverableCount} Deliverables
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-auto">
                  {linkedContract?.contractID ? (
                    <Link
                      to={`/contracts/${linkedContract.contractID}/workflow`}
                      className="inline-flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors"
                    >
                      <span>Open Workflow</span>
                      <span>→</span>
                    </Link>
                  ) : (
                    <Link
                      to={`/projects/${project.projectID}/workflow`}
                      className="inline-flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold transition-colors"
                    >
                      <span>{contractLoading ? 'Preparing workflow...' : 'Open Workflow'}</span>
                      <span>→</span>
                    </Link>
                  )}
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-teal-200 bg-teal-50 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-teal-600 mb-2">
                Total Budget
              </p>
              <div className="text-4xl font-bold text-teal-700">
                ${project.budget?.toLocaleString() || '0'}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 mb-1">
                  Created At
                </p>
                <p className="text-sm text-slate-700">
                  {project.createdAt ? new Date(project.createdAt).toLocaleString() : 'N/A'}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 mb-1">
                  Last Updated
                </p>
                <p className="text-sm text-slate-700">
                  {project.updatedAt ? new Date(project.updatedAt).toLocaleString() : 'N/A'}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 mb-1">
                  Visibility
                </p>
                <p className="text-sm text-slate-700">{project.visibility || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {(isClient || isFreelancer) && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-400" />
          <div className="p-6 md:p-8">

            {isClient && (
              <>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Proposals</h2>
                    <p className="text-sm text-slate-500 mt-0.5">{proposals.totalCount} received</p>
                  </div>
                </div>

                {proposalError && (
                  <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
                    {proposalError}
                  </div>
                )}

                {proposals.items.length === 0 ? (
                  <div className="border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-400 text-sm">
                    No proposals received yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {proposals.items.map(p => (
                      <div
                        key={p.proposalId}
                        className="border border-slate-200 rounded-xl p-4 bg-slate-50"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-slate-900">
                                {p.freelancerName || 'Freelancer'}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                p.status === 'Pending'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : p.status === 'Accepted'
                                  ? 'bg-teal-50 text-teal-700 border border-teal-200'
                                  : 'bg-slate-100 text-slate-500 border border-slate-200'
                              }`}>
                                {p.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm mb-2">
                              <span className="font-bold text-teal-600">
                                ${p.bidAmount?.toLocaleString()}
                              </span>
                              <span className="text-slate-400">&middot;</span>
                              <span className="text-slate-600">{p.deliveryDays} days</span>
                            </div>
                            <p className="text-sm text-slate-500 line-clamp-2">{p.message}</p>
                          </div>
                          {p.status === 'Pending' && (
                            <div className="flex gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleAcceptProposal(p.proposalId)}
                                disabled={proposalActionKey === `accept-${p.proposalId}`}
                                className="px-3 py-1.5 text-xs rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold disabled:opacity-60"
                              >
                                {proposalActionKey === `accept-${p.proposalId}` ? 'Accepting...' : 'Accept'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectProposal(p.proposalId)}
                                disabled={proposalActionKey === `reject-${p.proposalId}`}
                                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-60"
                              >
                                {proposalActionKey === `reject-${p.proposalId}` ? 'Rejecting...' : 'Reject'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {isFreelancer && (() => {
              const sorted = [...proposals.items].sort(
                (a, b) =>
                  new Date(b.created_at || b.createdAt || 0) -
                  new Date(a.created_at || a.createdAt || 0)
              );
              const latest = sorted[0] ?? null;
              const projectOpen = project?.status === 'Open';

              return (
                <>
                  <div className="mb-5">
                    <h2 className="text-xl font-bold text-slate-900">Your Proposal</h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Bid on this project by submitting a proposal.
                    </p>
                  </div>

                  {proposalError && (
                    <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
                      {proposalError}
                    </div>
                  )}

                  {latest?.status === 'Pending' && (
                    <div className="border border-amber-200 rounded-xl p-4 bg-amber-50">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold border border-amber-200">
                              Pending
                            </span>
                            <span className="text-xs text-slate-500">
                              {new Date(latest.created_at || latest.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-teal-600">
                            ${latest.bidAmount?.toLocaleString()} &middot; {latest.deliveryDays} days
                          </p>
                          <p className="text-sm text-slate-700 mt-1">{latest.message}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteProposal(latest.proposalId)}
                          disabled={proposalActionKey === `delete-${latest.proposalId}`}
                          className="shrink-0 px-3 py-1.5 text-xs rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                        >
                          {proposalActionKey === `delete-${latest.proposalId}` ? 'Withdrawing...' : 'Withdraw'}
                        </button>
                      </div>
                    </div>
                  )}

                  {latest?.status === 'Accepted' && (
                    <div className="border border-teal-200 rounded-xl p-4 bg-teal-50">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 font-semibold border border-teal-200">
                        Accepted
                      </span>
                      <p className="text-sm text-slate-700 mt-2">
                        Your proposal was accepted. A contract has been created — open the workflow to begin.
                      </p>
                      <p className="text-sm font-bold text-teal-600 mt-1">
                        ${latest.bidAmount?.toLocaleString()} &middot; {latest.deliveryDays} days
                      </p>
                    </div>
                  )}

                  {(!latest || latest.status === 'Rejected') && (
                    <>
                      {latest?.status === 'Rejected' && (
                        <div className="mb-4 border border-rose-200 rounded-xl p-3 bg-rose-50">
                          <p className="text-xs text-rose-700">
                            Your previous proposal was not accepted. You can submit a new one.
                          </p>
                        </div>
                      )}
                      {projectOpen ? (
                        <form onSubmit={handleCreateProposal} className="space-y-3">
                          <div className="grid md:grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-slate-500 mb-1 block">Bid Amount ($)</label>
                              <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                placeholder="e.g. 500"
                                value={proposalForm.bidAmount}
                                onChange={e => setProposalForm(p => ({ ...p, bidAmount: e.target.value }))}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                required
                              />
                            </div>
                            <div>
                              <label className="text-xs text-slate-500 mb-1 block">Delivery Days</label>
                              <input
                                type="number"
                                min="1"
                                placeholder="e.g. 14"
                                value={proposalForm.deliveryDays}
                                onChange={e => setProposalForm(p => ({ ...p, deliveryDays: e.target.value }))}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                required
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-slate-500 mb-1 block">Message</label>
                            <textarea
                              placeholder="Describe your approach, relevant experience, and why you're the right fit..."
                              value={proposalForm.message}
                              onChange={e => setProposalForm(p => ({ ...p, message: e.target.value }))}
                              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                              rows={4}
                              required
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={proposalActionKey === 'create'}
                            className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold disabled:opacity-60"
                          >
                            {proposalActionKey === 'create' ? 'Submitting...' : 'Submit Proposal'}
                          </button>
                        </form>
                      ) : (
                        <div className="border border-dashed border-slate-300 rounded-xl p-6 text-center text-slate-400 text-sm">
                          This project is no longer accepting proposals.
                        </div>
                      )}
                    </>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
