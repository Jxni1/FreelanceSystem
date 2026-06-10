import { useEffect, useMemo } from 'react';
import { useContracts } from './useContracts';
import { useProposals } from './useProposals';
import { useProfileContext } from '../context/ProfileContext';
import { DEMO_FREELANCER } from '../data/dashboardDemoData';

const ACTIVE_STATUSES = new Set(['Active', 'InProgress', 'In Progress', 'Ongoing']);
const PENDING_PROPOSAL_STATUSES = new Set(['Pending', 'UnderReview', 'Under Review', 'Submitted']);
const ACCEPTED_PROPOSAL_STATUSES = new Set(['Accepted', 'Approved']);
const REJECTED_PROPOSAL_STATUSES = new Set(['Rejected', 'Declined']);

function formatDue(value) {
  if (!value) return DEMO_FREELANCER.activeContract.due;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return DEMO_FREELANCER.activeContract.due;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function getProposalStatusTone(status) {
  if (ACCEPTED_PROPOSAL_STATUSES.has(status)) return 'success';
  if (PENDING_PROPOSAL_STATUSES.has(status)) return 'amber';
  if (REJECTED_PROPOSAL_STATUSES.has(status)) return 'danger';
  return 'slate';
}

function normalizeId(value) {
  return value ? String(value).toLowerCase() : null;
}

function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function formatMoneyCompact(value) {
  const amount = toNumber(value, 0);
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(amount >= 10000 ? 0 : 1)}k`;
  }
  return `$${amount.toFixed(0)}`;
}

export function useFreelancerDashboard() {
  const { profile } = useProfileContext();
  const { contracts, fetchContracts } = useContracts();
  const { proposals, fetchProposals, isLoading } = useProposals();

  useEffect(() => {
    fetchContracts({ page: 1, pageSize: 100 }).catch(() => {});
    fetchProposals({ page: 1, pageSize: 100 }).catch(() => {});
  }, [fetchContracts, fetchProposals]);

  return useMemo(() => {
    const freelancerProfileId = normalizeId(
      profile?.freelancerId ||
      profile?.freelancerID ||
      profile?.profileId ||
      profile?.id
    );

    const freelancerUserId = normalizeId(
      profile?.userId ||
      profile?.userID
    );

    const rawContractItems = Array.isArray(contracts?.items) ? contracts.items : [];
    const rawProposalItems = Array.isArray(proposals?.items) ? proposals.items : [];

    const contractItems = rawContractItems.filter((contract) => {
      const contractFreelancerProfileId = normalizeId(
        contract?.freelancerId ||
        contract?.freelancerID
      );

      const contractFreelancerUserId = normalizeId(
        contract?.freelancerUserId ||
        contract?.freelancer?.userId ||
        contract?.freelancer?.userID
      );

      if (freelancerProfileId && contractFreelancerProfileId) {
        return contractFreelancerProfileId === freelancerProfileId;
      }

      if (freelancerUserId && contractFreelancerUserId) {
        return contractFreelancerUserId === freelancerUserId;
      }

      return true;
    });

    const proposalItems = rawProposalItems.filter((proposal) => {
      const proposalFreelancerProfileId = normalizeId(
        proposal?.freelancerId ||
        proposal?.freelancerID
      );

      const proposalFreelancerUserId = normalizeId(
        proposal?.freelancerUserId ||
        proposal?.freelancer?.userId ||
        proposal?.freelancer?.userID
      );

      if (freelancerProfileId && proposalFreelancerProfileId) {
        return proposalFreelancerProfileId === freelancerProfileId;
      }

      if (freelancerUserId && proposalFreelancerUserId) {
        return proposalFreelancerUserId === freelancerUserId;
      }

      return true;
    });

    const activeContracts = contractItems.filter((c) => ACTIVE_STATUSES.has(c.status));
    const liveContract = activeContracts[0] || null;

    const pendingProposals = proposalItems.filter((p) =>
      PENDING_PROPOSAL_STATUSES.has(p.status)
    ).length;

    const acceptedProposals = proposalItems.filter((p) =>
      ACCEPTED_PROPOSAL_STATUSES.has(p.status)
    ).length;

    const rejectedProposals = proposalItems.filter((p) =>
      REJECTED_PROPOSAL_STATUSES.has(p.status)
    ).length;

    const proposalTotal = proposalItems.length;

    const proposalSuccessRate =
      proposalTotal > 0 ? Math.round((acceptedProposals / proposalTotal) * 100) : 0;

    const monthlyEarningsRaw = activeContracts.reduce((sum, contract) => {
      const paid =
        contract?.paidAmount ??
        contract?.amountPaid ??
        contract?.earned ??
        0;

      return sum + toNumber(paid, 0);
    }, 0);

    const monthlyEarnings =
      monthlyEarningsRaw > 0
        ? monthlyEarningsRaw
        : toNumber(DEMO_FREELANCER?.stats?.earnings?.value?.replace?.(/[$,kK]/g, ''), 0) * 1000 ||
          12400;

    let activeContract;
    if (liveContract) {
      const total = toNumber(
        liveContract.agreedPrice ??
        liveContract.totalAmount ??
        liveContract.total ??
        DEMO_FREELANCER.activeContract.total,
        DEMO_FREELANCER.activeContract.total
      );

      const earned = toNumber(
        liveContract.paidAmount ??
        liveContract.amountPaid ??
        liveContract.earned ??
        Math.min(DEMO_FREELANCER.activeContract.earned, total),
        Math.min(DEMO_FREELANCER.activeContract.earned, total)
      );

      activeContract = {
        id: liveContract.contractID || liveContract.contractId || liveContract.id,
        title: liveContract.projectTitle || liveContract.title || DEMO_FREELANCER.activeContract.title,
        milestoneCurrent:
          liveContract.milestoneCurrent || DEMO_FREELANCER.activeContract.milestoneCurrent,
        milestoneTotal:
          liveContract.milestoneTotal || DEMO_FREELANCER.activeContract.milestoneTotal,
        due: formatDue(liveContract.end_Date || liveContract.endDate),
        earned,
        total,
        clientName:
          liveContract.clientName ||
          liveContract.client?.name ||
          'Client',
        status: liveContract.status || 'Active',
      };
    } else {
      activeContract = {
        ...DEMO_FREELANCER.activeContract,
        clientName: '—',
        status: 'No active contract',
      };
    }

    const recentProposals = proposalItems
      .slice()
      .sort((a, b) => {
        const aDate = new Date(a.createdAt || a.created_at || a.submittedAt || 0).getTime();
        const bDate = new Date(b.createdAt || b.created_at || b.submittedAt || 0).getTime();
        return bDate - aDate;
      })
      .slice(0, 5)
      .map((proposal, index) => ({
        id: proposal.proposalID || proposal.proposalId || proposal.id || index,
        title: proposal.projectTitle || proposal.title || `Proposal ${index + 1}`,
        clientName: proposal.clientName || proposal.client?.name || 'Unknown client',
        status: proposal.status || 'Pending',
        budget:
          proposal.proposedBudget ??
          proposal.bidAmount ??
          proposal.budget ??
          proposal.projectBudget ??
          null,
        submittedAt: proposal.createdAt || proposal.created_at || proposal.submittedAt || null,
        tone: getProposalStatusTone(proposal.status),
      }));

    const firstName = profile?.name?.split(' ')[0] || profile?.username || 'there';

    return {
      isLoading,
      firstName,
      stats: {
        earnings: {
          label: 'Earnings this month',
          value: formatMoneyCompact(monthlyEarnings),
          subtext:
            activeContracts.length > 0
              ? `${activeContracts.length} active contract${activeContracts.length > 1 ? 's' : ''}`
              : 'No active contracts yet',
          delta: DEMO_FREELANCER.stats.earnings.delta,
          deltaDir: DEMO_FREELANCER.stats.earnings.deltaDir,
        },
        activeContracts: {
          label: 'Active contracts',
          value: activeContracts.length,
          subtext:
            activeContracts.length > 0
              ? `${activeContracts.length} in progress`
              : 'No work in progress',
          delta:
            activeContracts.length > 0
              ? `${activeContracts.length} in progress`
              : 'Start with a new job',
          deltaDir: activeContracts.length > 0 ? 'up' : 'flat',
        },
        proposalsOut: {
          label: 'Submitted proposals',
          value: proposalTotal,
          subtext:
            pendingProposals > 0
              ? `${pendingProposals} awaiting review`
              : 'No pending proposals',
          delta: `${pendingProposals} pending`,
          deltaDir: pendingProposals > 0 ? 'up' : 'flat',
        },
        proposalSuccess: {
          label: 'Proposal win rate',
          value: `${proposalSuccessRate}%`,
          subtext:
            proposalTotal > 0
              ? `${acceptedProposals} accepted out of ${proposalTotal}`
              : 'No proposal history yet',
          delta: `${acceptedProposals} accepted`,
          deltaDir: acceptedProposals > 0 ? 'up' : 'flat',
        },
        jobSuccess: {
          ...DEMO_FREELANCER.stats.jobSuccess,
          label: 'Job success',
          subtext: 'Based on completed work',
        },
      },
      pipeline: {
        pending: pendingProposals,
        accepted: acceptedProposals,
        rejected: rejectedProposals,
        total: proposalTotal,
      },
      activeContract,
      recentProposals,
      profileStrength: DEMO_FREELANCER.profileStrength,
      quickActions: [
        { label: 'Find work', to: '/discover', variant: 'accent' },
        { label: 'My proposals', to: '/my-work', variant: 'soft' },
        { label: 'My contracts', to: '/contracts', variant: 'soft' },
        { label: 'Edit profile', to: '/profile', variant: 'soft' },
      ],
    };
  }, [contracts, proposals, profile, isLoading]);
}

export default useFreelancerDashboard;