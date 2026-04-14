import { useState, useEffect, useCallback } from 'react';
import { projectsApi, categoriesApi } from '../../lib/projectsApi';
import Spinner from '../../components/ui/Spinner';
import ProjectsTable from './components/ProjectsTable';
import CreateProjectModal from './modals/CreateProjectModal';
import EditProjectModal from './modals/EditProjectModal';
import DeleteConfirmModal from './modals/DeleteConfirmModal';
import ProjectDetailModal from './modals/ProjectDetailModal';
import CreateCategoryModal from './modals/CreateCategoryModal';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [deleteProject, setDeleteProject] = useState(null);
  const [detailProject, setDetailProject] = useState(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [projRes, catRes] = await Promise.all([
        projectsApi.getAll(),
        categoriesApi.getAll(),
      ]);
      setProjects(projRes.data.data ?? []);
      setCategories(catRes.data ?? []);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleCreated = (project) => {
    setProjects((p) => [project, ...p]);
    setCreateOpen(false);
  };

  const handleUpdated = (updated) => {
    setProjects((p) => p.map((x) => x.projectID === updated.projectID ? updated : x));
    setEditProject(null);
  };

  const handleDeleted = (id) => {
    setProjects((p) => p.filter((x) => x.projectID !== id));
    setDeleteProject(null);
  };

  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.clientName ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (p.categoryName ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-slate-400 hover:text-slate-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </a>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
              <p className="text-sm text-slate-500 mt-0.5">Manage all freelance projects</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCategoryModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              New Category
            </button>
            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Project
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Search bar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, client, category…"
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors bg-white"
            />
          </div>
          {!loading && (
            <span className="text-sm text-slate-500">
              {filtered.length} {filtered.length === 1 ? 'project' : 'projects'}
            </span>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <Spinner />
        ) : error ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <p className="text-red-500 text-sm">{error}</p>
            <button onClick={fetchProjects}
              className="px-4 py-2 text-sm font-medium text-teal-600 hover:text-teal-700 underline transition-colors">
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-3 text-slate-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            <p className="text-sm font-medium">
              {search ? 'No projects match your search.' : 'No projects yet.'}
            </p>
            {!search && (
              <button onClick={() => setCreateOpen(true)}
                className="text-sm text-teal-600 hover:text-teal-700 underline transition-colors">
                Create your first project
              </button>
            )}
          </div>
        ) : (
          <ProjectsTable
            projects={filtered}
            onDetail={setDetailProject}
            onEdit={setEditProject}
            onDelete={setDeleteProject}
          />
        )}
      </div>

      {/* Modals */}
      {categoryModalOpen && (
        <CreateCategoryModal
          onClose={() => setCategoryModalOpen(false)}
          onCreated={(cat) => {
            setCategories((prev) => [...prev, cat]);
            setCategoryModalOpen(false);
          }}
        />
      )}
      {createOpen && (
        <CreateProjectModal
          categories={categories}
          onClose={() => setCreateOpen(false)}
          onCreated={handleCreated}
        />
      )}
      {editProject && (
        <EditProjectModal
          project={editProject}
          categories={categories}
          onClose={() => setEditProject(null)}
          onUpdated={handleUpdated}
        />
      )}
      {deleteProject && (
        <DeleteConfirmModal
          project={deleteProject}
          onClose={() => setDeleteProject(null)}
          onDeleted={handleDeleted}
        />
      )}
      {detailProject && (
        <ProjectDetailModal
          project={detailProject}
          onClose={() => setDetailProject(null)}
          onEdit={setEditProject}
          onDelete={setDeleteProject}
        />
      )}
    </div>
  );
}