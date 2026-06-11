import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../hooks/useProjects';
import { apiClient } from '../../lib/apiClient';
import { useCategories } from '../../hooks/useCategories';

// Sentinel for the "All jobs" filter — shows every open project, ignoring skills.
const ALL_JOBS = '__all__';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minute${mins !== 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function FreelancerDiscoverPage() {
  const { user } = useAuth();
  const { projects, isLoading, error, fetchProjects } = useProjects();
  const { categories: categoriesData, fetchCategories } = useCategories();

  const [activeCategory, setActiveCategory] = useState('');
  const [mySkills, setMySkills] = useState([]);
  const [activeSkill, setActiveSkill] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [skillsLoaded, setSkillsLoaded] = useState(false);

  useEffect(() => {
    apiClient.get('/api/users/me').then(res => {
      const skills = res.data?.freelancerProfile?.skills ?? [];
      setMySkills(skills);
      if (skills.length > 0) setActiveSkill(skills[0]);
    }).catch(() => {}).finally(() => setSkillsLoaded(true));
  }, []);

  useEffect(() => {
    if (!skillsLoaded) return;
    fetchProjects(buildParams(page));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skillsLoaded, page, activeSkill, search, activeCategory, mySkills, fetchProjects]);

  useEffect(() => {
    fetchCategories({ pageSize: 100 });
  }, [fetchCategories]);

  const buildParams = (targetPage) => {
    const params = { page: targetPage, pageSize: 12, status: 'Open', search: search || undefined, categoryId: activeCategory || undefined };
    if (activeSkill === ALL_JOBS) {
      // No skill filter — show all open jobs.
    } else if (activeSkill) {
      params.skillNames = [activeSkill];
    } else if (mySkills.length > 0) {
      params.skillNames = mySkills;
    }
    return params;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProjects(buildParams(1));
  };

  const items = projects?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((projects?.totalCount ?? 0) / 12));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 text-slate-900">

      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Jobs you might like</h1>
        <p className="text-sm text-slate-500 mt-1">Based on your skills and profile</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-sm font-semibold text-white transition-colors"
          >
            Search
          </button>
        </form>

        {categoriesData.items.length > 0 && (
          <select
            value={activeCategory}
            onChange={e => { setActiveCategory(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-lg bg-white border border-slate-300 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">All Categories</option>
            {categoriesData.items.map(cat => (
              <option key={cat.categoryID} value={cat.categoryID}>{cat.name}</option>
            ))}
          </select>
        )}
      </div>

      {mySkills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          <button
            onClick={() => { setActiveSkill(''); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeSkill === ''
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-300 text-slate-600 hover:border-slate-400'
            }`}
          >
            Best matches
          </button>
          <button
            onClick={() => { setActiveSkill(ALL_JOBS); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeSkill === ALL_JOBS
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-300 text-slate-600 hover:border-slate-400'
            }`}
          >
            All jobs
          </button>
          {mySkills.map(skill => (
            <button
              key={skill}
              onClick={() => { setActiveSkill(skill); setPage(1); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeSkill === skill
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-300 text-slate-600 hover:border-slate-400'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-green-600 rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700 text-sm mb-4">{error}</div>
      )}

      {!isLoading && items.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          <p className="text-base font-medium text-slate-700">No jobs found</p>
          <p className="text-sm mt-1">Try a different skill or search term.</p>
        </div>
      )}

      {items.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {items.map((project, idx) => (
            <Link
              key={project.projectID}
              to={`/projects/${project.projectID}`}
              className={`block px-6 py-5 hover:bg-slate-50 transition-colors ${idx !== 0 ? 'border-t border-slate-200' : ''}`}
            >
              <p className="text-xs text-slate-400 mb-2.5">
                Posted {timeAgo(project.createdAt)}
              </p>

              <h3 className="text-lg font-medium text-slate-900 leading-snug mb-1.5 hover:text-green-700 transition-colors">
                {project.title}
              </h3>

              <p className="text-sm text-green-700 font-medium mb-3">
                Fixed Budget: ${project.budget?.toLocaleString()}
                {project.categoryName && (
                  <span className="text-slate-400 font-normal"> &nbsp;·&nbsp; {project.categoryName}</span>
                )}
              </p>

              <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 mb-4">
                {project.description}
              </p>

              {project.skills?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {project.skills.map(s => (
                    <span
                      key={s}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        mySkills.includes(s)
                          ? 'bg-green-100 text-green-800'
                          : 'bg-slate-100 text-slate-600'
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
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>
          <span className="px-4 py-2 text-sm text-slate-500">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
