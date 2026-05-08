import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useContracts } from '../../hooks/useContracts';
import { useMilestones } from '../../hooks/useMilestones';
import { useAuthorization } from '../../hooks/useAuthorization';
import { SmartBackButton } from '../../components/SmartBackButton';
import { reviewService } from '../../lib/reviewService';

const PAYMENT_METHODS = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'stripe', label: 'Stripe' },
];

function statusBadgeClass(status) {
  switch (status) {
    case 'Draft':     return 'bg-slate-100 text-slate-600';
    case 'Funded':    return 'bg-blue-100 text-blue-700';
    case 'Submitted': return 'bg-amber-100 text-amber-700';
    case 'Approved':  return 'bg-teal-100 text-teal-700';
    case 'Cancelled': return 'bg-rose-100 text-rose-700';
    default:          return 'bg-slate-100 text-slate-600';
  }
}

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

  const { contract, fetchContractById, fetchContracts, isLoading: contractLoading } = useContracts();
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

  const [fundForms, setFundForms] = useState({});
  const [submitForms, setSubmitForms] = useState({});

  const [reviewForm, setReviewForm] = useState({ comment: '', rating: 5 });
  const [reviewState, setReviewState] = useState({ loading: false, error: null, submitted: false });

  useEffect(() => {
    const resolve = async () => {
      if (!id) return;
      setWorkflowError(null);

      if (isContractRoute) {
        setContractId(id);
        try { await fetchContractById(id); }
        catch { setWorkflowError('Unable to load contract details.'); }
        return;
      }

      try {
        const result = await fetchContracts({ projectID: id, page: 1, pageSize: 25 });
        const match = result?.items?.find(c => (c.projectID || c.projectId) === id) ?? result?.items?.[0];
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
    try { await fetchMilestonesByContract(cid); }
    catch { setWorkflowError('Failed to reload milestones.'); }
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
      if (!res?.success) { setWorkflowError(res?.error || 'Failed to create milestone.'); return; }
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
      if (!res?.success) { setWorkflowError(res?.error || 'Failed to update milestone.'); return; }
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
      if (!res?.success) { setWorkflowError(res?.error || 'Failed to delete milestone.'); return; }
      if (editingMilestoneId === milestoneId) cancelEdit();
      await refreshMilestones();
    } finally {
      setActionLoadingKey('');
    }
  };

  const handleFund = async (milestoneId) => {
    const method = fundForms[milestoneId]?.paymentMethod || '';
    if (!method) { setWorkflowError('Please select a payment method to fund this milestone.'); return; }
    setActionLoadingKey(`fund-${milestoneId}`);
    setWorkflowError(null);
    try {
      const res = await fundMilestone(milestoneId, { paymentMethod: method });
      if (!res?.success) { setWorkflowError(res?.error || 'Failed to fund milestone.'); return; }
      setFundForms(prev => { const n = { ...prev }; delete n[milestoneId]; return n; });
      await refreshMilestones();
    } finally {
      setActionLoadingKey('');
    }
  };

  const handleSubmit = async (milestoneId) => {
    const form = submitForms[milestoneId] || {};
    const note = form.note?.trim() || '';
    const fileIds = (form.rawFileIds || '').split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    if (!note && !fileIds.length) {
      setWorkflowError('Please provide a submission note or at least one File ID.');
      return;
    }
    setActionLoadingKey(`submit-${milestoneId}`);
    setWorkflowError(null);
    try {
      const res = await submitMilestone(milestoneId, {
        fileIds,
        note: note || undefined,
      });
      if (!res?.success) { setWorkflowError(res?.error || 'Failed to submit milestone.'); return; }
      setSubmitForms(prev => { const n = { ...prev }; delete n[milestoneId]; return n; });
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
      if (!res?.success) { setWorkflowError(res?.error || 'Failed to approve milestone.'); return; }
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

  const approvedCount = milestones.filter(m => m.status === 'Approved').length;
  const contractComplete = contract?.status === 'Completed';
  const totalValue = milestones.reduce((s, m) => s + (m.amount || 0), 0);

  return (
    <div className="p-8 max-w-5xl mx-auto text-slate-100">
      <SmartBackButton
        fallbackTo={contract?.projectID ? `/projects/${contract.projectID}` : '/projects'}
        label="Back to Project"
      />

      <div className="bg-white border rounded-2xl p-6 mt-4 text-slate-900">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">{contract?.projectTitle || 'Project Workflow'}</h1>
            <p className="text-slate-500 text-sm mt-1">Milestones · Escrow · Deliveries</p>
            {contract?.contractID && (
              <p className="text-xs text-slate-400 font-mono mt-1">Contract: {contract.contractID}</p>
            )}
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${
            contractComplete
              ? 'bg-teal-50 text-teal-700 border-teal-200'
              : contract?.status === 'Cancelled'
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}>
            {contract?.status || 'Active'}
          </span>
        </div>
      </div>

      {workflowError && (
        <div className="mt-4 flex items-start justify-between gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-sm">
          <span>{workflowError}</span>
          <button
            type="button"
            className="shrink-0 text-amber-600 underline text-xs"
            onClick={() => setWorkflowError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-teal-50 p-4 rounded-xl">
          <p className="text-xs text-teal-600 font-medium">Approved</p>
          <p className="text-2xl text-teal-700 font-bold mt-0.5">{approvedCount}/{milestones.length}</p>
        </div>
        <div className="bg-indigo-50 p-4 rounded-xl">
          <p className="text-xs text-indigo-600 font-medium">Total Milestones</p>
          <p className="text-2xl text-indigo-700 font-bold mt-0.5">{milestones.length}</p>
        </div>
        <div className="bg-amber-50 p-4 rounded-xl">
          <p className="text-xs text-amber-600 font-medium">Contract</p>
          <p className="text-xl text-amber-700 font-bold mt-0.5 truncate">{contract?.status || '—'}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-xl">
          <p className="text-xs text-purple-600 font-medium">Total Value</p>
          <p className="text-2xl text-purple-700 font-bold mt-0.5">${totalValue.toLocaleString()}</p>
        </div>
      </div>

      {isClient && contractId && !contractComplete && (
        <form
          onSubmit={handleCreateMilestone}
          className="mt-6 border rounded-2xl p-5 bg-white text-slate-900 space-y-3"
        >
          <h2 className="font-bold text-base text-slate-800">Add Milestone</h2>
          <div className="grid md:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Title"
              value={newMilestone.title}
              onChange={e => setNewMilestone(p => ({ ...p, title: e.target.value }))}
              className="border rounded-lg px-3 py-2 text-sm"
              required
            />
            <input
              type="number"
              placeholder="Amount ($)"
              min="0.01"
              step="0.01"
              value={newMilestone.amount}
              onChange={e => setNewMilestone(p => ({ ...p, amount: e.target.value }))}
              className="border rounded-lg px-3 py-2 text-sm"
              required
            />
            <input
              type="date"
              value={newMilestone.dueDate}
              onChange={e => setNewMilestone(p => ({ ...p, dueDate: e.target.value }))}
              className="border rounded-lg px-3 py-2 text-sm"
              required
            />
            <button
              type="submit"
              disabled={actionLoadingKey === 'create'}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60"
            >
              {actionLoadingKey === 'create' ? 'Adding...' : '+ Add Milestone'}
            </button>
          </div>
          <textarea
            placeholder="Description (required)"
            value={newMilestone.description}
            onChange={e => setNewMilestone(p => ({ ...p, description: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            rows={2}
            required
          />
        </form>
      )}

      <div className="mt-8 space-y-3">
        <h2 className="font-bold text-lg">Milestones</h2>

        {contractLoading && <p className="text-sm text-slate-400">Loading...</p>}
        {!milestones.length && !contractLoading && (
          <div className="border border-dashed rounded-xl p-8 text-center text-slate-400 text-sm">
            {contractId ? 'No milestones yet.' : 'No contract linked to this project.'}
          </div>
        )}

        {milestones.map((m, idx) => (
          <div key={m.milestoneID} className="border rounded-xl bg-white text-slate-900 overflow-hidden">
            <div className="flex items-start justify-between gap-3 p-4 pb-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="shrink-0 w-7 h-7 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{m.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Due {new Date(m.dueDate).toLocaleDateString()} &middot; ${m.amount?.toLocaleString()}
                    {m.totalDeliverables > 0 && (
                      <> &middot; {m.totalDeliverables} file{m.totalDeliverables !== 1 ? 's' : ''} submitted</>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {m.isOverdue && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-600">Overdue</span>
                )}
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusBadgeClass(m.status)}`}>
                  {m.status}
                </span>
              </div>
            </div>

            {(m.fundedAt || m.submittedAt || m.approvedAt) && (
              <div className="px-4 pb-2 flex flex-wrap gap-4 text-xs text-slate-400">
                {m.fundedAt    && <span>Funded {new Date(m.fundedAt).toLocaleDateString()}</span>}
                {m.submittedAt && <span>Submitted {new Date(m.submittedAt).toLocaleDateString()}</span>}
                {m.approvedAt  && <span>Approved {new Date(m.approvedAt).toLocaleDateString()}</span>}
              </div>
            )}

            {isClient && editingMilestoneId === m.milestoneID && (
              <div className="px-4 pb-4 pt-3 border-t bg-slate-50 space-y-2">
                <div className="grid md:grid-cols-4 gap-2">
                  <input
                    type="text"
                    value={editMilestoneForm.title}
                    onChange={e => setEditMilestoneForm(p => ({ ...p, title: e.target.value }))}
                    className="border rounded-lg px-3 py-2 text-sm bg-white"
                    placeholder="Title"
                  />
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={editMilestoneForm.amount}
                    onChange={e => setEditMilestoneForm(p => ({ ...p, amount: e.target.value }))}
                    className="border rounded-lg px-3 py-2 text-sm bg-white"
                    placeholder="Amount"
                  />
                  <input
                    type="date"
                    value={editMilestoneForm.dueDate}
                    onChange={e => setEditMilestoneForm(p => ({ ...p, dueDate: e.target.value }))}
                    className="border rounded-lg px-3 py-2 text-sm bg-white"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(m)}
                      disabled={actionLoadingKey === `save-${m.milestoneID}`}
                      className="flex-1 px-3 py-2 text-xs rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                    >
                      {actionLoadingKey === `save-${m.milestoneID}` ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="flex-1 px-3 py-2 text-xs rounded-lg border text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
                <textarea
                  value={editMilestoneForm.description}
                  onChange={e => setEditMilestoneForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                  placeholder="Description"
                  rows={2}
                />
              </div>
            )}

            <div className="px-4 pb-4">
              {m.status === 'Draft' && (
                <div className="border-t pt-3 space-y-3">
                  {isClient && (
                    <>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(m)}
                          className="px-3 py-1.5 text-xs rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(m.milestoneID)}
                          disabled={actionLoadingKey === `delete-${m.milestoneID}`}
                          className="px-3 py-1.5 text-xs rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 disabled:opacity-60"
                        >
                          {actionLoadingKey === `delete-${m.milestoneID}` ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={fundForms[m.milestoneID]?.paymentMethod || ''}
                          onChange={e =>
                            setFundForms(p => ({ ...p, [m.milestoneID]: { paymentMethod: e.target.value } }))
                          }
                          className="border rounded-lg px-3 py-2 text-sm text-slate-900 bg-white"
                        >
                          <option value="">Select payment method</option>
                          {PAYMENT_METHODS.map(pm => (
                            <option key={pm.value} value={pm.value}>{pm.label}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleFund(m.milestoneID)}
                          disabled={actionLoadingKey === `fund-${m.milestoneID}`}
                          className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-60"
                        >
                          {actionLoadingKey === `fund-${m.milestoneID}` ? 'Funding...' : 'Fund Milestone'}
                        </button>
                        <span className="text-xs text-slate-500">${m.amount?.toLocaleString()} held in escrow</span>
                      </div>
                    </>
                  )}
                  {isFreelancer && (
                    <p className="text-xs text-slate-500 italic">Waiting for client to fund this milestone.</p>
                  )}
                </div>
              )}

              {m.status === 'Funded' && (
                <div className="border-t pt-3">
                  {isFreelancer && (
                    <div className="space-y-3">
                      <p className="text-xs font-medium text-slate-700">Submit your work</p>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">
                          Submission note <span className="text-slate-400">(proof of work, URL, description, etc.)</span>
                        </label>
                        <textarea
                          placeholder="e.g. Domain connected — DNS A record updated to 203.0.113.42. Propagation takes up to 24h. Screenshot: https://..."
                          value={submitForms[m.milestoneID]?.note || ''}
                          onChange={e =>
                            setSubmitForms(p => ({
                              ...p,
                              [m.milestoneID]: { ...p[m.milestoneID], note: e.target.value },
                            }))
                          }
                          className="w-full border rounded-lg px-3 py-2 text-sm text-slate-900 bg-white"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">
                          File IDs <span className="text-slate-400">(optional — one GUID per line)</span>
                        </label>
                        <textarea
                          placeholder={'3fa85f64-5717-4562-b3fc-2c963f66afa6'}
                          value={submitForms[m.milestoneID]?.rawFileIds || ''}
                          onChange={e =>
                            setSubmitForms(p => ({
                              ...p,
                              [m.milestoneID]: { ...p[m.milestoneID], rawFileIds: e.target.value },
                            }))
                          }
                          className="w-full border rounded-lg px-3 py-2 text-sm text-slate-900 bg-white font-mono"
                          rows={2}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSubmit(m.milestoneID)}
                        disabled={actionLoadingKey === `submit-${m.milestoneID}`}
                        className="px-4 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold disabled:opacity-60"
                      >
                        {actionLoadingKey === `submit-${m.milestoneID}` ? 'Submitting...' : 'Submit Milestone'}
                      </button>
                    </div>
                  )}
                  {isClient && (
                    <p className="text-xs text-blue-600 font-medium">
                      Funded — waiting for freelancer to submit deliverables.
                    </p>
                  )}
                </div>
              )}

              {m.status === 'Submitted' && (
                <div className="border-t pt-3 space-y-3">
                  {m.submissionNote && (
                    <div className="rounded-lg bg-slate-50 border px-3 py-2">
                      <p className="text-xs font-medium text-slate-500 mb-0.5">Submission note</p>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{m.submissionNote}</p>
                    </div>
                  )}
                  {m.totalDeliverables > 0 && (
                    <p className="text-xs text-slate-500">
                      {m.totalDeliverables} file{m.totalDeliverables !== 1 ? 's' : ''} attached.
                    </p>
                  )}
                  {isClient && (
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-xs text-slate-500">
                        Approving releases ${m.amount?.toLocaleString()} to the freelancer.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleApprove(m.milestoneID)}
                        disabled={actionLoadingKey === `approve-${m.milestoneID}`}
                        className="px-4 py-2 text-sm rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold disabled:opacity-60"
                      >
                        {actionLoadingKey === `approve-${m.milestoneID}`
                          ? 'Approving...'
                          : 'Approve & Release Payment'}
                      </button>
                    </div>
                  )}
                  {isFreelancer && (
                    <p className="text-xs text-amber-600 font-medium">
                      Submitted — waiting for client to review and approve.
                    </p>
                  )}
                </div>
              )}

              {m.status === 'Approved' && (
                <div className="border-t pt-3 space-y-2">
                  <span className="text-sm font-medium text-teal-700">Approved — payment released.</span>
                  {m.submissionNote && (
                    <p className="text-xs text-slate-400 whitespace-pre-wrap">{m.submissionNote}</p>
                  )}
                </div>
              )}

              {m.status === 'Cancelled' && (
                <div className="border-t pt-3">
                  <p className="text-xs text-rose-500">This milestone has been cancelled.</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 border rounded-2xl p-5 bg-slate-50 text-slate-900">
        <h2 className="font-semibold text-sm text-slate-700 mb-2">Escrow Flow</h2>
        <ol className="list-decimal pl-5 text-xs text-slate-500 space-y-1">
          <li><strong>Client</strong> creates milestones (Draft) and funds each — payment held in escrow.</li>
          <li><strong>Freelancer</strong> submits deliverables by providing File IDs (Funded → Submitted).</li>
          <li><strong>Client</strong> reviews and approves — payment released to freelancer (Approved).</li>
          <li>When all milestones are approved the contract auto-completes.</li>
        </ol>
      </div>

      {isClient && contractComplete && (
        <div className="mt-6 border rounded-2xl p-5 bg-white text-slate-900">
          <h2 className="font-bold text-base mb-1">Leave a Review</h2>
          <p className="text-sm text-slate-500 mb-4">
            Contract completed — share your experience with the freelancer.
          </p>

          {reviewState.submitted ? (
            <div className="p-4 rounded-xl bg-teal-50 text-teal-700 text-sm font-medium">
              Your review has been submitted.
            </div>
          ) : (
            <form onSubmit={handleReview} className="space-y-3">
              {reviewState.error && (
                <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-sm">{reviewState.error}</div>
              )}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-700 shrink-0">Rating:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm(p => ({ ...p, rating: star }))}
                      className={`text-2xl leading-none transition-colors ${
                        star <= reviewForm.rating ? 'text-amber-400' : 'text-slate-300 hover:text-amber-200'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <span className="text-sm text-slate-400">{reviewForm.rating}/5</span>
              </div>
              <textarea
                placeholder="Share your experience working with this freelancer..."
                value={reviewForm.comment}
                onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                rows={3}
                required
              />
              <button
                type="submit"
                disabled={reviewState.loading}
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold disabled:opacity-60"
              >
                {reviewState.loading ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
