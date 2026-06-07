import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { CheckCircle2, Layers, FileText, DollarSign, Star } from 'lucide-react';
import { useContracts } from '../../hooks/useContracts';
import { useMilestones } from '../../hooks/useMilestones';
import { useAuthorization } from '../../hooks/useAuthorization';
import { reviewService } from '../../lib/reviewService';
import { SmartBackButton } from '../../components/SmartBackButton';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/ui/StatCard';
import { PageHeading } from '../../components/ui/PageHeading';

const STATUS_TONE = {
  Draft: 'slate',
  PendingPayment: 'violet',
  Funded: 'sky',
  Submitted: 'amber',
  Approved: 'emerald',
  Cancelled: 'rose',
  Active: 'sky',
  InProgress: 'sky',
  Completed: 'emerald',
};

const fieldClass =
  'h-10 w-full rounded-xl border border-line bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100';
const areaClass =
  'w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100';

function extractError(err) {
  const raw = err?.response?.data;
  if (typeof raw === 'string') return raw;
  if (raw?.message) return raw.message;
  if (Array.isArray(raw)) return raw.join(' ');
  return 'An error occurred.';
}

export default function ProjectWorkflowPage() {
  const location = useLocation();
  const { id } = useParams();
  const isContractRoute = location.pathname.includes('/contracts/');
  const { isClient, isFreelancer } = useAuthorization();

  const { selectedContract: contract, fetchContractById, fetchContracts, isLoading: contractLoading } = useContracts();
  const {
    milestones,
    fetchMilestonesByContract,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    fundMilestone,
    submitMilestone,
    approveMilestone,
  } = useMilestones();

  const [contractId, setContractId] = useState(null);
  const [workflowError, setWorkflowError] = useState(null);
  const [actionLoadingKey, setActionLoadingKey] = useState('');

  const [newMilestone, setNewMilestone] = useState({ title: '', description: '', amount: '', dueDate: '' });
  const [editingMilestoneId, setEditingMilestoneId] = useState('');
  const [editMilestoneForm, setEditMilestoneForm] = useState({ title: '', description: '', amount: '', dueDate: '' });
  const [submitForms, setSubmitForms] = useState({});
  const [reviewForm, setReviewForm] = useState({ comment: '', rating: 5 });
  const [reviewState, setReviewState] = useState({ loading: false, error: null, submitted: false });

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
        const match = result?.items?.find((c) => (c.projectID || c.projectId) === id) ?? result?.items?.[0];
        const cid = match?.contractID || match?.contractId || null;
        setContractId(cid);
        if (cid) await fetchContractById(cid);
        else setWorkflowError('No contract is linked to this project yet.');
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
    if (!contractId) return;
    fetchMilestonesByContract(contractId).catch(() => setWorkflowError('Failed to reload milestones.'));
  }, [contractId, fetchMilestonesByContract]);

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
    setEditMilestoneForm({ title: '', description: '', amount: '', dueDate: '' });
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

  const handleSubmit = async (milestoneId) => {
    const form = submitForms[milestoneId] || {};
    const note = form.note?.trim() || '';
    const fileIds = (form.rawFileIds || '').split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
    if (!note && !fileIds.length) {
      setWorkflowError('Please provide a submission note or at least one File ID.');
      return;
    }
    setActionLoadingKey(`submit-${milestoneId}`);
    setWorkflowError(null);
    try {
      const res = await submitMilestone(milestoneId, { fileIds, note: note || undefined });
      if (!res?.success) {
        setWorkflowError(res?.error || 'Failed to submit milestone.');
        return;
      }
      setSubmitForms((prev) => {
        const next = { ...prev };
        delete next[milestoneId];
        return next;
      });
      await refreshMilestones();
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
      setReviewState({ loading: false, error: extractError(err), submitted: false });
    }
  };

  const approvedCount = milestones.filter((m) => m.status === 'Approved').length;
  const contractComplete = contract?.status === 'Completed';
  const totalValue = milestones.reduce((s, m) => s + (m.amount || 0), 0);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <SmartBackButton fallbackTo={contract?.projectID ? `/projects/${contract.projectID}` : '/projects'} label="Back to project" />

      <PageHeading
        title={contract?.projectTitle || 'Project workflow'}
        subtitle="Milestones · Escrow · Deliveries"
        actions={<Badge tone={STATUS_TONE[contract?.status] ?? 'sky'}>{contract?.status || 'Active'}</Badge>}
      />

      {workflowError ? (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span>{workflowError}</span>
          <button type="button" className="shrink-0 text-xs text-amber-600 underline" onClick={() => setWorkflowError(null)}>
            Dismiss
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Approved" value={`${approvedCount}/${milestones.length}`} icon={CheckCircle2} iconTone="brand" />
        <StatCard label="Total milestones" value={milestones.length} icon={Layers} iconTone="violet" />
        <StatCard label="Contract" value={contract?.status || '—'} icon={FileText} iconTone="amber" />
        <StatCard label="Total value" value={`$${totalValue.toLocaleString()}`} icon={DollarSign} iconTone="brand" />
      </div>

      {isClient && contractId && !contractComplete ? (
        <Card title="Add milestone">
          <form onSubmit={handleCreateMilestone} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <input type="text" placeholder="Title" value={newMilestone.title} onChange={(e) => setNewMilestone((p) => ({ ...p, title: e.target.value }))} className={fieldClass} required />
              <input type="number" placeholder="Amount ($)" min="0.01" step="0.01" value={newMilestone.amount} onChange={(e) => setNewMilestone((p) => ({ ...p, amount: e.target.value }))} className={fieldClass} required />
              <input type="date" value={newMilestone.dueDate} onChange={(e) => setNewMilestone((p) => ({ ...p, dueDate: e.target.value }))} className={fieldClass} required />
            </div>
            <textarea placeholder="Description (required)" value={newMilestone.description} onChange={(e) => setNewMilestone((p) => ({ ...p, description: e.target.value }))} className={areaClass} rows={2} required />
            <div className="flex justify-end">
              <Button as="button" type="submit" className="w-full sm:w-auto" disabled={actionLoadingKey === 'create'}>
                {actionLoadingKey === 'create' ? 'Adding…' : 'Add milestone'}
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">Milestones</h2>

        {contractLoading ? <p className="text-sm text-slate-400">Loading…</p> : null}
        {!milestones.length && !contractLoading ? (
          <Card>
            <p className="py-6 text-center text-sm text-slate-400">{contractId ? 'No milestones yet.' : 'No contract linked to this project.'}</p>
          </Card>
        ) : null}

        {milestones.map((m, idx) => (
          <Card key={m.milestoneID} bodyClassName="p-0">
            <div className="flex items-start justify-between gap-3 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">{idx + 1}</span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{m.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Due {new Date(m.dueDate).toLocaleDateString()} · ${m.amount?.toLocaleString()}
                    {m.totalDeliverables > 0 ? <> · {m.totalDeliverables} file{m.totalDeliverables !== 1 ? 's' : ''} submitted</> : null}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {m.isOverdue ? <Badge tone="rose">Overdue</Badge> : null}
                <Badge tone={STATUS_TONE[m.status] ?? 'slate'}>{m.status}</Badge>
              </div>
            </div>

            {m.fundedAt || m.submittedAt || m.approvedAt ? (
              <div className="flex flex-wrap gap-4 px-4 pb-2 text-xs text-slate-400">
                {m.fundedAt ? <span>Funded {new Date(m.fundedAt).toLocaleDateString()}</span> : null}
                {m.submittedAt ? <span>Submitted {new Date(m.submittedAt).toLocaleDateString()}</span> : null}
                {m.approvedAt ? <span>Approved {new Date(m.approvedAt).toLocaleDateString()}</span> : null}
              </div>
            ) : null}

            {isClient && editingMilestoneId === m.milestoneID ? (
              <div className="space-y-2 border-t border-line bg-slate-50 px-4 pb-4 pt-3">
                <div className="grid gap-2 sm:grid-cols-3">
                  <input type="text" value={editMilestoneForm.title} onChange={(e) => setEditMilestoneForm((p) => ({ ...p, title: e.target.value }))} className={fieldClass} placeholder="Title" />
                  <input type="number" min="0.01" step="0.01" value={editMilestoneForm.amount} onChange={(e) => setEditMilestoneForm((p) => ({ ...p, amount: e.target.value }))} className={fieldClass} placeholder="Amount" />
                  <input type="date" value={editMilestoneForm.dueDate} onChange={(e) => setEditMilestoneForm((p) => ({ ...p, dueDate: e.target.value }))} className={fieldClass} />
                </div>
                <textarea value={editMilestoneForm.description} onChange={(e) => setEditMilestoneForm((p) => ({ ...p, description: e.target.value }))} className={areaClass} placeholder="Description" rows={2} />
                <div className="flex gap-2">
                  <Button as="button" type="button" size="sm" onClick={() => handleSaveEdit(m)} disabled={actionLoadingKey === `save-${m.milestoneID}`}>
                    {actionLoadingKey === `save-${m.milestoneID}` ? 'Saving…' : 'Save'}
                  </Button>
                  <Button as="button" type="button" size="sm" variant="outline" onClick={cancelEdit}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="px-4 pb-4">
              {m.status === 'Draft' ? (
                <div className="space-y-3 border-t border-line pt-3">
                  {isClient ? (
                    <>
                      <div className="flex gap-2">
                        <Button as="button" type="button" size="sm" variant="soft" onClick={() => startEdit(m)}>Edit</Button>
                        <Button as="button" type="button" size="sm" variant="outline" onClick={() => handleDelete(m.milestoneID)} disabled={actionLoadingKey === `delete-${m.milestoneID}`}>
                          {actionLoadingKey === `delete-${m.milestoneID}` ? 'Deleting…' : 'Delete'}
                        </Button>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button as="button" type="button" onClick={() => handleFund(m.milestoneID)} disabled={actionLoadingKey === `fund-${m.milestoneID}`}>
                          {actionLoadingKey === `fund-${m.milestoneID}` ? 'Redirecting to Stripe…' : 'Fund with Stripe'}
                        </Button>
                        <span className="text-xs text-slate-500">${m.amount?.toLocaleString()} held in escrow via Stripe</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs italic text-slate-500">Waiting for client to fund this milestone.</p>
                  )}
                </div>
              ) : null}

              {m.status === 'PendingPayment' ? (
                <div className="border-t border-line pt-3">
                  {isClient ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-xs font-medium text-violet-600">Awaiting payment — finish checkout to fund this milestone.</p>
                      <Button as="button" type="button" onClick={() => handleFund(m.milestoneID)} disabled={actionLoadingKey === `fund-${m.milestoneID}`}>
                        {actionLoadingKey === `fund-${m.milestoneID}` ? 'Redirecting to Stripe…' : 'Resume payment'}
                      </Button>
                    </div>
                  ) : (
                    <p className="text-xs italic text-slate-500">Client is completing payment for this milestone.</p>
                  )}
                </div>
              ) : null}

              {m.status === 'Funded' ? (
                <div className="border-t border-line pt-3">
                  {isFreelancer ? (
                    <div className="space-y-3">
                      <p className="text-xs font-medium text-slate-700">Submit your work</p>
                      <div>
                        <label className="mb-1 block text-xs text-slate-500">Submission note <span className="text-slate-400">(proof of work, URL, description)</span></label>
                        <textarea
                          placeholder="e.g. Domain connected — DNS updated. Screenshot: https://…"
                          value={submitForms[m.milestoneID]?.note || ''}
                          onChange={(e) => setSubmitForms((p) => ({ ...p, [m.milestoneID]: { ...p[m.milestoneID], note: e.target.value } }))}
                          className={areaClass}
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-slate-500">File IDs <span className="text-slate-400">(optional — one GUID per line)</span></label>
                        <textarea
                          placeholder="3fa85f64-5717-4562-b3fc-2c963f66afa6"
                          value={submitForms[m.milestoneID]?.rawFileIds || ''}
                          onChange={(e) => setSubmitForms((p) => ({ ...p, [m.milestoneID]: { ...p[m.milestoneID], rawFileIds: e.target.value } }))}
                          className={`${areaClass} font-mono`}
                          rows={2}
                        />
                      </div>
                      <Button as="button" type="button" onClick={() => handleSubmit(m.milestoneID)} disabled={actionLoadingKey === `submit-${m.milestoneID}`}>
                        {actionLoadingKey === `submit-${m.milestoneID}` ? 'Submitting…' : 'Submit milestone'}
                      </Button>
                    </div>
                  ) : (
                    <p className="text-xs font-medium text-sky-600">Funded — waiting for freelancer to submit deliverables.</p>
                  )}
                </div>
              ) : null}

              {m.status === 'Submitted' ? (
                <div className="space-y-3 border-t border-line pt-3">
                  {m.submissionNote ? (
                    <div className="rounded-xl border border-line bg-slate-50 px-3 py-2">
                      <p className="mb-0.5 text-xs font-medium text-slate-500">Submission note</p>
                      <p className="whitespace-pre-wrap text-sm text-slate-700">{m.submissionNote}</p>
                    </div>
                  ) : null}
                  {m.totalDeliverables > 0 ? <p className="text-xs text-slate-500">{m.totalDeliverables} file{m.totalDeliverables !== 1 ? 's' : ''} attached.</p> : null}
                  {isClient ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-xs text-slate-500">Approving releases ${m.amount?.toLocaleString()} to the freelancer.</p>
                      <Button as="button" type="button" onClick={() => handleApprove(m.milestoneID)} disabled={actionLoadingKey === `approve-${m.milestoneID}`}>
                        {actionLoadingKey === `approve-${m.milestoneID}` ? 'Approving…' : 'Approve & release payment'}
                      </Button>
                    </div>
                  ) : (
                    <p className="text-xs font-medium text-amber-600">Submitted — waiting for client to review and approve.</p>
                  )}
                </div>
              ) : null}

              {m.status === 'Approved' ? (
                <div className="space-y-2 border-t border-line pt-3">
                  <span className="text-sm font-medium text-brand-700">Approved — payment released.</span>
                  {m.submissionNote ? <p className="whitespace-pre-wrap text-xs text-slate-400">{m.submissionNote}</p> : null}
                </div>
              ) : null}

              {m.status === 'Cancelled' ? (
                <div className="border-t border-line pt-3">
                  <p className="text-xs text-rose-500">This milestone has been cancelled.</p>
                </div>
              ) : null}
            </div>
          </Card>
        ))}
      </div>

      <div className="rounded-2xl border border-line bg-slate-50 p-5">
        <h2 className="mb-2 text-sm font-semibold text-slate-700">Escrow flow</h2>
        <ol className="list-decimal space-y-1 pl-5 text-xs text-slate-500">
          <li><strong>Client</strong> creates milestones (Draft) and funds each — held in escrow.</li>
          <li><strong>Freelancer</strong> submits deliverables (Funded → Submitted).</li>
          <li><strong>Client</strong> reviews and approves — payment released (Approved).</li>
          <li>When all milestones are approved the contract auto-completes.</li>
        </ol>
      </div>

      {isClient && contractComplete ? (
        <Card title="Leave a review">
          {reviewState.submitted ? (
            <div className="rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700">Your review has been submitted.</div>
          ) : (
            <form onSubmit={handleReview} className="space-y-3">
              {reviewState.error ? <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{reviewState.error}</div> : null}
              <div className="flex items-center gap-3">
                <span className="shrink-0 text-sm font-medium text-slate-700">Rating</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setReviewForm((p) => ({ ...p, rating: star }))} aria-label={`${star} star`}>
                      <Star className={`h-6 w-6 ${star <= reviewForm.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} aria-hidden="true" />
                    </button>
                  ))}
                </div>
                <span className="text-sm text-slate-400">{reviewForm.rating}/5</span>
              </div>
              <textarea placeholder="Share your experience working with this freelancer…" value={reviewForm.comment} onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))} className={areaClass} rows={3} required />
              <Button as="button" type="submit" disabled={reviewState.loading}>
                {reviewState.loading ? 'Submitting…' : 'Submit review'}
              </Button>
            </form>
          )}
        </Card>
      ) : null}
    </div>
  );
}
