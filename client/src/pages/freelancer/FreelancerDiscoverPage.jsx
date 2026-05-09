import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../hooks/useProjects';
import { apiClient } from '../../lib/apiClient';

const STATUS_STYLES = {
  Open: 'bg-teal-50 text-teal-700 border-teal-200',
  InProgress: 'bg-blue-50 text-blue-700 border-blue-200',
  Completed: 'bg-slate-100 text-slate-600 border-slate-200',
};

export default function FreelancerDiscoverPage() {
  const { user } = useAuth();
  const { projects, isLoading, error, fetchProjects } = useProjects();

  const [mySkills, setMySkills] = useState([]);
  const [activeSkill, setActiveSkill] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    apiClient.get('/api/users/me').then(res => {
      const skills = res.data?.freelancerProfile?.skills ?? [];
      setMySkills(skills);
      if (skills.length > 0) setActiveSkill(skills[0]);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    fetchProjects({ page, pageSize: 12, status: 'Open', skill: activeSkill || undefined, search: search || undefined });
  }, [page, activeSkill, search, fetchProjects]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProjects({ page: 1, pageSize: 12, status: 'Open', skill: activeSkill || undefined, search: search || undefined });
  };

  const items = projects?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((projects?.totalCount ?? 0) / 12));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-slate-900">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Discover Projects</h1>
        <p className="text-sm text-slate-500 mt-1">Find open projects that match your skills and apply.</p>
      </div>

      {mySkills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setActiveSkill(''); setPage(1); }}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              activeSkill === ''
                ? 'bg-teal-600 border-teal-600 text-white'
                : 'border-slate-300 text-slate-600 hover:border-teal-400 hover:text-teal-600'
            }`}
          >
            All
          </button>
          {mySkills.map(skill => (
            <button
              key={skill}
              onClick={() => { setActiveSkill(skill); setPage(1); }}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                activeSkill === skill
                  ? 'bg-teal-600 border-teal-600 text-white'
                  : 'border-slate-300 text-slate-600 hover:border-teal-400 hover:text-teal-600'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg bg-white border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-sm font-semibold text-white transition-colors"
        >
          Search
        </button>
      </form>

      {isLoading && (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700 text-sm">{error}</div>
      )}

      {!isLoading && items.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <p className="text-lg font-medium">No open projects found</p>
          <p className="text-sm mt-1">Try a different skill filter or search term.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(project => (
          <Link
            key={project.projectID}
            to={`/projects/${project.projectID}`}
            className="block rounded-2xl border border-slate-200 bg-white p-5 hover:border-teal-300 hover:shadow-md transition-all space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-slate-900 line-clamp-2">{project.title}</h3>
              <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLES[project.status] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                {project.status}
              </span>
            </div>

            <p className="text-xs text-slate-500 line-clamp-3">{project.description}</p>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-teal-600">${project.budget?.toLocaleString()}</span>
              <span>{project.categoryName}</span>
            </div>

            {project.skills?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {project.skills.map(s => (
                  <span
                    key={s}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                      mySkills.includes(s)
                        ? 'bg-teal-50 border-teal-200 text-teal-700'
                        : 'bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="px-3 py-1.5 rounded-lg text-sm bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-3 py-1.5 text-sm text-slate-500">
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1.5 rounded-lg text-sm bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
