import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProjects } from '../../hooks/useProjects';

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { project, isLoading, error, fetchProjectById, deleteProject } = useProjects();

  useEffect(() => {
    if (id) {
      fetchProjectById(id);
    }
  }, [id, fetchProjectById]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      await deleteProject(id);
      navigate('/projects');
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 min-h-[50vh] flex flex-col items-center justify-center">
        <div className="inline-block w-10 h-10 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin mb-4" />
        <p>Loading project details...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-8 max-w-4xl mx-auto mt-8 bg-red-50 border border-red-200 rounded-xl text-red-700">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{typeof error === 'string' ? error : 'Project not found.'}</p>
        <div className="mt-6">
          <Link to="/projects" className="text-red-700 font-semibold hover:underline">
            &larr; Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link to="/projects" className="inline-block mb-6 text-slate-500 hover:text-teal-600 font-medium transition-colors">
        &larr; Back to Projects
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-4 bg-gradient-to-r from-teal-500 to-emerald-400" />

        <div className="p-8 md:p-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-8 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{project.title}</h1>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full border
                  ${project.status === 'Open' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    project.status === 'InProgress' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                      project.status === 'Completed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-slate-100 text-slate-700 border-slate-200'}`}>
                  {project.status || 'Open'}
                </span>
                <span className="px-3 py-1 text-sm font-semibold rounded-full border bg-purple-50 text-purple-700 border-purple-200">
                  {project.visibility || 'Private'}
                </span>
              </div>
              <p className="text-slate-500 text-sm">
                Project ID: <span className="font-mono text-slate-400">{project.projectID}</span>
              </p>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <Link
                to={`/projects/${project.projectID}/edit`}
                className="flex-1 md:flex-none px-6 py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium rounded-lg transition-colors text-center"
              >
                Edit Form
              </Link>
              <button
                onClick={handleDelete}
                className="flex-1 md:flex-none px-6 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-medium rounded-lg transition-colors text-center"
              >
                Delete
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <section>
                <h3 className="text-lg font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2">Description</h3>
                <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {project.description || 'No description provided.'}
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2">Category</h3>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium tracking-wide">
                  <span>{project.categoryName || 'Uncategorized'}</span>
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Budget</p>
                <div className="text-4xl font-extrabold text-teal-600">
                  ${project.budget?.toLocaleString() || '0'}
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 space-y-4 text-sm">
                <div>
                  <p className="font-semibold text-slate-500 uppercase tracking-wider mb-1">Created At</p>
                  <p className="text-slate-800 font-medium">{new Date(project.createdAt).toLocaleDateString()} {new Date(project.createdAt).toLocaleTimeString()}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-500 uppercase tracking-wider mb-1">Last Updated</p>
                  <p className="text-slate-800 font-medium">{new Date(project.updatedAt).toLocaleDateString()} {new Date(project.updatedAt).toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
