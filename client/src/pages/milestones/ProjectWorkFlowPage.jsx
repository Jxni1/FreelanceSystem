import { useEffect, useMemo, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useContracts } from '../../hooks/useContracts';

import { useAuthorization } from '../../hooks/useAuthorization';
import { SmartBackButton } from '../../components/SmartBackButton';
import { reviewService } from '../../lib/reviewService';
import MilestoneSubmitSection from '../projects/components/MilestoneSubmitSection';
import { useMilestones } from '../../hooks/useMilestones';

function statusBadgeClass(status) {
  switch (status) {
    case 'Draft':
      return 'bg-slate-100 text-slate-700 ring-slate-200';
    case 'PendingPayment':
      return 'bg-violet-50 text-violet-700 ring-violet-200';
    case 'Funded':
      return 'bg-blue-50 text-blue-700 ring-blue-200';
    case 'Submitted':
      return 'bg-amber-50 text-amber-700 ring-amber-200';
    case 'Approved':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
    case 'Cancelled':
      return 'bg-rose-50 text-rose-700 ring-rose-200';
    default:
      return 'bg-slate-100 text-slate-700 ring-slate-200';
  }
}

function extractError(err) {
  const raw = err?.response?.data;
  if (typeof raw === 'string') return raw;
  if (raw?.message) return raw.message;
  if (Array.isArray(raw)) return raw.join(' ');
  return 'An error occurred.';
}

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString()}`;
}

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString();
}

function sectionCardClass() {
  return 'rounded-3xl border border-slate-200 bg-white shadow-sm';
}

function actionBtn(base = '') {
  return `inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${base}`;
}

export default function ProjectWorkflowPage() {
  const location = useLocation();
  const { id } = useParams();
  const isContractRoute = location.pathname.includes('/contracts/');
  const { isClient, isFreelancer } = useAuthorization();

  const { contract, fetchContractById, fetchContracts, isLoading: contractLoading } = useContracts();
  const {
    milestones,
    fetchMilestonesByContract,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    fundMilestone,
    approveMilestone,
    rejectMilestone,
  } = useMilestones();

  const [contractId, setContractId] = useState(null);
  const [workflowError, setWorkflowError] = useState(null);
  const [actionLoadingKey, setActionLoadingKey] = useState('');

  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    amount: '',
    dueDate: '',
  });

  const [editingMilestoneId, setEditingMilestoneId] = useState('');
  const [editMilestoneForm, setEditMilestoneForm] = useState({
    title: '',
    description: '',
    amount: '',
    dueDate: '',
  });

  const [rejectingMilestoneId, setRejectingMilestoneId] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const [reviewForm, setReviewForm] = useState({ comment: '', rating: 5 });
  const [reviewState, setReviewState] = useState({
    loading: false,
    error: null,
    submitted: false,
  });

  useEffect(() => {
    const resolve = async () => {
      if (!id) return;
      setWorkflowError(null);

      if (isContractRoute) {
        setContractId(id);
        try {
          await fetchContractById(id);
        } catch {
          setWorkflowError('Unable to load contract details.');
        }
        return;
      }

      try {
        const result = await fetchContracts({ projectID: id, page: 1, pageSize: 25 });
        const match =
          result?.items?.find((c) => (c.projectID || c.projectId) === id) ?? result?.items?.[0];
        const cid = match?.contractID || match?.contractId || null;
        setContractId(cid);

        if (cid) {
          await fetchContractById(cid);
        } else {
          setWorkflowError('No contract is linked to this project yet.');
        }
      } catch {
        setWorkflowError('Unable to resolve the project contract.');
      }
    };

    resolve();
  }, [id, isContractRoute, fetchContractById, fetchContracts]);

  const refreshMilestones = async (cid = contractId) => {
    if (!cid) return;
    try {
      await fetchMilestonesByContract(cid);
    } catch {
      setWorkflowError('Failed to reload milestones.');
    }
  };

  useEffect(() => {
    refreshMilestones();
  }, [contractId]); // eslint-disable-line

  const handleCreateMilestone = async (e) => {
    e.preventDefault();
    if (!contractId) return;

    setActionLoadingKey('create');
    setWorkflowError(null);

    try {
      const res = await createMilestone({
        title: newMilestone.title.trim(),
        description: newMilestone.description.trim(),
        amount: Number(newMilestone.amount),
        dueDate: new Date(newMilestone.dueDate).toISOString(),
        contractID: contractId,
      });

      if (!res?.success) {
        setWorkflowError(res?.error || 'Failed to create milestone.');
        return;
      }

      setNewMilestone({ title: '', description: '', amount: '', dueDate: '' });
      await refreshMilestones();
    } finally {
      setActionLoadingKey('');
    }
  };

  const startEdit = (m) => {
    setEditingMilestoneId(m.milestoneID);
    setEditMilestoneForm({
      title: m.title || '',
      description: m.description || '',
      amount: m.amount ?? '',
      dueDate: m.dueDate ? new Date(m.dueDate).toISOString().slice(0, 10) : '',
    });
  };

  const cancelEdit = () => {
    setEditingMilestoneId('');
    setEditMilestoneForm({
      title: '',
      description: '',
      amount: '',
      dueDate: '',
    });
  };

  const handleSaveEdit = async (m) => {
    setActionLoadingKey(`save-${m.milestoneID}`);
    setWorkflowError(null);

    try {
      const res = await updateMilestone(m.milestoneID, {
        title: editMilestoneForm.title.trim(),
        description: editMilestoneForm.description.trim(),
        amount: Number(editMilestoneForm.amount),
        dueDate: new Date(editMilestoneForm.dueDate).toISOString(),
        status: m.status,
      });

      if (!res?.success) {
        setWorkflowError(res?.error || 'Failed to update milestone.');
        return;
      }

      cancelEdit();
      await refreshMilestones();
    } finally {
      setActionLoadingKey('');
    }
  };

  const handleDelete = async (milestoneId) => {
    if (!window.confirm('Delete this milestone?')) return;

    setActionLoadingKey(`delete-${milestoneId}`);
    setWorkflowError(null);

    try {
      const res = await deleteMilestone(milestoneId);

      if (!res?.success) {
        setWorkflowError(res?.error || 'Failed to delete milestone.');
        return;
      }

      if (editingMilestoneId === milestoneId) cancelEdit();
      await refreshMilestones();
    } finally {
      setActionLoadingKey('');
    }
  };

  const handleFund = async (milestoneId) => {
    setActionLoadingKey(`fund-${milestoneId}`);
    setWorkflowError(null);

    try {
      const res = await fundMilestone(milestoneId, {});
      if (!res?.success) {
        setWorkflowError(res?.error || 'Failed to fund milestone.');
        return;
      }

      const url = res.data?.checkoutUrl;
      if (!url) {
        setWorkflowError('Stripe did not return a checkout URL.');
        return;
      }

      sessionStorage.setItem('postPaymentReturn', location.pathname);
      window.location.href = url;
    } finally {
      setActionLoadingKey('');
    }
  };

  const handleApprove = async (milestoneId) => {
    setActionLoadingKey(`approve-${milestoneId}`);
    setWorkflowError(null);

    try {
      const res = await approveMilestone(milestoneId);

      if (!res?.success) {
        setWorkflowError(res?.error || 'Failed to approve milestone.');
        return;
      }

      await refreshMilestones();
      if (contractId) await fetchContractById(contractId);
    } finally {
      setActionLoadingKey('');
    }
  };

  const startReject = (milestoneId) => {
    setRejectingMilestoneId(milestoneId);
    setRejectReason('');
  };

  const cancelReject = () => {
    setRejectingMilestoneId('');
    setRejectReason('');
  };

  const handleReject = async (milestoneId) => {
    setActionLoadingKey(`reject-${milestoneId}`);
    setWorkflowError(null);

    try {
      const res = await rejectMilestone(milestoneId, rejectReason.trim() || undefined);

      if (!res?.success) {
        setWorkflowError(res?.error || 'Failed to reject submission.');
        return;
      }

      cancelReject();
      await refreshMilestones();
      if (contractId) await fetchContractById(contractId);
    } finally {
      setActionLoadingKey('');
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!contract?.contractID) return;

    setReviewState({ loading: true, error: null, submitted: false });

    try {
      await reviewService.create({
        contractID: contract.contractID,
        comment: reviewForm.comment.trim(),
        rating: reviewForm.rating,
      });

      setReviewState({ loading: false, error: null, submitted: true });
    } catch (err) {
      setReviewState({
        loading: false,
        error: extractError(err),
        submitted: false,
      });
    }
  };

  const approvedCount = milestones.filter((m) => m.status === 'Approved').length;
  const submittedCount = milestones.filter((m) => m.status === 'Submitted').length;
  const fundedCount = milestones.filter((m) => m.status === 'Funded').length;
  const contractComplete = contract?.status === 'Completed';
  const totalValue = milestones.reduce((s, m) => s + (m.amount || 0), 0);

  const workflowProgress = useMemo(() => {
    if (!milestones.length) return 0;
    return Math.round((approvedCount / milestones.length) * 100);
  }, [approvedCount, milestones.length]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-4">
          <SmartBackButton
            fallbackTo={contract?.projectID ? `/projects/${contract.projectID}` : '/projects'}
            label="Back to Project"
          />
        </div>

        <div className="space-y-6">
          <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-7 text-white sm:px-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200 ring-1 ring-white/15">
                      Workflow
                    </span>
                    {contract?.contractID && (
                      <span className="rounded-full bg-white/10 px-3 py-1 font-mono text-[11px] text-slate-200 ring-1 ring-white/15">
                        Contract {contract.contractID}
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    {contract?.projectTitle || 'Project Workflow'}
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
                    Track milestones, escrow funding, submissions, approvals, and final review in one place.
                  </p>
                </div>

                <div className="flex flex-col items-start gap-3 lg:items-end">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${
                      contractComplete
                        ? 'bg-emerald-400/10 text-emerald-200 ring-emerald-400/20'
                        : contract?.status === 'Cancelled'
                          ? 'bg-rose-400/10 text-rose-200 ring-rose-400/20'
                          : 'bg-blue-400/10 text-blue-200 ring-blue-400/20'
                    }`}
                  >
                    {contract?.status || 'Active'}
                  </span>

                  <div className="w-full min-w-[220px] lg:max-w-xs">
                    <div className="mb-2 flex items-center justify-between text-xs text-slate-300">
                      <span>Overall progress</span>
                      <span>{workflowProgress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-emerald-400 transition-all"
                        style={{ width: `${workflowProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-slate-200 bg-slate-50 p-4 sm:grid-cols-4 sm:p-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-medium text-slate-500">Approved</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {approvedCount}
                  <span className="ml-1 text-sm font-medium text-slate-400">/ {milestones.length || 0}</span>
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-medium text-slate-500">Funded</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{fundedCount}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-medium text-slate-500">Awaiting review</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{submittedCount}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-medium text-slate-500">Total value</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{formatMoney(totalValue)}</p>
              </div>
            </div>
          </section>

          {workflowError && (
            <div className="flex items-start justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <span>{workflowError}</span>
              <button
                type="button"
                className="shrink-0 font-medium text-amber-700 underline underline-offset-2"
                onClick={() => setWorkflowError(null)}
              >
                Dismiss
              </button>
            </div>
          )}

          <section className={sectionCardClass()}>
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-lg font-semibold text-slate-900">Workflow stages</h2>
              <p className="mt-1 text-sm text-slate-500">
                Each milestone moves from draft to funded, submitted, and approved.
              </p>
            </div>

            <div className="grid gap-4 p-6 md:grid-cols-4">
              {[
                { title: '1. Draft', desc: 'Client defines scope, amount, and due date.' },
                { title: '2. Funded', desc: 'Milestone is funded and held in escrow.' },
                { title: '3. Submitted', desc: 'Freelancer submits work and notes.' },
                { title: '4. Approved', desc: 'Client approves and payment is released.' },
              ].map((step) => (
                <div key={step.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{step.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {isClient && contractId && !contractComplete && (
            <section className={sectionCardClass()}>
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="text-lg font-semibold text-slate-900">Add milestone</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Create a new milestone with a budget, deadline, and clear deliverable description.
                </p>
              </div>

              <form onSubmit={handleCreateMilestone} className="space-y-4 p-6">
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Title</label>
                    <input
                      type="text"
                      placeholder="Landing page design"
                      value={newMilestone.title}
                      onChange={(e) => setNewMilestone((p) => ({ ...p, title: e.target.value }))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Amount</label>
                    <input
                      type="number"
                      placeholder="500"
                      min="0.01"
                      step="0.01"
                      value={newMilestone.amount}
                      onChange={(e) => setNewMilestone((p) => ({ ...p, amount: e.target.value }))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Due date</label>
                    <input
                      type="date"
                      value={newMilestone.dueDate}
                      onChange={(e) => setNewMilestone((p) => ({ ...p, dueDate: e.target.value }))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
                  <textarea
                    placeholder="Describe what should be delivered for this milestone..."
                    value={newMilestone.description}
                    onChange={(e) => setNewMilestone((p) => ({ ...p, description: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    rows={3}
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={actionLoadingKey === 'create'}
                    className={actionBtn('bg-indigo-600 text-white hover:bg-indigo-700')}
                  >
                    {actionLoadingKey === 'create' ? 'Adding...' : 'Add milestone'}
                  </button>
                </div>
              </form>
            </section>
          )}

          <section className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Milestones</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Review funding, submissions, approvals, and next actions for each milestone.
                </p>
              </div>
            </div>

            {contractLoading && (
              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-6 text-sm text-slate-500 shadow-sm">
                Loading workflow...
              </div>
            )}

            {!milestones.length && !contractLoading && (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
                <p className="text-base font-medium text-slate-700">
                  {contractId ? 'No milestones yet.' : 'No contract linked to this project.'}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  {contractId
                    ? 'Create the first milestone to start the project workflow.'
                    : 'A contract needs to exist before workflow milestones can be managed.'}
                </p>
              </div>
            )}

            {milestones.map((m, idx) => (
              <article
                key={m.milestoneID}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                          {idx + 1}
                        </span>
                        {m.isOverdue && (
                          <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-200">
                            Overdue
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusBadgeClass(m.status)}`}
                        >
                          {m.status}
                        </span>
                      </div>

                      <h3 className="truncate text-lg font-semibold text-slate-900">{m.title}</h3>

                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                        <span>Due {formatDate(m.dueDate)}</span>
                        <span>{formatMoney(m.amount)}</span>
                        {m.totalDeliverables > 0 && (
                          <span>
                            {m.totalDeliverables} file{m.totalDeliverables !== 1 ? 's' : ''} submitted
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid min-w-[220px] grid-cols-3 gap-2 rounded-2xl border border-slate-200 bg-white p-3">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Funded</p>
                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {m.fundedAt ? formatDate(m.fundedAt) : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Submitted</p>
                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {m.submittedAt ? formatDate(m.submittedAt) : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Approved</p>
                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {m.approvedAt ? formatDate(m.approvedAt) : '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {isClient && editingMilestoneId === m.milestoneID && (
                  <div className="border-b border-slate-200 bg-indigo-50/50 px-5 py-5 sm:px-6">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-slate-900">Edit milestone</h4>
                    </div>

                    <div className="grid gap-3 md:grid-cols-4">
                      <input
                        type="text"
                        value={editMilestoneForm.title}
                        onChange={(e) => setEditMilestoneForm((p) => ({ ...p, title: e.target.value }))}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                        placeholder="Title"
                      />
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={editMilestoneForm.amount}
                        onChange={(e) => setEditMilestoneForm((p) => ({ ...p, amount: e.target.value }))}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                        placeholder="Amount"
                      />
                      <input
                        type="date"
                        value={editMilestoneForm.dueDate}
                        onChange={(e) => setEditMilestoneForm((p) => ({ ...p, dueDate: e.target.value }))}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(m)}
                          disabled={actionLoadingKey === `save-${m.milestoneID}`}
                          className={actionBtn('flex-1 bg-indigo-600 text-white hover:bg-indigo-700')}
                        >
                          {actionLoadingKey === `save-${m.milestoneID}` ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className={actionBtn('flex-1 border border-slate-300 bg-white text-slate-700 hover:bg-slate-50')}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>

                    <textarea
                      value={editMilestoneForm.description}
                      onChange={(e) =>
                        setEditMilestoneForm((p) => ({ ...p, description: e.target.value }))
                      }
                      className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                      placeholder="Description"
                      rows={3}
                    />
                  </div>
                )}

                <div className="space-y-4 px-5 py-5 sm:px-6">
                  {m.description && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Description</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{m.description}</p>
                    </div>
                  )}

                  {m.status === 'Draft' && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      {isClient ? (
                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(m)}
                              className={actionBtn('border border-slate-300 bg-white text-slate-700 hover:bg-slate-50')}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(m.milestoneID)}
                              disabled={actionLoadingKey === `delete-${m.milestoneID}`}
                              className={actionBtn('border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100')}
                            >
                              {actionLoadingKey === `delete-${m.milestoneID}` ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>

                          <div className="flex flex-col gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm font-semibold text-blue-900">Ready to fund this milestone</p>
                              <p className="mt-1 text-sm text-blue-700">
                                {formatMoney(m.amount)} will be held in escrow through Stripe until approval.
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleFund(m.milestoneID)}
                              disabled={actionLoadingKey === `fund-${m.milestoneID}`}
                              className={actionBtn('bg-blue-600 text-white hover:bg-blue-700')}
                            >
                              {actionLoadingKey === `fund-${m.milestoneID}` ? 'Redirecting...' : 'Fund with Stripe'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">
                          Waiting for the client to fund this milestone before work begins.
                        </p>
                      )}
                    </div>
                  )}

                  {m.status === 'PendingPayment' && (
                    <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
                      {isClient ? (
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-violet-900">Payment in progress</p>
                            <p className="mt-1 text-sm text-violet-700">
                              Complete checkout to move this milestone into escrow.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleFund(m.milestoneID)}
                            disabled={actionLoadingKey === `fund-${m.milestoneID}`}
                            className={actionBtn('bg-violet-600 text-white hover:bg-violet-700')}
                          >
                            {actionLoadingKey === `fund-${m.milestoneID}` ? 'Redirecting...' : 'Resume payment'}
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm text-violet-700">
                          The client is currently completing payment for this milestone.
                        </p>
                      )}
                    </div>
                  )}

                  {m.status === 'Funded' && (
                    <div className="space-y-4">
                      {m.rejectionNote && (
                        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">
                            Changes requested
                          </p>
                          <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-rose-800">
                            {m.rejectionNote}
                          </p>
                        </div>
                      )}

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      {isFreelancer ? (
                        <MilestoneSubmitSection
                          milestoneId={m.milestoneID}
                          onSubmitted={async () => {
                            setWorkflowError(null);
                            await refreshMilestones();
                            if (contractId) await fetchContractById(contractId);
                          }}
                        />
                      ) : (
                        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                          <p className="text-sm font-semibold text-blue-900">Escrow funded</p>
                          <p className="mt-1 text-sm text-blue-700">
                            The milestone is funded. Waiting for the freelancer to submit deliverables.
                          </p>
                        </div>
                      )}
                      </div>
                    </div>
                  )}

                  {m.status === 'Submitted' && (
                    <div className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <div>
                        <p className="text-sm font-semibold text-amber-900">Submission received</p>
                        <p className="mt-1 text-sm text-amber-700">
                          Review the delivery and approve to release {formatMoney(m.amount)}.
                        </p>
                      </div>

                      {m.submissionNote && (
                        <div className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Submission note
                          </p>
                          <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                            {m.submissionNote}
                          </p>
                        </div>
                      )}

                      {m.totalDeliverables > 0 && (
                        <p className="text-sm text-slate-600">
                          {m.totalDeliverables} file{m.totalDeliverables !== 1 ? 's' : ''} attached to this submission.
                        </p>
                      )}

                      {isClient ? (
                        <div className="space-y-3">
                          {rejectingMilestoneId === m.milestoneID && (
                            <div className="rounded-2xl border border-rose-200 bg-white/70 p-4">
                              <label className="mb-1.5 block text-sm font-medium text-rose-900">
                                Reason for requesting changes
                              </label>
                              <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                rows={3}
                                placeholder="Let the freelancer know what needs to change..."
                                className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-rose-500 focus:ring-4 focus:ring-rose-100"
                              />
                              <p className="mt-1.5 text-xs text-rose-700/80">
                                The submission is returned to the freelancer for a new attempt. Escrow funds stay held.
                              </p>
                            </div>
                          )}

                          <div className="flex flex-wrap justify-end gap-2">
                            {rejectingMilestoneId === m.milestoneID ? (
                              <>
                                <button
                                  type="button"
                                  onClick={cancelReject}
                                  className={actionBtn('border border-slate-300 bg-white text-slate-700 hover:bg-slate-50')}
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleReject(m.milestoneID)}
                                  disabled={actionLoadingKey === `reject-${m.milestoneID}`}
                                  className={actionBtn('bg-rose-600 text-white hover:bg-rose-700')}
                                >
                                  {actionLoadingKey === `reject-${m.milestoneID}`
                                    ? 'Rejecting...'
                                    : 'Confirm rejection'}
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => startReject(m.milestoneID)}
                                  className={actionBtn('border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100')}
                                >
                                  Request changes
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleApprove(m.milestoneID)}
                                  disabled={actionLoadingKey === `approve-${m.milestoneID}`}
                                  className={actionBtn('bg-emerald-600 text-white hover:bg-emerald-700')}
                                >
                                  {actionLoadingKey === `approve-${m.milestoneID}`
                                    ? 'Approving...'
                                    : 'Approve & release payment'}
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm font-medium text-amber-800">
                          Waiting for the client to review and approve this milestone.
                        </p>
                      )}
                    </div>
                  )}

                  {m.status === 'Approved' && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-sm font-semibold text-emerald-900">
                        Approved — payment released successfully.
                      </p>
                      {m.submissionNote && (
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-emerald-800/90">
                          {m.submissionNote}
                        </p>
                      )}
                    </div>
                  )}

                  {m.status === 'Cancelled' && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                      <p className="text-sm font-semibold text-rose-900">This milestone has been cancelled.</p>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </section>

          <section className={sectionCardClass()}>
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-lg font-semibold text-slate-900">Escrow flow</h2>
              <p className="mt-1 text-sm text-slate-500">
                A simple overview of how milestone funding and approval work.
              </p>
            </div>

            <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-4">
              {[
                'Client creates milestones and defines scope, amount, and due date.',
                'Each funded milestone is held in escrow through Stripe.',
                'Freelancer submits work with notes, proof, and optional file IDs.',
                'Client approves the submission and payment is released.',
              ].map((item, i) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                    {i + 1}
                  </div>
                  <p className="text-sm leading-6 text-slate-600">{item}</p>
                </div>
              ))}
            </div>
          </section>

          {isClient && contractComplete && (
            <section className={sectionCardClass()}>
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="text-lg font-semibold text-slate-900">Leave a review</h2>
                <p className="mt-1 text-sm text-slate-500">
                  The contract is complete. Share your experience working with the freelancer.
                </p>
              </div>

              <div className="p-6">
                {reviewState.submitted ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm font-medium text-emerald-800">
                    Your review has been submitted.
                  </div>
                ) : (
                  <form onSubmit={handleReview} className="space-y-4">
                    {reviewState.error && (
                      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {reviewState.error}
                      </div>
                    )}

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <span className="text-sm font-medium text-slate-700">Rating</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm((p) => ({ ...p, rating: star }))}
                            className={`text-3xl leading-none transition ${
                              star <= reviewForm.rating
                                ? 'text-amber-400'
                                : 'text-slate-300 hover:text-amber-200'
                            }`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                      <span className="text-sm text-slate-500">{reviewForm.rating}/5</span>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">Comment</label>
                      <textarea
                        placeholder="Share your experience working with this freelancer..."
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                        rows={4}
                        required
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={reviewState.loading}
                        className={actionBtn('bg-indigo-600 text-white hover:bg-indigo-700')}
                      >
                        {reviewState.loading ? 'Submitting...' : 'Submit review'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}