import { useEffect, useState } from 'react';
import { useFreelancers } from '../../hooks/useFreelancers';
import { ReportModal } from '../admin/reports/ReportModal';


const EXPERIENCE_LEVELS = ['Junior', 'Mid', 'Senior', 'Expert'];

function StarRating({ rating }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`text-xs ${
            i <= Math.round(rating) ? 'text-amber-400' : 'text-slate-300'
          }`}
        >
          ★
        </span>
      ))}
      <span className="ml-1 text-xs text-slate-500">
        {rating > 0 ? rating.toFixed(1) : 'No reviews'}
      </span>
    </span>
  );
}

export default function FreelancersPage() {
  const { freelancers, isLoading, error, fetchFreelancers } = useFreelancers();

  const [search, setSearch] = useState('');
  const [skill, setSkill] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [page, setPage] = useState(1);

  const [reportingFreelancer, setReportingFreelancer] = useState(null);

  const load = (overrides = {}) => {
    fetchFreelancers({
      page,
      pageSize: 12,
      search: search || undefined,
      skill: skill || undefined,
      experienceLevel: experienceLevel || undefined,
      ...overrides,
    });
  };

  useEffect(() => {
    load();
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load({ page: 1 });
  };

  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(1);
    setTimeout(() => load({ page: 1 }), 0);
  };

  const openReportModal = (freelancer) => {
    setReportingFreelancer(freelancer);
  };

  const closeReportModal = () => {
    setReportingFreelancer(null);
  };

  const items = freelancers?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((freelancers?.totalCount ?? 0) / 12));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-slate-900">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Find Freelancers
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Browse and search freelancers by skill or experience.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <input
            type="text"
            placeholder="Search by name or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg bg-white border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-sm font-semibold text-white transition-colors"
          >
            Search
          </button>
        </form>

        <input
          type="text"
          placeholder="Filter by skill..."
          value={skill}
          onChange={(e) => handleFilterChange(setSkill, e.target.value)}
          className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 sm:w-48"
        />

        <select
          value={experienceLevel}
          onChange={(e) => handleFilterChange(setExperienceLevel, e.target.value)}
          className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">All levels</option>
          {EXPERIENCE_LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <p className="text-lg font-medium">No freelancers found</p>
          <p className="text-sm mt-1">
            Try adjusting your search or filters.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((f) => (
          <div
            key={f.freelancerID}
            className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 text-lg font-semibold">
                {f.name?.[0] ?? '?'}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 truncate">{f.name}</p>
                <p className="text-xs text-slate-500">@{f.username}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-600">
                {f.experienceLevel}
              </span>
              <span className="text-teal-600 font-semibold">
                ${f.hourlyRate}/hr
              </span>
            </div>

            <StarRating rating={f.averageRating} />

            {f.skills?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {f.skills.slice(0, 5).map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-teal-50 border border-teal-100 text-teal-700"
                  >
                    {s}
                  </span>
                ))}
                {f.skills.length > 5 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] text-slate-400">
                    +{f.skills.length - 5}
                  </span>
                )}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => openReportModal(f)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700"
              >
                <span aria-hidden>🚩</span>
                <span>Report</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 rounded-lg text-sm bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-3 py-1.5 text-sm text-slate-500">
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 rounded-lg text-sm bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      <ReportModal
        isOpen={!!reportingFreelancer}
        onClose={closeReportModal}
        initialEntity="Freelancer"
        initialEntityId={
          reportingFreelancer?.freelancerID || reportingFreelancer?.userID || ''
        }
        initialDisplayLabel={
          reportingFreelancer
            ? `${reportingFreelancer.name || 'Unknown'}${
                reportingFreelancer.username
                  ? ` (@${reportingFreelancer.username})`
                  : ''
              }`
            : ''
        }
      />
    </div>
  );
}