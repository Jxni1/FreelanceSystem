import { useEffect, useMemo } from 'react';
import { useProjects } from './useProjects';
import { useContracts } from './useContracts';
import { useFreelancers } from './useFreelancers';
import { useProposals } from './useProposals';
import { useProfileContext } from '../context/ProfileContext';
import { DEMO_CLIENT } from '../data/dashboardDemoData';

const ACTIVE_CONTRACT_STATUSES = new Set([
  'Active',
  'InProgress',
  'In Progress',
  'Ongoing',
]);

const OPEN_PROJECT_STATUSES = new Set([
  'Open',
  'Receiving',
  'Shortlisting',
  'Interviewing',
]);

const COMPLETED_CONTRACT_STATUSES = new Set([
  'Completed',
  'Closed',
]);

function formatBudget(project) {
  const amount = project?.budget ?? project?.budgetAmount;
  if (typeof amount === 'number' && amount > 0) {
    return `$${amount.toLocaleString()}`;
  }
  return project?.budgetLabel ?? '';
}

function getDateValue(item) {
  return new Date(
    item?.updatedAt ||
      item?.updated_at ||
      item?.createdAt ||
      item?.created_at ||
      0
  ).getTime();
}

export function useClientDashboard() {
  const { profile } = useProfileContext();

  const {
    projects,
    myProjects,
    fetchProjects,
    fetchMyProjects,
    isLoading: projectsLoading,
    isMyProjectsLoading,
  } = useProjects();

  const { contracts, fetchContracts, isLoading: contractsLoading } = useContracts();
  const { freelancers, fetchFreelancers, isLoading: freelancersLoading } = useFreelancers();
  const { proposals, fetchProposals, isLoading: proposalsLoading } = useProposals();

  useEffect(() => {
    fetchProjects({ page: 1, pageSize: 8 }).catch(() => {});
    fetchMyProjects({ page: 1, pageSize: 8 }).catch(() => {});
    fetchContracts({ page: 1, pageSize: 100 }).catch(() => {});
    fetchFreelancers({ page: 1, pageSize: 4 }).catch(() => {});
    fetchProposals({ page: 1, pageSize: 8 }).catch(() => {});
  }, [
    fetchProjects,
    fetchMyProjects,
    fetchContracts,
    fetchFreelancers,
    fetchProposals,
  ]);

  return useMemo(() => {
    const projectItems = projects?.items ?? [];
    const myProjectItems = myProjects?.items ?? [];
    const contractItems = contracts?.items ?? [];
    const freelancerItems = freelancers?.items ?? [];

    const openProjects = myProjectItems.filter((p) =>
      OPEN_PROJECT_STATUSES.has(p.status ?? 'Open')
    );

    const activeContracts = contractItems.filter((c) =>
      ACTIVE_CONTRACT_STATUSES.has(c.status)
    );

    const completedContracts = contractItems.filter((c) =>
      COMPLETED_CONTRACT_STATUSES.has(c.status)
    );

    const recentProjects = [...projectItems]
      .sort((a, b) => getDateValue(b) - getDateValue(a))
      .slice(0, 5)
      .map((project, index) => ({
        id: project.projectID ?? project.projectId ?? project.id ?? `jp-${index}`,
        title: project.title ?? project.name ?? '',
        status: project.status ?? 'Open',
        budget: formatBudget(project),
        tags: (project.skillNames ?? project.skills ?? []).slice(0, 3),
      }))
      .filter((post) => post.title);

    const myProjectsPreview = [...myProjectItems]
      .sort((a, b) => getDateValue(b) - getDateValue(a))
      .slice(0, 5)
      .map((project, index) => ({
        id: project.projectID ?? project.projectId ?? project.id ?? `mp-${index}`,
        title: project.title ?? project.name ?? '',
        status: project.status ?? 'Open',
        budget: formatBudget(project),
        tags: (project.skillNames ?? project.skills ?? []).slice(0, 3),
      }))
      .filter((post) => post.title);

    const activeHiresList = [...activeContracts]
      .sort((a, b) => getDateValue(b) - getDateValue(a))
      .slice(0, 4)
      .map((contract, index) => ({
        id: contract.contractID ?? contract.contractId ?? contract.id ?? `ct-${index}`,
        title: contract.projectTitle ?? contract.title ?? `Contract ${index + 1}`,
        status: contract.status ?? 'Active',
        freelancerName:
          contract.freelancerName ??
          contract.freelancerUsername ??
          'Assigned freelancer',
        amount:
          typeof contract.amount === 'number'
            ? `$${contract.amount.toLocaleString()}`
            : contract.amountLabel ?? '',
      }));

    const realTalent = freelancerItems.map((freelancer, index) => ({
      id: freelancer.freelancerID ?? freelancer.id ?? `t-${index}`,
      name: freelancer.name ?? freelancer.username ?? 'Freelancer',
      role: freelancer.experienceLevel || freelancer.skills?.[0] || 'Freelancer',
      rate: freelancer.hourlyRate ? `$${freelancer.hourlyRate}/hr` : '',
      rating: freelancer.averageRating ?? 0,
      verified: false,
    }));

    const proposalCount = proposals?.totalCount ?? 0;

    const needsAttention = [
      proposalCount > 0
        ? {
            id: 'pending-proposals',
            tone: 'sky',
            title: `${proposalCount} proposal${proposalCount > 1 ? 's' : ''} waiting`,
            description: 'Review incoming proposals and shortlist the best freelancers.',
            to: '/proposals',
            cta: 'Review proposals',
          }
        : null,
      openProjects.length > 0
        ? {
            id: 'open-projects',
            tone: 'emerald',
            title: `${openProjects.length} open job post${openProjects.length > 1 ? 's' : ''}`,
            description: 'Keep your hiring pipeline moving by checking candidate activity.',
            to: '/projects/my-projects',
            cta: 'View my projects',
          }
        : null,
      activeContracts.length > 0
        ? {
            id: 'active-contracts',
            tone: 'violet',
            title: `${activeContracts.length} active contract${activeContracts.length > 1 ? 's' : ''}`,
            description: 'Monitor current hires, progress, and ongoing delivery work.',
            to: '/contracts',
            cta: 'Open contracts',
          }
        : null,
    ].filter(Boolean);

    const recentActivity = [
      ...myProjectsPreview.slice(0, 2).map((project) => ({
        id: `project-${project.id}`,
        tone: 'brand',
        label: 'My project updated',
        text: `${project.title} is currently ${project.status}.`,
        to: '/projects/my-projects',
      })),
      ...activeHiresList.slice(0, 2).map((contract) => ({
        id: `contract-${contract.id}`,
        tone: 'violet',
        label: 'Contract active',
        text: `${contract.freelancerName} is assigned to ${contract.title}.`,
        to: '/contracts',
      })),
      ...(proposalCount > 0
        ? [
            {
              id: 'activity-proposals',
              tone: 'sky',
              label: 'Proposal activity',
              text: `You have ${proposalCount} proposal${proposalCount > 1 ? 's' : ''} ready to review.`,
              to: '/proposals',
            },
          ]
        : []),
    ].slice(0, 5);

    const firstName = profile?.name?.split(' ')[0] || profile?.username || 'there';

    const dateLabel = new Date().toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    const isLoading =
      projectsLoading ||
      isMyProjectsLoading ||
      contractsLoading ||
      freelancersLoading ||
      proposalsLoading;

    return {
      isLoading,
      firstName,
      dateLabel,
      stats: {
        jobPosts: {
          value: myProjectItems.length || 0,
          delta: DEMO_CLIENT.stats.jobPosts.delta,
          deltaDir: DEMO_CLIENT.stats.jobPosts.deltaDir,
        },
        proposals: {
          value: proposalCount,
          delta: DEMO_CLIENT.stats.proposals.delta,
          deltaDir: DEMO_CLIENT.stats.proposals.deltaDir,
        },
        activeContracts: {
          value: activeContracts.length || 0,
          delta: '+0',
          deltaDir: 'up',
        },
        completedContracts: {
          value: completedContracts.length || 0,
          delta: '+0',
          deltaDir: 'up',
        },
      },
      needsAttention,
      recentProjects: recentProjects.length ? recentProjects : DEMO_CLIENT.jobPosts,
      myProjects: myProjectsPreview,
      activeHires: activeHiresList,
      recentActivity,
      talent: realTalent.length ? realTalent : DEMO_CLIENT.talent,
      escrow: DEMO_CLIENT.escrow,
    };
  }, [
    projects,
    myProjects,
    contracts,
    freelancers,
    proposals,
    profile,
    projectsLoading,
    isMyProjectsLoading,
    contractsLoading,
    freelancersLoading,
    proposalsLoading,
  ]);
}

export default useClientDashboard;