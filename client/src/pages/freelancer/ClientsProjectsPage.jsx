import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProjects } from '../../hooks/useProjects';


export default function ClientProjectsPage() {
  const { clientId } = useParams();
  const { projects, isLoading, error, fetchProjects } = useProjects();

  useEffect(() => {
    if (!clientId) return;
    fetchProjects({
      page: 1,
      pageSize: 20,
      clientId,        // must match your backend query param name (clientId)
    });
  }, [clientId, fetchProjects]);

  const items = projects?.items ?? [];

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center text-slate-500">
        <div className="inline-block w-10 h-10 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin mb-4" />
        <p>Loading client projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{typeof error === 'string' ? error : 'Failed to load projects.'}</p>
        <div className="mt-6">
          <Link to="/clients" className="text-rose-600 font-semibold hover:text-rose-700">
            &larr; Back to Clients
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-slate-900">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Client Projects
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Projects posted by this client.
          </p>
        </div>
        <Link
          to="/clients"
          className="text-sm font-semibold text-teal-600 hover:text-teal-700"
        >
          &larr; Back to Clients
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p className="text-lg font-medium">No projects found</p>
          <p className="text-sm mt-1">
            This client has not posted any projects yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((p) => (
            <Link
              key={p.projectID || p.projectId}
              to={`/projects/${p.projectID || p.projectId}`}
              className="block rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-sm hover:shadow-md hover:border-teal-200 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-semibold text-slate-900 truncate">
                  {p.title}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full border bg-slate-50 text-slate-600">
                  {p.status || 'Open'}
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-3">
                {p.description || 'No description provided.'}
              </p>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>
                  Budget: ${p.budget?.toLocaleString?.() ?? p.budget ?? '0'}
                </span>
                <span>{p.categoryName || 'Uncategorized'}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}