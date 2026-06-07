import { useEffect, useMemo } from 'react';
import { useProjects } from './useProjects';
import { useContracts } from './useContracts';
import { useFreelancers } from './useFreelancers';
import { useProposals } from './useProposals';
import { useProfileContext } from '../context/ProfileContext';
import { DEMO_CLIENT } from '../data/dashboardDemoData';

const ACTIVE_STATUSES = new Set(['Active', 'InProgress', 'In Progress', 'Ongoing']);

function formatBudget(project) {
  const amount = project?.budget ?? project?.budgetAmount;
  if (typeof amount === 'number' && amount > 0) return `$${amount.toLocaleString()}`;
  return project?.budgetLabel ?? '';
}

export function useClientDashboard() {
  const { profile } = useProfileContext();
  const { projects, fetchProjects, isLoading } = useProjects();
  const { contracts, fetchContracts } = useContracts();
  const { freelancers, fetchFreelancers } = useFreelancers();
  const { proposals, fetchProposals } = useProposals();

  useEffect(() => {
    fetchProjects({ page: 1, pageSize: 5 });
    fetchContracts({ page: 1, pageSize: 100 }).catch(() => {});
    fetchFreelancers({ page: 1, pageSize: 3 });
    fetchProposals({ page: 1, pageSize: 1 });
  }, [fetchProjects, fetchContracts, fetchFreelancers, fetchProposals]);

  return useMemo(() => {
    const activeHires = contracts.items.filter((c) => ACTIVE_STATUSES.has(c.status)).length;

    const realJobPosts = projects.items
      .map((project, index) => ({
        id: project.projectID ?? project.projectId ?? project.id ?? `jp-${index}`,
        title: project.title ?? project.name ?? '',
        status: project.status ?? 'Open',
        budget: formatBudget(project),
        proposals: DEMO_CLIENT.jobPosts[index % DEMO_CLIENT.jobPosts.length].proposals,
        tags: (project.skillNames ?? project.skills ?? []).slice(0, 3),
      }))
      .filter((post) => post.title);

    const realTalent = (freelancers.items ?? []).map((freelancer, index) => ({
      id: freelancer.freelancerID ?? freelancer.id ?? `t-${index}`,
      name: freelancer.name ?? freelancer.username ?? 'Freelancer',
      role: freelancer.experienceLevel || freelancer.skills?.[0] || 'Freelancer',
      rate: freelancer.hourlyRate ? `$${freelancer.hourlyRate}/hr` : '',
      rating: freelancer.averageRating ?? 0,
      verified: false,
    }));

    const firstName = profile?.name?.split(' ')[0] || profile?.username || 'there';
    const dateLabel = new Date().toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    return {
      isLoading,
      firstName,
      dateLabel,
      stats: {
        jobPosts: {
          value: projects.totalCount || DEMO_CLIENT.stats.jobPosts.value,
          delta: DEMO_CLIENT.stats.jobPosts.delta,
          deltaDir: DEMO_CLIENT.stats.jobPosts.deltaDir,
        },
        proposals: {
          value: proposals.totalCount || DEMO_CLIENT.stats.proposals.value,
          delta: DEMO_CLIENT.stats.proposals.delta,
          deltaDir: DEMO_CLIENT.stats.proposals.deltaDir,
        },
        escrow: { ...DEMO_CLIENT.stats.escrow },
        hires: {
          value: activeHires || DEMO_CLIENT.stats.hires.value,
          delta: DEMO_CLIENT.stats.hires.delta,
          deltaDir: DEMO_CLIENT.stats.hires.deltaDir,
        },
      },
      jobPosts: realJobPosts.length ? realJobPosts : DEMO_CLIENT.jobPosts,
      talent: realTalent.length ? realTalent : DEMO_CLIENT.talent,
      escrow: DEMO_CLIENT.escrow,
    };
  }, [projects, contracts, freelancers, proposals, profile, isLoading]);
}

export default useClientDashboard;
