import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProtectedViews } from '../../hooks/useProtectedViews';
import { SmartBackButton } from '../../components/SmartBackButton';

export default function ProjectViewStatsPage() {
  const { id } = useParams();
  const { projectStats, isLoading, error, fetchProjectStats } = useProtectedViews();

  useEffect(() => {
    if (id) fetchProjectStats(id);
  }, [id, fetchProjectStats]);

  if (isLoading)
    return <div className="p-8 text-center text-slate-500">Loading analytics...</div>;

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6 text-slate-900">
      <SmartBackButton fallbackTo={`/projects/${id}`} label="Back to Project" />

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-teal-500 to-emerald-400" />
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
          <h1 className="text-2xl font-bold text-slate-900">Project Analytics</h1>
          {projectStats && (
            <p className="text-sm text-slate-500 mt-1">{projectStats.projectTitle}</p>
          )}
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
          )}

          {projectStats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
                <p className="text-4xl font-bold text-teal-600">{projectStats.totalViews}</p>
                <p className="text-sm font-medium text-slate-600 mt-2">Total Views</p>
                <p className="text-xs text-slate-400 mt-1">All time views on this project</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
                <p className="text-4xl font-bold text-teal-600">{projectStats.uniqueViewers}</p>
                <p className="text-sm font-medium text-slate-600 mt-2">Unique Viewers</p>
                <p className="text-xs text-slate-400 mt-1">Distinct freelancers who viewed</p>
              </div>
            </div>
          )}

          {!projectStats && !error && (
            <div className="text-center py-12 text-slate-400">No analytics data available.</div>
          )}
        </div>
      </div>
    </div>
  );
}