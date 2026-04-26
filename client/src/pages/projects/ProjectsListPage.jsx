import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '../../hooks/useProjects';

export default function ProjectsListPage() {
  const { projects, isLoading, error, fetchProjects, deleteProject } = useProjects();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchProjects({ page, pageSize: 10, search: searchTerm });
  }, [fetchProjects, page, searchTerm]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      await deleteProject(id);
      fetchProjects({ page, pageSize: 10, search: searchTerm });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProjects({ page: 1, pageSize: 10, search: searchTerm });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto text-slate-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Projects</h1>
          <p className="text-slate-300 mt-1">Manage your projects, budgets, and status.</p>
        </div>
        <Link
          to="/projects/new"
          className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <span className="text-xl leading-none">+</span> New Project
        </Link>
      </div>

      <div className="bg-white text-slate-900 rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-sm">
            <input
              type="text"
              placeholder="Search projects by title..."
              className="w-full pl-4 pr-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="absolute right-3 top-2.5 text-slate-400 hover:text-teal-600 font-bold">
              &#x21B5;
            </button>
          </form>
        </div>

        {error && (
          <div className="p-6 text-red-600 bg-red-50 border-b border-red-100">
            {typeof error === 'string' ? error : 'Failed to load projects'}
          </div>
        )}

        {isLoading && !projects?.items?.length ? (
          <div className="p-12 text-center text-slate-500">
            <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin mb-4" />
            <p>Loading projects...</p>
          </div>
        ) : projects?.items?.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <div className="text-5xl mb-4 opacity-50">&#128193;</div>
            <p className="text-lg font-medium text-slate-700 mb-1">No projects found</p>
            <p className="text-sm">Get started by creating a new project.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider border-b border-slate-200">
                  <th className="px-6 py-4 font-medium">Title</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Budget</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {projects?.items?.map((project) => (
                  <tr key={project.projectID} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{project.title}</div>
                      <div className="text-xs text-slate-500 truncate max-w-xs">{project.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                        ${project.status === 'Open' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          project.status === 'InProgress' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                            project.status === 'Completed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              'bg-slate-100 text-slate-700 border-slate-200'}
                      `}>
                        {project.status || 'Open'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      ${project.budget.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <Link to={`/projects/${project.projectID}`} className="text-teal-600 hover:text-teal-800 font-medium text-sm transition-colors">
                        View
                      </Link>
                      <Link to={`/projects/${project.projectID}/edit`} className="text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors">
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(project.projectID)}
                        className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {projects?.totalCount > 10 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
            <span className="text-sm text-slate-500">
              Showing {(projects.page - 1) * projects.pageSize + 1} to {Math.min(projects.page * projects.pageSize, projects.totalCount)} of {projects.totalCount} results
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={projects.page === 1}
                className="px-3 py-1 border border-slate-300 rounded bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={projects.page * projects.pageSize >= projects.totalCount}
                className="px-3 py-1 border border-slate-300 rounded bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
