import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProjects } from '../../hooks/useProjects';
import { useContracts } from '../../hooks/useContracts';
import { SmartBackButton } from '../../components/SmartBackButton';

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { project, isLoading, error, fetchProjectById, deleteProject } = useProjects();
  const { contracts, fetchContracts, isLoading: contractLoading } = useContracts();

  useEffect(() => {
    let isMounted = true;

    const loadProjectContext = async () => {
      if (!id) return;
      await fetchProjectById(id);

      try {
        await fetchContracts({ projectID: id, page: 1, pageSize: 10 });
      } catch {
        if (!isMounted) return;
      }
    };

    if (id) loadProjectContext();

    return () => {
      isMounted = false;
    };
  }, [id, fetchProjectById, fetchContracts]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      await deleteProject(id);
      navigate('/projects');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-400">
        <div className="inline-block w-10 h-10 border-4 border-slate-700 border-t-teal-500 rounded-full animate-spin mb-4" />
        <p>Loading project details...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-4xl mx-auto rounded-2xl border border-rose-800 bg-rose-950/30 p-6 text-rose-200">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{typeof error === 'string' ? error : 'Project not found.'}</p>
        <div className="mt-6">
          <Link to="/projects" className="text-rose-300 font-semibold hover:text-rose-200">
            &larr; Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const milestoneCount = project.milestones?.length ?? 0;
  const deliverableCount = project.deliverables?.length ?? 0;
  const linkedContract =
    contracts?.items?.find(
      (contract) => (contract.projectID || contract.projectId) === project.projectID
    ) ??
    contracts?.items?.[0] ??
    null;

  const statusClasses =
    project.status === 'Open'
      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
      : project.status === 'InProgress'
      ? 'bg-teal-500/10 text-teal-300 border-teal-500/30'
      : project.status === 'Completed'
      ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
      : 'bg-slate-800 text-slate-300 border-slate-700';

  return (
    <div className="max-w-5xl mx-auto text-slate-100 space-y-6">
      <SmartBackButton fallbackTo="/projects" label="Back to Projects" />

      <div className="rounded-2xl border border-slate-800 bg-slate-950 shadow-xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-teal-500 to-emerald-400" />

        {/* Header */}
        <div className="p-6 md:p-8 border-b border-slate-800 bg-slate-900/60">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h1 className="text-3xl font-bold text-slate-100 tracking-tight">
                  {project.title}
                </h1>

                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusClasses}`}>
                  {project.status || 'Open'}
                </span>

                <span className="px-3 py-1 text-xs font-semibold rounded-full border bg-purple-500/10 text-purple-300 border-purple-500/30">
                  {project.visibility || 'Private'}
                </span>
              </div>

              <p className="text-sm text-slate-400">
                Project ID:{' '}
                <span className="font-mono text-slate-300">{project.projectID}</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <Link
                to={`/projects/${project.projectID}/edit`}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors"
              >
                Edit Project
              </Link>
              <button
                onClick={handleDelete}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-rose-700 bg-rose-950/20 text-rose-300 hover:bg-rose-950/40 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-400 mb-3">
                Description
              </h3>
              <div className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                {project.description || 'No description provided.'}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-400 mb-3">
                Category
              </h3>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200">
                <span>{project.categoryName || 'Uncategorized'}</span>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                    ⚡
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-100 mb-1">
                      Project Workflow
                    </h3>
                    <p className="text-sm text-slate-400">
                      Manage milestones, deliverables, and the connected contract workflow.
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {milestoneCount} Milestones
                      </span>
                      <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {deliverableCount} Deliverables
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-auto">
                  {linkedContract?.contractID ? (
                    <Link
                      to={`/contracts/${linkedContract.contractID}/workflow`}
                      className="inline-flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors"
                    >
                      <span>Open Workflow</span>
                      <span>→</span>
                    </Link>
                  ) : (
                    <Link
                      to={`/projects/${project.projectID}/workflow`}
                      className="inline-flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
                    >
                      <span>{contractLoading ? 'Preparing workflow...' : 'Open Workflow'}</span>
                      <span>→</span>
                    </Link>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 mb-2">
                Total Budget
              </p>
              <div className="text-4xl font-bold text-teal-400">
                ${project.budget?.toLocaleString() || '0'}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 mb-1">
                  Created At
                </p>
                <p className="text-sm text-slate-200">
                  {project.createdAt ? new Date(project.createdAt).toLocaleString() : 'N/A'}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 mb-1">
                  Last Updated
                </p>
                <p className="text-sm text-slate-200">
                  {project.updatedAt ? new Date(project.updatedAt).toLocaleString() : 'N/A'}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 mb-1">
                  Visibility
                </p>
                <p className="text-sm text-slate-200">{project.visibility || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}