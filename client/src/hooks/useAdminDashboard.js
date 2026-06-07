import { useEffect, useMemo } from 'react';
import { useUsers } from './useUsers';
import { useProjects } from './useProjects';
import { useReports } from './useReports';
import { useContracts } from './useContracts';

function timeAgo(value) {
  if (!value) return '';
  const diff = Date.now() - new Date(value).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  return new Date(value).toLocaleDateString();
}

export function useAdminDashboard() {
  const { users, fetchUsers } = useUsers();
  const { projects, fetchProjects } = useProjects();
  const { reports, fetchReports, isLoading } = useReports();
  const { contracts, fetchContracts } = useContracts();

  useEffect(() => {
    fetchUsers({ page: 1, pageSize: 1 });
    fetchProjects({ page: 1, pageSize: 1 });
    fetchReports({ page: 1, pageSize: 6 }).catch(() => {});
    fetchContracts({ page: 1, pageSize: 1 }).catch(() => {});
  }, [fetchUsers, fetchProjects, fetchReports, fetchContracts]);

  return useMemo(() => {
    const moderation = (reports.items ?? []).map((r, i) => ({
      id: r.reportsID ?? `mq-${i}`,
      type: r.entity || 'Item',
      reason: r.reason || '—',
      reportedBy: r.created_by || '—',
      status: r.status || 'Open',
      date: timeAgo(r.created_at),
    }));

    return {
      isLoading,
      flaggedCount: reports.totalCount || moderation.length,
      stats: {
        users: users.totalCount || 0,
        jobsPosted: projects.totalCount || 0,
        contracts: contracts.totalCount || 0,
        flagged: reports.totalCount || 0,
      },
      moderation,
    };
  }, [users, projects, reports, contracts, isLoading]);
}

export default useAdminDashboard;
