import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Star, DollarSign, Briefcase,
  Calendar, Clock, CheckCircle, Award,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useContracts } from '../../hooks/useContracts';
import { useReviews } from '../../hooks/useReviews';
import { apiClient } from '../../lib/apiClient';

const LEVEL_COLORS = {
  Junior: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Mid:    'bg-sky-50 text-sky-700 border-sky-200',
  Senior: 'bg-violet-50 text-violet-700 border-violet-200',
  Expert: 'bg-amber-50 text-amber-700 border-amber-200',
};

function StarRow({ rating, size = 13 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={size}
          className={i <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />
      ))}
    </div>
  );
}

const fmt = (n) =>
  '$' + Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export default function FreelancerPortfolioPage() {
  const { user } = useAuth();
  const { contracts, fetchContracts } = useContracts();
  const { reviews, fetchReviews } = useReviews();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/api/users/me')
      .then(res => setProfile(res.data))
      .catch(() => {})
      .finally(() => setProfileLoading(false));
    fetchContracts({ page: 1, pageSize: 100 });
  }, [fetchContracts]);

  // Fetch reviews once we have a freelancerID from contracts
  useEffect(() => {
    const fid = contracts.items.find(c => c.freelancerID)?.freelancerID;
    if (fid) fetchReviews({ freelancerId: fid, pageSize: 50 });
  }, [contracts.items, fetchReviews]);

  const fp = profile?.freelancerProfile;

  const stats = useMemo(() => {
    const completed = contracts.items.filter(c => c.status === 'Completed');
    const active    = contracts.items.filter(c => c.status === 'Active' || c.status === 'InProgress');
    const totalEarned = completed.reduce((s, c) => s + (c.agreedPrice ?? 0), 0);
    const avgRating = reviews.items.length
      ? (reviews.items.reduce((s, r) => s + r.rating, 0) / reviews.items.length).toFixed(1)
      : null;
    return { completedCount: completed.length, activeCount: active.length, totalEarned, avgRating };
  }, [contracts.items, reviews.items]);

  const ratingDist = useMemo(() => {
    const d = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.items.forEach(r => { d[r.rating] = (d[r.rating] ?? 0) + 1; });
    return d;
  }, [reviews.items]);

  const completedWork = useMemo(() =>
    contracts.items
      .filter(c => c.status === 'Completed')
      .sort((a, b) => new Date(b.end_Date ?? 0) - new Date(a.end_Date ?? 0))
      .slice(0, 6),
  [contracts.items]);

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin" />
      </div>
    );
  }

  const initials = [profile?.name?.[0] ?? '', profile?.surname?.[0] ?? '']
    .join('').toUpperCase() || user?.username?.[0]?.toUpperCase() || '?';
  const levelStyle = LEVEL_COLORS[fp?.experienceLevel] ?? 'bg-slate-100 text-slate-600 border-slate-200';

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Sticky header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link to="/discover" className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-base font-bold text-slate-900">My Portfolio</h1>
            <p className="text-[11px] text-slate-400">Your public profile</p>
          </div>
          <Link to="/profile/edit"
            className="ml-auto px-4 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            Edit Profile
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">

        {/* Profile hero card */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-teal-600 via-emerald-500 to-teal-500" />
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-10 mb-4">
              <div className="w-20 h-20 rounded-2xl border-4 border-white bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white font-bold text-2xl shadow-sm flex-shrink-0 overflow-hidden">
                {profile?.profilePhoto
                  ? <img src={profile.profilePhoto} alt="" className="w-full h-full object-cover" />
                  : initials}
              </div>
              <div className="mb-1 min-w-0 flex-1">
                <h2 className="text-xl font-bold text-slate-900 leading-tight">
                  {profile?.name} {profile?.surname}
                </h2>
                <p className="text-sm text-slate-400">@{profile?.username}</p>
              </div>
              <div className="mb-1 flex items-center gap-2 flex-shrink-0">
                {fp?.experienceLevel && (
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${levelStyle}`}>
                    {fp.experienceLevel}
                  </span>
                )}
                {fp?.hourlyRate > 0 && (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                    {fmt(fp.hourlyRate)}/hr
                  </span>
                )}
              </div>
            </div>

            {fp?.skills?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {fp.skills.map(s => (
                  <span key={s} className="px-3 py-1 text-xs rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Earned',    value: fmt(stats.totalEarned),     Icon: DollarSign,  color: 'text-teal-600',   bg: 'bg-teal-50',   border: 'border-teal-200' },
            { label: 'Completed Jobs',  value: stats.completedCount,        Icon: CheckCircle, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
            { label: 'Active Jobs',     value: stats.activeCount,           Icon: Clock,       color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200' },
            { label: 'Avg Rating',      value: stats.avgRating ?? '—',      Icon: Star,        color: 'text-rose-600',   bg: 'bg-rose-50',   border: 'border-rose-200' },
          ].map(({ label, value, Icon, color, bg, border }) => (
            <div key={label} className={`rounded-2xl border ${border} ${bg} p-5 shadow-sm`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center bg-white border ${border}`}>
                  <Icon size={14} className={color} />
                </div>
              </div>
              <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
              <p className="text-[11px] text-slate-400 mt-1">
                {label === 'Avg Rating' && reviews.totalCount > 0
                  ? `${reviews.totalCount} review${reviews.totalCount !== 1 ? 's' : ''}`
                  : '\u00A0'}
              </p>
            </div>
          ))}
        </div>

        {/* Reviews */}
        {reviews.items.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-slate-900 mb-4">Client Reviews</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Rating distribution */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
                <div className="text-center mb-5">
                  <p className="text-4xl font-bold text-slate-900 tabular-nums">{stats.avgRating}</p>
                  <div className="flex justify-center mt-1">
                    <StarRow rating={Math.round(Number(stats.avgRating))} size={15} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {reviews.totalCount} review{reviews.totalCount !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="space-y-2">
                  {[5,4,3,2,1].map(star => {
                    const count = ratingDist[star] ?? 0;
                    const pct = reviews.items.length > 0 ? (count / reviews.items.length) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-2 text-xs">
                        <span className="w-3 text-right text-slate-500">{star}</span>
                        <Star size={10} className="text-amber-400 fill-amber-400 flex-shrink-0" />
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-4 text-right text-slate-400">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Review cards */}
              <div className="md:col-span-2 space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {reviews.items.map(r => (
                  <div key={r.reviewsID} className="rounded-xl border border-slate-100 bg-white p-4 space-y-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-600">
                          {r.clientName?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <span className="text-xs font-semibold text-slate-700">{r.clientName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <StarRow rating={r.rating} size={11} />
                        <span className="text-[10px] text-slate-400">
                          {r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}
                        </span>
                      </div>
                    </div>
                    {r.comment && (
                      <p className="text-xs text-slate-600 leading-relaxed italic">"{r.comment}"</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Completed work */}
        {completedWork.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-slate-900 mb-4">Completed Work</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedWork.map(c => (
                <Link key={c.contractID} to={`/contracts/${c.contractID}`}
                  className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 hover:shadow-md hover:border-teal-300 transition-all group space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-slate-900 text-sm group-hover:text-teal-700 transition-colors line-clamp-1">
                      {c.projectTitle || 'Untitled Project'}
                    </h3>
                    <span className="flex-shrink-0 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Completed
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Briefcase size={11} className="flex-shrink-0" />
                    <span>{c.clientName || 'Client'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-teal-600">{fmt(c.agreedPrice ?? 0)}</span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Calendar size={11} />
                      {c.end_Date ? new Date(c.end_Date).toLocaleDateString() : '—'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {completedWork.length === 0 && reviews.items.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 p-14 text-center">
            <Award size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm font-semibold mb-1">Your portfolio is empty</p>
            <p className="text-slate-400 text-xs mb-5">Complete contracts to build your work history and earn reviews.</p>
            <Link to="/discover"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors">
              Find work
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}