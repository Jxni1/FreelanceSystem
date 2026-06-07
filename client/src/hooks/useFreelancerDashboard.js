import { useEffect, useMemo } from 'react';
import { useContracts } from './useContracts';
import { useProposals } from './useProposals';
import { useProjects } from './useProjects';
import { useMilestones } from './useMilestones';
import { useProfileContext } from '../context/ProfileContext';

const ACTIVE_STATUSES = new Set(['Active']);

function formatDue(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function useFreelancerDashboard() {
  const { profile } = useProfileContext();
  const { contracts, fetchContracts } = useContracts();
  const { proposals, fetchProposals, isLoading } = useProposals();
  const { projects, fetchProjects } = useProjects();
  const { milestones, fetchMilestonesByContract } = useMilestones();

  useEffect(() => {
    fetchContracts({ page: 1, pageSize: 100 }).catch(() => {});
    fetchProposals({ page: 1, pageSize: 1 });
    fetchProjects({ page: 1, pageSize: 3, status: 'Open' });
  }, [fetchContracts, fetchProposals, fetchProjects]);

  const liveContract = useMemo(
    () => contracts.items.find((c) => ACTIVE_STATUSES.has(c.status)) || null,
    [contracts],
  );

  useEffect(() => {
    if (liveContract?.contractID) fetchMilestonesByContract(liveContract.contractID).catch(() => {});
  }, [liveContract, fetchMilestonesByContract]);

  return useMemo(() => {
    const activeContracts = contracts.items.filter((c) => ACTIVE_STATUSES.has(c.status));
    const completed = contracts.items.filter((c) => c.status === 'Completed').length;
    const activeValue = activeContracts.reduce((sum, c) => sum + (Number(c.agreedPrice) || 0), 0);

    let activeContract = null;
    if (liveContract) {
      const ms = milestones.filter((m) => String(m.contractID) === String(liveContract.contractID));
      const total = Number(liveContract.agreedPrice) || 0;
      const earned = ms.filter((m) => m.status === 'Approved').reduce((s, m) => s + (Number(m.amount) || 0), 0);
      const approved = ms.filter((m) => m.status === 'Approved').length;
      activeContract = {
        id: liveContract.contractID,
        title: liveContract.projectTitle || 'Active contract',
        milestoneCurrent: approved,
        milestoneTotal: ms.length,
        due: formatDue(liveContract.end_Date),
        earned,
        total,
      };
    }

    const latestProjects = (projects.items ?? []).map((p, i) => ({
      id: p.projectID ?? `lp-${i}`,
      title: p.title || 'Untitled project',
      company: p.clientName || '',
      rate: p.budget ? `$${Number(p.budget).toLocaleString()}` : '',
      tags: (p.skills ?? []).slice(0, 3),
    }));

    const fp = profile?.freelancerProfile;
    const checklist = [
      { label: 'Add a profile photo', done: Boolean(profile?.profilePhoto) },
      { label: 'Set your hourly rate', done: Number(fp?.hourlyRate) > 0 },
      { label: 'Add your experience level', done: Boolean(fp?.experienceLevel) },
    ];
    const doneCount = checklist.filter((c) => c.done).length;
    const profileStrength = {
      percent: Math.round((doneCount / checklist.length) * 100),
      checklist,
    };

    const firstName = profile?.name?.split(' ')[0] || profile?.username || 'there';

    return {
      isLoading,
      firstName,
      stats: {
        activeContracts: activeContracts.length,
        completed,
        proposalsOut: proposals.totalCount || 0,
        activeValue,
      },
      latestProjects,
      activeContract,
      profileStrength,
    };
  }, [contracts, proposals, projects, milestones, liveContract, profile, isLoading]);
}

export default useFreelancerDashboard;
