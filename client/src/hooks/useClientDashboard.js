import { useEffect, useMemo } from 'react';
import { useProjects } from './useProjects';
import { useContracts } from './useContracts';
import { useFreelancers } from './useFreelancers';
import { useProposals } from './useProposals';
import { useProfileContext } from '../context/ProfileContext';

const ACTIVE_STATUSES = new Set(['Active']);

function formatBudget(project) {
  const amount = project?.budget ?? project?.budgetAmount;
  if (typeof amount === 'number' && amount > 0) return `$${amount.toLocaleString()}`;
  return '';
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
    const activeContracts = contracts.items.filter((c) => ACTIVE_STATUSES.has(c.status));
    const activeValue = activeContracts.reduce((sum, c) => sum + (Number(c.agreedPrice) || 0), 0);

    const jobPosts = projects.items
      .map((project, index) => ({
        id: project.projectID ?? project.projectId ?? `jp-${index}`,
        title: project.title ?? '',
        status: project.status ?? 'Open',
        budget: formatBudget(project),
        tags: (project.skillNames ?? project.skills ?? []).slice(0, 3),
      }))
      .filter((post) => post.title);

    const talent = (freelancers.items ?? []).map((f, index) => ({
      id: f.freelancerID ?? `t-${index}`,
      name: f.name ?? f.username ?? 'Freelancer',
      role: f.experienceLevel || f.skills?.[0] || 'Freelancer',
      rate: f.hourlyRate ? `$${f.hourlyRate}/hr` : '',
      rating: f.averageRating ?? 0,
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
        jobPosts: projects.totalCount || 0,
        proposals: proposals.totalCount || 0,
        activeHires: activeContracts.length,
        activeValue,
      },
      jobPosts,
      talent,
      contractsSummary: { count: activeContracts.length, value: activeValue },
    };
  }, [projects, contracts, freelancers, proposals, profile, isLoading]);
}

export default useClientDashboard;
