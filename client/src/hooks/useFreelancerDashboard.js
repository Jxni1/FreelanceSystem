import { useEffect, useMemo } from 'react';
import { useContracts } from './useContracts';
import { useProposals } from './useProposals';
import { useProfileContext } from '../context/ProfileContext';
import { DEMO_FREELANCER } from '../data/dashboardDemoData';

const ACTIVE_STATUSES = new Set(['Active', 'InProgress', 'In Progress', 'Ongoing']);

function formatDue(value) {
  if (!value) return DEMO_FREELANCER.activeContract.due;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return DEMO_FREELANCER.activeContract.due;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function useFreelancerDashboard() {
  const { profile } = useProfileContext();
  const { contracts, fetchContracts } = useContracts();
  const { proposals, fetchProposals, isLoading } = useProposals();

  useEffect(() => {
    fetchContracts({ page: 1, pageSize: 100 }).catch(() => {});
    fetchProposals({ page: 1, pageSize: 1 });
  }, [fetchContracts, fetchProposals]);

  return useMemo(() => {
    const activeContracts = contracts.items.filter((c) => ACTIVE_STATUSES.has(c.status));
    const liveContract = activeContracts[0];

    let activeContract;
    if (liveContract) {
      const total = liveContract.agreedPrice || DEMO_FREELANCER.activeContract.total;
      activeContract = {
        title: liveContract.projectTitle || DEMO_FREELANCER.activeContract.title,
        milestoneCurrent: DEMO_FREELANCER.activeContract.milestoneCurrent,
        milestoneTotal: DEMO_FREELANCER.activeContract.milestoneTotal,
        due: formatDue(liveContract.end_Date),
        earned: Math.min(DEMO_FREELANCER.activeContract.earned, total),
        total,
      };
    } else {
      activeContract = DEMO_FREELANCER.activeContract;
    }

    const firstName = profile?.name?.split(' ')[0] || profile?.username || 'there';

    return {
      isLoading,
      firstName,
      stats: {
        earnings: { ...DEMO_FREELANCER.stats.earnings },
        activeContracts: {
          value: activeContracts.length || DEMO_FREELANCER.stats.activeContracts.value,
          delta: DEMO_FREELANCER.stats.activeContracts.delta,
          deltaDir: DEMO_FREELANCER.stats.activeContracts.deltaDir,
        },
        proposalsOut: {
          value: proposals.totalCount || DEMO_FREELANCER.stats.proposalsOut.value,
          delta: DEMO_FREELANCER.stats.proposalsOut.delta,
          deltaDir: DEMO_FREELANCER.stats.proposalsOut.deltaDir,
        },
        profileViews: { ...DEMO_FREELANCER.stats.profileViews },
        jobSuccess: { ...DEMO_FREELANCER.stats.jobSuccess },
      },
      matches: DEMO_FREELANCER.matches,
      activeContract,
      profileStrength: DEMO_FREELANCER.profileStrength,
    };
  }, [contracts, proposals, profile, isLoading]);
}

export default useFreelancerDashboard;
