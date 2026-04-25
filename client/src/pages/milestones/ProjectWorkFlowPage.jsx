import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useContracts } from '../../hooks/useContracts';
import { useMilestones } from '../../hooks/useMilestones';
import { useAuthorization } from '../../hooks/useAuthorization';
import { deliverableService } from '../../lib/deliverableService';
import { SmartBackButton } from '../../components/SmartBackButton';

export default function ProjectWorkflowPage() {
  const location = useLocation();
  const { id } = useParams();
  const isContractRoute = location.pathname.includes('/contracts/');
  const { isClient, isFreelancer } = useAuthorization();

  const { contract, fetchContractById, fetchContracts, isLoading: contractLoading } = useContracts();
  const { milestones, fetchMilestonesByContract, createMilestone, updateMilestone, deleteMilestone, completeMilestone } = useMilestones();
  const [contractId, setContractId] = useState(null);
  const [isLoadingDeliverables, setIsLoadingDeliverables] = useState(false);
  const [deliverablesByMilestone, setDeliverablesByMilestone] = useState({});
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
  const [deliverableDrafts, setDeliverableDrafts] = useState({});

  useEffect(() => {
    const resolveContract = async () => {
      if (!id) return;
      setWorkflowError(null);

      if (isContractRoute) {
        setContractId(id);
        try {
          await fetchContractById(id);
        } catch {
          setWorkflowError('Unable to load contract details for this workflow.');
        }
        return;
      }

      try {
        const result = await fetchContracts({ projectID: id, page: 1, pageSize: 25 });
        const matchingContract = result?.items?.find(
          (item) => (item.projectID || item.projectId) === id,
        ) ?? result?.items?.[0];
        const linkedContractId = matchingContract?.contractID || matchingContract?.contractId || null;
        setContractId(linkedContractId);
        if (linkedContractId) {
          await fetchContractById(linkedContractId);
        } else {
          setWorkflowError('No contract is linked to this project yet.');
        }
      } catch {
        setWorkflowError('Unable to resolve the project contract for this workflow.');
      }
    };

    resolveContract();
  }, [id, isContractRoute, fetchContractById, fetchContracts]);

  const refreshWorkflowData = async (targetContractId = contractId) => {
    if (!targetContractId) return;
    try {
      await fetchMilestonesByContract(targetContractId);
    } catch {
      setWorkflowError('Failed to load milestones for this contract.');
    }
  };

  useEffect(() => {
    refreshWorkflowData();
  }, [contractId]);

  useEffect(() => {
    const fetchAllDeliverables = async () => {
      if (!milestones.length) {
        setDeliverablesByMilestone({});
        return;
      }

      setIsLoadingDeliverables(true);
      try {
        const entries = await Promise.all(
          milestones.map(async (milestone) => {
            const data = await deliverableService.getByMilestone(milestone.milestoneID);
            return [milestone.milestoneID, Array.isArray(data) ? data : []];
          }),
        );

        setDeliverablesByMilestone(Object.fromEntries(entries));
      } catch {
        setWorkflowError('Failed to load one or more deliverables.');
      } finally {
        setIsLoadingDeliverables(false);
      }
    };

    fetchAllDeliverables();
  }, [milestones]);

  const handleCreateMilestone = async (e) => {
    e.preventDefault();
    if (!contractId) return;

    setActionLoadingKey('create-milestone');
    setWorkflowError(null);
    try {
      const result = await createMilestone({
        title: newMilestone.title.trim(),
        description: newMilestone.description.trim(),
        amount: Number(newMilestone.amount),
        dueDate: new Date(newMilestone.dueDate).toISOString(),
        contractID: contractId,
      });

      if (!result?.success) {
        setWorkflowError(result?.error || 'Failed to create milestone.');
        return;
      }

      setNewMilestone({ title: '', description: '', amount: '', dueDate: '' });
      await refreshWorkflowData(contractId);
    } finally {
      setActionLoadingKey('');
    }
  };

  const handleSubmitDeliverable = async (milestoneId) => {
    const draft = deliverableDrafts[milestoneId];
    if (!draft?.fileID) {
      setWorkflowError('Please enter a valid File ID before submitting the deliverable.');
      return;
    }

    setActionLoadingKey(`submit-${milestoneId}`);
    setWorkflowError(null);
    try {
      await deliverableService.submit({
        milestoneID: milestoneId,
        fileID: draft.fileID.trim(),
      });
      setDeliverableDrafts((prev) => ({ ...prev, [milestoneId]: { fileID: '' } }));
      await refreshWorkflowData(contractId);
    } catch {
      setWorkflowError('Failed to submit deliverable. Please verify File ID and try again.');
    } finally {
      setActionLoadingKey('');
    }
  };

  const handleApproveDeliverable = async (deliverableId) => {
    setActionLoadingKey(`approve-${deliverableId}`);
    setWorkflowError(null);
    try {
      await deliverableService.approve(deliverableId);
      await refreshWorkflowData(contractId);
    } catch {
      setWorkflowError('Failed to approve deliverable.');
    } finally {
      setActionLoadingKey('');
    }
  };

  const handleRejectDeliverable = async (deliverableId) => {
    setActionLoadingKey(`reject-${deliverableId}`);
    setWorkflowError(null);
    try {
      await deliverableService.reject(deliverableId);
      await refreshWorkflowData(contractId);
    } catch {
      setWorkflowError('Failed to reject deliverable.');
    } finally {
      setActionLoadingKey('');
    }
  };

  const handleCompleteMilestone = async (milestoneId) => {
    setActionLoadingKey(`complete-${milestoneId}`);
    setWorkflowError(null);
    try {
      const result = await completeMilestone(milestoneId);
      if (!result?.success) {
        setWorkflowError(result?.error || 'Failed to complete milestone.');
        return;
      }
      await refreshWorkflowData(contractId);
    } finally {
      setActionLoadingKey('');
    }
  };

  const startEditMilestone = (milestone) => {
    setEditingMilestoneId(milestone.milestoneID);
    setEditMilestoneForm({
      title: milestone.title || '',
      description: milestone.description || '',
      amount: milestone.amount ?? '',
      dueDate: milestone.dueDate ? new Date(milestone.dueDate).toISOString().slice(0, 10) : '',
    });
  };

  const cancelEditMilestone = () => {
    setEditingMilestoneId('');
    setEditMilestoneForm({ title: '', description: '', amount: '', dueDate: '' });
  };

  const handleSaveMilestoneEdit = async (milestone) => {
    setActionLoadingKey(`save-${milestone.milestoneID}`);
    setWorkflowError(null);
    try {
      const result = await updateMilestone(milestone.milestoneID, {
        title: editMilestoneForm.title.trim(),
        description: editMilestoneForm.description.trim(),
        amount: Number(editMilestoneForm.amount),
        dueDate: new Date(editMilestoneForm.dueDate).toISOString(),
        status: milestone.status,
        contractID: milestone.contractID,
      });

      if (!result?.success) {
        setWorkflowError(result?.error || 'Failed to update milestone.');
        return;
      }

      cancelEditMilestone();
      await refreshWorkflowData(contractId);
    } finally {
      setActionLoadingKey('');
    }
  };

  const handleDeleteMilestone = async (milestoneId) => {
    if (!window.confirm('Delete this milestone?')) return;

    setActionLoadingKey(`delete-${milestoneId}`);
    setWorkflowError(null);
    try {
      const result = await deleteMilestone(milestoneId);
      if (!result?.success) {
        setWorkflowError(result?.error || 'Failed to delete milestone.');
        return;
      }

      if (editingMilestoneId === milestoneId) {
        cancelEditMilestone();
      }
      await refreshWorkflowData(contractId);
    } finally {
      setActionLoadingKey('');
    }
  };

  const normalizedMilestones = useMemo(() => {
    return milestones.map((milestone) => {
      const deliverables = deliverablesByMilestone[milestone.milestoneID] ?? [];
      const approvedCount = deliverables.filter((d) => Boolean(d.approved_at || d.approvedAt)).length;
      const allDone = deliverables.length > 0 && approvedCount === deliverables.length;
      const paymentReady = (milestone.status || '').toLowerCase() === 'completed' || allDone;

      return {
        ...milestone,
        deliverables,
        approvedCount,
        allDone,
        paymentReady,
      };
    });
  }, [milestones, deliverablesByMilestone]);

  const totalDeliverables = normalizedMilestones.reduce((acc, milestone) => acc + milestone.deliverables.length, 0);
  const totalApprovedDeliverables = normalizedMilestones.reduce((acc, milestone) => acc + milestone.approvedCount, 0);
  const completedMilestones = normalizedMilestones.filter((m) => m.paymentReady).length;
  const contractComplete = normalizedMilestones.length > 0 && completedMilestones === normalizedMilestones.length;

  return (
    <div className="p-8 max-w-5xl mx-auto text-slate-100">
      <SmartBackButton
        fallbackTo={contract?.projectID ? `/projects/${contract.projectID}` : '/projects'}
        label="Back to Project"
      />

      <div className="bg-white border rounded-2xl p-6 mt-4 text-slate-900">
        <h1 className="text-2xl font-bold text-slate-900">{contract?.projectTitle || 'Project Workflow'}</h1>
        <p className="text-slate-500">Contract, milestones, deliverables, and payment release flow</p>
        {contract?.contractID && (
          <p className="text-xs text-slate-400 mt-2 font-mono">Contract: {contract.contractID}</p>
        )}
      </div>

      {workflowError && (
        <div className="mt-4 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-sm">
          {workflowError}
        </div>
      )}

      {isClient && contractId && (
        <div className="mt-6 border rounded-2xl p-5 bg-white text-slate-900">
          <h2 className="font-bold text-lg mb-3 text-slate-900">Client: Define Milestones</h2>
          <form onSubmit={handleCreateMilestone} className="grid md:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Milestone title"
              value={newMilestone.title}
              onChange={(e) => setNewMilestone((prev) => ({ ...prev, title: e.target.value }))}
              className="border rounded-lg px-3 py-2 text-sm bg-white text-slate-900"
              required
            />
            <input
              type="number"
              placeholder="Amount"
              min="0"
              step="0.01"
              value={newMilestone.amount}
              onChange={(e) => setNewMilestone((prev) => ({ ...prev, amount: e.target.value }))}
              className="border rounded-lg px-3 py-2 text-sm bg-white text-slate-900"
              required
            />
            <input
              type="date"
              value={newMilestone.dueDate}
              onChange={(e) => setNewMilestone((prev) => ({ ...prev, dueDate: e.target.value }))}
              className="border rounded-lg px-3 py-2 text-sm bg-white text-slate-900"
              required
            />
            <button
              type="submit"
              disabled={actionLoadingKey === 'create-milestone'}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60"
            >
              {actionLoadingKey === 'create-milestone' ? 'Creating...' : 'Create Milestone'}
            </button>
            <textarea
              placeholder="Description / deliverable expectations"
              value={newMilestone.description}
              onChange={(e) => setNewMilestone((prev) => ({ ...prev, description: e.target.value }))}
              className="border rounded-lg px-3 py-2 text-sm md:col-span-4 bg-white text-slate-900"
              rows={2}
            />
          </form>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-teal-50 p-4 rounded-xl">
          <p className="text-sm text-teal-700">Completed Milestones</p>
          <p className="text-xl text-teal-700 font-bold">{completedMilestones}/{normalizedMilestones.length}</p>
        </div>
        <div className="bg-indigo-50 p-4 rounded-xl">
          <p className="text-sm text-indigo-600">Milestones</p>
          <p className="text-xl text-indigo-600 font-bold">{normalizedMilestones.length}</p>
        </div>

        <div className="bg-purple-50 p-4 rounded-xl">
          <p className="text-sm text-purple-600">Deliverables</p>
          <p className="text-xl text-purple-600 font-bold">{totalApprovedDeliverables}/{totalDeliverables}</p>
        </div>

        <div className="bg-amber-50 p-4 rounded-xl">
          <p className="text-sm text-amber-700">Contract Status</p>
          <p className="text-xl text-amber-700 font-bold">{contractComplete ? 'Completed' : (contract?.status || 'Active')}</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-bold text-lg mb-3">Milestones and Deliverables</h2>
        {(contractLoading || isLoadingDeliverables) && (
          <p className="text-sm text-slate-500 mb-4">Loading workflow...</p>
        )}
        {!normalizedMilestones.length && !contractLoading && (
          <div className="border border-dashed rounded-lg p-4 text-slate-500 text-sm">
            No milestones found for this contract yet.
          </div>
        )}

        <div className="space-y-3">
          {normalizedMilestones.map((milestone) => (
            <div key={milestone.milestoneID} className="border p-4 rounded-lg bg-white text-slate-900">
              <div className="flex items-center justify-between mb-1">
                <div className="font-semibold">{milestone.title}</div>
                <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                  {milestone.status}
                </span>
              </div>
              <div className="text-sm text-slate-500 mb-2">
                Due: {new Date(milestone.dueDate).toLocaleDateString()} | Payment: ${milestone.amount?.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 mb-3">
                Deliverables approved: {milestone.approvedCount}/{milestone.deliverables.length}
              </div>

              {isClient && (
                <div className="mb-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => startEditMilestone(milestone)}
                    className="px-3 py-1.5 text-xs rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700"
                  >
                    Edit Milestone
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteMilestone(milestone.milestoneID)}
                    disabled={actionLoadingKey === `delete-${milestone.milestoneID}`}
                    className="px-3 py-1.5 text-xs rounded-md bg-red-50 hover:bg-red-100 text-red-700 disabled:opacity-60"
                  >
                    {actionLoadingKey === `delete-${milestone.milestoneID}` ? 'Deleting...' : 'Delete Milestone'}
                  </button>
                </div>
              )}

              {isClient && editingMilestoneId === milestone.milestoneID && (
                <div className="mb-3 border rounded-lg p-3 bg-slate-50 text-slate-900 grid md:grid-cols-4 gap-2">
                  <input
                    type="text"
                    value={editMilestoneForm.title}
                    onChange={(e) => setEditMilestoneForm((prev) => ({ ...prev, title: e.target.value }))}
                    className="border rounded-lg px-3 py-2 text-sm bg-white text-slate-900"
                    placeholder="Title"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editMilestoneForm.amount}
                    onChange={(e) => setEditMilestoneForm((prev) => ({ ...prev, amount: e.target.value }))}
                    className="border rounded-lg px-3 py-2 text-sm bg-white text-slate-900"
                    placeholder="Amount"
                  />
                  <input
                    type="date"
                    value={editMilestoneForm.dueDate}
                    onChange={(e) => setEditMilestoneForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                    className="border rounded-lg px-3 py-2 text-sm bg-white text-slate-900"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveMilestoneEdit(milestone)}
                      disabled={actionLoadingKey === `save-${milestone.milestoneID}`}
                      className="flex-1 px-3 py-2 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60"
                    >
                      {actionLoadingKey === `save-${milestone.milestoneID}` ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditMilestone}
                      className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                  </div>
                  <textarea
                    value={editMilestoneForm.description}
                    onChange={(e) => setEditMilestoneForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="border rounded-lg px-3 py-2 text-sm md:col-span-4 bg-white text-slate-900"
                    placeholder="Description"
                    rows={2}
                  />
                </div>
              )}

              <div className="space-y-2">
                {milestone.deliverables.length === 0 ? (
                  <div className="text-sm text-slate-400 italic">
                    No deliverables submitted yet.
                  </div>
                ) : (
                  milestone.deliverables.map((deliverable) => (
                    <div
                      key={deliverable.deliverablesID}
                      className="border rounded-md p-3 text-sm bg-slate-50 text-slate-900 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-medium text-slate-700">{deliverable.fileName || deliverable.title || 'Submitted file'}</div>
                        <div className="text-xs text-slate-500">
                          {deliverable.approved_at || deliverable.approvedAt ? 'Approved by client' : 'Submitted - pending review'}
                        </div>
                      </div>
                      {(deliverable.fileUrl || deliverable.fileURL) && (
                        <a
                          href={deliverable.fileUrl || deliverable.fileURL}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:underline text-xs font-medium"
                        >
                          View file
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>

              {isFreelancer && (
                <div className="mt-3 border rounded-lg p-3 bg-indigo-50/50">
                  <p className="text-xs text-indigo-700 mb-2 font-medium">
                    Freelancer: Submit deliverable for this milestone
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="File ID (GUID)"
                      value={deliverableDrafts[milestone.milestoneID]?.fileID || ''}
                      onChange={(e) =>
                        setDeliverableDrafts((prev) => ({
                          ...prev,
                          [milestone.milestoneID]: { fileID: e.target.value },
                        }))
                      }
                      className="flex-1 border rounded-lg px-3 py-2 text-sm bg-white text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => handleSubmitDeliverable(milestone.milestoneID)}
                      disabled={actionLoadingKey === `submit-${milestone.milestoneID}`}
                      className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60"
                    >
                      {actionLoadingKey === `submit-${milestone.milestoneID}` ? 'Submitting...' : 'Submit'}
                    </button>
                  </div>
                </div>
              )}

              {isClient && milestone.deliverables.length > 0 && (
                <div className="mt-3 border rounded-lg p-3 bg-slate-50 text-slate-900">
                  <p className="text-xs text-slate-600 mb-2 font-medium">
                    Client: Review deliverables
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {milestone.deliverables.map((deliverable) => {
                      const deliverableId = deliverable.deliverablesID || deliverable.deliverableID;
                      const isApproved = Boolean(deliverable.approved_at || deliverable.approvedAt);
                      if (!deliverableId || isApproved) return null;

                      return (
                        <div key={`review-${deliverableId}`} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleApproveDeliverable(deliverableId)}
                            disabled={actionLoadingKey === `approve-${deliverableId}`}
                            className="px-3 py-1.5 text-xs rounded-md bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-60"
                          >
                            {actionLoadingKey === `approve-${deliverableId}` ? 'Approving...' : 'Approve'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectDeliverable(deliverableId)}
                            disabled={actionLoadingKey === `reject-${deliverableId}`}
                            className="px-3 py-1.5 text-xs rounded-md bg-red-100 hover:bg-red-200 text-red-700 disabled:opacity-60"
                          >
                            {actionLoadingKey === `reject-${deliverableId}` ? 'Rejecting...' : 'Reject'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-3 text-sm">
                {milestone.paymentReady ? (
                  <span className="text-teal-700 font-medium">
                    Milestone complete - payment can be released.
                  </span>
                ) : (
                  <span className="text-amber-700">
                    Waiting for all deliverables to be approved before milestone completion.
                  </span>
                )}
              </div>

              {isClient && milestone.paymentReady && (milestone.status || '').toLowerCase() !== 'completed' && (
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleCompleteMilestone(milestone.milestoneID)}
                    disabled={actionLoadingKey === `complete-${milestone.milestoneID}`}
                    className="px-4 py-2 text-sm rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold disabled:opacity-60"
                  >
                    {actionLoadingKey === `complete-${milestone.milestoneID}` ? 'Completing...' : 'Mark Milestone Complete'}
                  </button>
                  <span className="text-xs text-slate-500">
                    After completion, release payment for this phase.
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 border rounded-2xl p-6 bg-slate-50 text-slate-900">
        <h2 className="font-bold text-lg mb-2 text-slate-900">Lifecycle Progress</h2>
        <ol className="list-decimal pl-5 text-sm text-slate-600 space-y-1">
          <li>Client posts project and hires freelancer.</li>
          <li>Contract is created and milestones are defined.</li>
          <li>Freelancer submits deliverables for each milestone.</li>
          <li>Client reviews and approves deliverables.</li>
          <li>All deliverables approved - milestone complete - payment release.</li>
          <li>All milestones complete - contract complete - project closed.</li>
        </ol>
      </div>
    </div>
  );
}