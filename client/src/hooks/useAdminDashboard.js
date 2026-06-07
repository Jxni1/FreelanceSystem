import { useEffect, useMemo } from 'react';
import { useUsers } from './useUsers';
import { useProjects } from './useProjects';
import { useReports } from './useReports';
import { DEMO_ADMIN } from '../data/dashboardDemoData';

export function useAdminDashboard() {
  const { users, fetchUsers } = useUsers();
  const { projects, fetchProjects } = useProjects();
  const { reports, fetchReports, isLoading } = useReports();

  useEffect(() => {
    fetchUsers({ page: 1, pageSize: 1 });
    fetchProjects({ page: 1, pageSize: 1 });
    fetchReports({ page: 1, pageSize: 6 }).catch(() => {});
  }, [fetchUsers, fetchProjects, fetchReports]);

  return useMemo(() => {
    const activeUsers = users.totalCount
      ? users.totalCount.toLocaleString()
      : DEMO_ADMIN.stats.activeUsers.value;
    const jobsPosted = projects.totalCount
      ? projects.totalCount.toLocaleString()
      : DEMO_ADMIN.stats.jobsPosted.value;

    return {
      isLoading,
      flaggedCount: reports.totalCount || DEMO_ADMIN.moderation.length,
      stats: {
        grossVolume: { ...DEMO_ADMIN.stats.grossVolume },
        activeUsers: {
          value: activeUsers,
          delta: DEMO_ADMIN.stats.activeUsers.delta,
          deltaDir: DEMO_ADMIN.stats.activeUsers.deltaDir,
        },
        openDisputes: { ...DEMO_ADMIN.stats.openDisputes },
        jobsPosted: {
          value: jobsPosted,
          delta: DEMO_ADMIN.stats.jobsPosted.delta,
          deltaDir: DEMO_ADMIN.stats.jobsPosted.deltaDir,
        },
      },
      moderation: DEMO_ADMIN.moderation,
      health: DEMO_ADMIN.health,
      escalated: DEMO_ADMIN.escalated,
    };
  }, [users, projects, reports, isLoading]);
}

export default useAdminDashboard;
