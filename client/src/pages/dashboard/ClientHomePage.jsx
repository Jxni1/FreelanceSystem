import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../hooks/useProjects';
import { useContracts } from '../../hooks/useContracts';
import { useFreelancers } from '../../hooks/useFreelancers';
import { useCategories } from '../../hooks/useCategories';
import { PlusCircle, Search, FileText, Star, Heart, ArrowRight } from 'lucide-react';

const CATEGORY_COLORS = [
  'bg-violet-50 border-violet-200 text-violet-700',
  'bg-teal-50 border-teal-200 text-teal-700',
  'bg-amber-50 border-amber-200 text-amber-700',
  'bg-rose-50 border-rose-200 text-rose-700',
  'bg-sky-50 border-sky-200 text-sky-700',
  'bg-emerald-50 border-emerald-200 text-emerald-700',
  'bg-indigo-50 border-indigo-200 text-indigo-700',
  'bg-orange-50 border-orange-200 text-orange-700',
];

const STATUS_STYLES = {
  Open: 'bg-amber-50 text-amber-700 border-amber-200',
  InProgress: 'bg-teal-50 text-teal-700 border-teal-200',
  Completed: 'bg-blue-50 text-blue-700 border-blue-200',
};

export default function ClientHomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { projects, fetchProjects, isLoading: projectsLoading } = useProjects();
  const { contracts, fetchContracts } = useContracts();
  const { freelancers, fetchFreelancers } = useFreelancers();
  const { categories, fetchCategories } = useCategories();

  useEffect(() => {
    fetchProjects({ page: 1, pageSize: 5 });
    fetchContracts({ page: 1, pageSize: 100 });
    fetchFreelancers({ page: 1, pageSize: 4 });
    fetchCategories({ page: 1, pageSize: 8 });
  }, [fetchProjects, fetchContracts, fetchFreelancers, fetchCategories]);

  const openContracts = contracts.items.filter(c => c.status === 'Active' || c.status === 'InProgress').length;
  const openProjects = projects.items.filter(p => p.status === 'Open').length;
  const recentProjects = projects.items.slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50">
 
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-500 px-6 py-14">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative max-w-5xl mx-auto">
          <p className="text-teal-100 text-sm font-medium tracking-widest uppercase mb-2">
            Welcome back
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
            Hi, {user?.name ?? 'there'} 
          </h1>
          <p className="text-teal-100 text-base mb-8 max-w-xl">
            You have {projects.totalCount} project{projects.totalCount !== 1 ? 's' : ''}.
            {openProjects > 0 ? ` ${openProjects} still open for proposals.` : ' Everything is in progress.'}
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/projects/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-teal-700 font-semibold hover:bg-teal-50 transition-colors shadow-sm"
            >
              <span>＋</span> Post a Project
            </Link>
            <Link
              to="/freelancers"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-700 text-white font-semibold hover:bg-teal-800 transition-colors border border-teal-400"
            >
              Browse Freelancers →
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-12">
 
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 -mt-6">
          {[
            { label: 'Total Projects', value: projects.totalCount, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200' },
            { label: 'Open Projects', value: openProjects, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
            { label: 'Active Contracts', value: openContracts, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200' },
            { label: 'Total Contracts', value: contracts.totalCount, color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200' },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl border ${s.border} ${s.bg} bg-white shadow-sm p-4`}>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
 
        {categories.items.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Browse by Category</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {categories.items.map((cat, i) => (
                <button
                  key={cat.categoryID}
                  onClick={() => navigate(`/freelancers?categoryId=${cat.categoryID}`)}
                  className={`rounded-xl border p-4 text-left hover:shadow-md transition-all group ${CATEGORY_COLORS[i % CATEGORY_COLORS.length]}`}>
                  <p className="font-semibold text-sm">{cat.name}</p>
                  <ArrowRight size={14} className="mt-2 opacity-0 group-hover:opacity-60 transition-opacity" />
                </button>
              ))}
            </div>
          </section>
        )}
 
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">My Recent Projects</h2>
            <Link to="/projects" className="text-sm font-semibold text-teal-600 hover:text-teal-700">
              View all →
            </Link>
          </div>

          {projectsLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin" />
            </div>
          ) : recentProjects.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center">
              <p className="text-slate-400 text-sm mb-4">You haven't posted any projects yet.</p>
              <Link to="/projects/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors">
                Post your first project
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentProjects.map(p => (
                <Link key={p.projectID} to={`/projects/${p.projectID}`}
                  className="group rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-teal-300 transition-all p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-slate-900 text-sm line-clamp-2 group-hover:text-teal-700 transition-colors">
                      {p.title}
                    </h3>
                    <span className={`shrink-0 px-2 py-0.5 text-[10px] font-semibold rounded-full border ${STATUS_STYLES[p.status] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                      {p.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{p.description || 'No description.'}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-teal-600">${p.budget?.toLocaleString()}</span>
                    <span className="text-xs text-slate-400">{p.categoryName || 'Uncategorized'}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
 
        {freelancers.items.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Available Freelancers</h2>
              <Link to="/freelancers" className="text-sm font-semibold text-teal-600 hover:text-teal-700">
                See all →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {freelancers.items.map(f => (
                <div key={f.freelancerID}
                  className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 hover:shadow-md hover:border-teal-300 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                      {f.username?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">{f.username}</p>
                      <p className="text-xs text-slate-500 truncate">{f.title || 'Freelancer'}</p>
                    </div>
                  </div>
                  {f.skills?.slice(0, 2).map(s => (
                    <span key={s} className="inline-block mr-1 mb-1 px-2 py-0.5 text-[10px] rounded-full bg-slate-100 text-slate-600 border border-slate-200">{s}</span>
                  ))}
                  {f.hourlyRate && (
                    <p className="text-xs font-semibold text-teal-600 mt-2">${f.hourlyRate}/hr</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
 
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { Icon: PlusCircle,  label: 'Post a Project',   sub: 'Start something new',  to: '/projects/new',  bg: 'bg-teal-600 hover:bg-teal-700',     text: 'text-white' },
              { Icon: Search,      label: 'Find Freelancers',  sub: 'Browse talent',        to: '/freelancers',   bg: 'bg-white hover:bg-slate-50 border border-slate-200', text: 'text-slate-800' },
              { Icon: FileText,    label: 'My Contracts',      sub: 'Track agreements',     to: '/contracts',     bg: 'bg-white hover:bg-slate-50 border border-slate-200', text: 'text-slate-800' },
              { Icon: Heart,       label: 'Saved Freelancers', sub: 'Your shortlist',       to: '/favorite-freelancers', bg: 'bg-white hover:bg-slate-50 border border-slate-200', text: 'text-slate-800' },
            ].map(({ Icon, label, sub, to, bg, text }) => (
              <Link key={label} to={to}
                className={`rounded-2xl p-5 flex items-center gap-4 font-semibold text-sm transition-all shadow-sm ${bg} ${text}`}>
                <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center">
                  <Icon size={20} />
                </span>
                <div className="text-left">
                  <p className="font-semibold">{label}</p>
                  <p className="text-xs opacity-60 font-normal">{sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}