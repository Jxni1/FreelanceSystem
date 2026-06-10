import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  DollarSign,
  Briefcase,
  Calendar,
  Clock,
  CheckCircle,
  Award,
  UserCircle2,
  Pencil,
  Search,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useContracts } from '../../hooks/useContracts';
import { useReviews } from '../../hooks/useReviews';
import { apiClient } from '../../lib/apiClient';
import { PageHeading } from '../../components/ui/PageHeading';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

const LEVEL_TONE = {
  Junior: 'emerald',
  Mid: 'sky',
  Senior: 'violet',
  Expert: 'amber',
};

function StarRow({ rating, size = 13 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={
            i <= rating
              ? 'fill-amber-400 text-amber-400'
              : 'fill-slate-200 text-slate-200'
          }
        />
      ))}
    </div>
  );
}

function formatMoney(value) {
  return '$' + Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString();
}

export default function FreelancerPortfolioPage() {
  const { user } = useAuth();
  const { contracts, fetchContracts } = useContracts();
  const { reviews, fetchReviews } = useReviews();

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const contractItems = Array.isArray(contracts?.items) ? contracts.items : [];
  const reviewItems = Array.isArray(reviews?.items) ? reviews.items : [];

  useEffect(() => {
    apiClient
      .get('/api/users/me')
      .then((res) => setProfile(res.data))
      .catch(() => {})
      .finally(() => setProfileLoading(false));

    fetchContracts({ page: 1, pageSize: 100 });
  }, [fetchContracts]);

  useEffect(() => {
    const freelancerId = contractItems.find((c) => c.freelancerID)?.freelancerID;
    if (freelancerId) {
      fetchReviews({ freelancerId, pageSize: 50 });
    }
  }, [contractItems, fetchReviews]);

  const fp = profile?.freelancerProfile;

  const stats = useMemo(() => {
    const completed = contractItems.filter((c) => c.status === 'Completed');
    const active = contractItems.filter(
      (c) => c.status === 'Active' || c.status === 'InProgress'
    );

    const totalEarned = completed.reduce((sum, c) => sum + (c.agreedPrice ?? 0), 0);

    const avgRating = reviewItems.length
      ? (
          reviewItems.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) /
          reviewItems.length
        ).toFixed(1)
      : null;

    return {
      completedCount: completed.length,
      activeCount: active.length,
      totalEarned,
      avgRating,
    };
  }, [contractItems, reviewItems]);

  const ratingDist = useMemo(() => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewItems.forEach((r) => {
      const rating = Number(r.rating);
      if (dist[rating] !== undefined) dist[rating] += 1;
    });
    return dist;
  }, [reviewItems]);

  const completedWork = useMemo(
    () =>
      [...contractItems]
        .filter((c) => c.status === 'Completed')
        .sort(
          (a, b) =>
            new Date(b.end_Date ?? 0).getTime() - new Date(a.end_Date ?? 0).getTime()
        )
        .slice(0, 6),
    [contractItems]
  );

  const initials =
    [profile?.name?.[0] ?? '', profile?.surname?.[0] ?? ''].join('').toUpperCase() ||
    user?.username?.[0]?.toUpperCase() ||
    '?';

  const experienceTone = LEVEL_TONE[fp?.experienceLevel] ?? 'slate';

  if (profileLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow={
          <>
            Public freelancer profile ·{' '}
            <span className="font-medium text-brand-700">Portfolio overview</span>
          </>
        }
        title="My portfolio"
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Button to="/freelancer" variant="soft" icon={LayoutDashboard}>
              Back to dashboard
            </Button>
            <Button to="/profile/edit" variant="soft" icon={Pencil}>
              Edit profile
            </Button>
            <Button to="/discover" icon={Search}>
              Find work
            </Button>
          </div>
        }
      />

      <Card bodyClassName="p-0 overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-brand-700 via-teal-600 to-emerald-500" />
        <div className="px-6 pb-6">
          <div className="-mt-10 flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-gradient-to-br from-brand-500 to-emerald-500 text-2xl font-bold text-white shadow-sm">
              {profile?.profilePhoto ? (
                <img
                  src={profile.profilePhoto}
                  alt={`${profile?.name || 'Freelancer'} profile`}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <h2 className="truncate text-2xl font-bold text-slate-900">
                    {profile?.name} {profile?.surname}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">@{profile?.username}</p>
                  {fp?.bio ? (
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                      {fp.bio}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {fp?.experienceLevel ? (
                    <Badge tone={experienceTone}>{fp.experienceLevel}</Badge>
                  ) : null}
                  {fp?.hourlyRate > 0 ? (
                    <Badge tone="brand">{formatMoney(fp.hourlyRate)}/hr</Badge>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {Array.isArray(fp?.skills) && fp.skills.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {fp.skills.map((skill) => (
                <Badge key={skill} tone="slate">
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
              Add skills to make your profile stronger and help clients understand your expertise faster.
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card title="Total earned" icon={DollarSign}>
          <p className="text-3xl font-bold text-brand-700">
            {formatMoney(stats.totalEarned)}
          </p>
          <p className="mt-1 text-sm text-slate-500">From completed contracts</p>
        </Card>

        <Card title="Completed jobs" icon={CheckCircle}>
          <p className="text-3xl font-bold text-indigo-600">{stats.completedCount}</p>
          <p className="mt-1 text-sm text-slate-500">Delivered successfully</p>
        </Card>

        <Card title="Active jobs" icon={Clock}>
          <p className="text-3xl font-bold text-amber-600">{stats.activeCount}</p>
          <p className="mt-1 text-sm text-slate-500">Currently in progress</p>
        </Card>

        <Card title="Average rating" icon={Star}>
          <p className="text-3xl font-bold text-rose-600">{stats.avgRating ?? '—'}</p>
          <div className="mt-2 flex items-center gap-2">
            <StarRow rating={Math.round(Number(stats.avgRating || 0))} size={14} />
            <span className="text-sm text-slate-500">
              {reviews?.totalCount ?? 0} review{(reviews?.totalCount ?? 0) !== 1 ? 's' : ''}
            </span>
          </div>
        </Card>
      </div>

      {reviewItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="xl:col-span-4">
            <Card title="Rating breakdown" icon={Award}>
              <div className="mb-6 text-center">
                <p className="text-4xl font-bold text-slate-900">{stats.avgRating}</p>
                <div className="mt-2 flex justify-center">
                  <StarRow rating={Math.round(Number(stats.avgRating || 0))} size={15} />
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  {reviews?.totalCount ?? 0} review{(reviews?.totalCount ?? 0) !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="space-y-2.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratingDist[star] ?? 0;
                  const pct = reviewItems.length ? (count / reviewItems.length) * 100 : 0;

                  return (
                    <div key={star} className="flex items-center gap-3 text-sm">
                      <span className="w-4 text-right text-slate-500">{star}</span>
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-amber-400 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-5 text-right text-slate-400">{count}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          <div className="xl:col-span-8">
            <Card
              title="Client reviews"
              icon={Star}
              bodyClassName="max-h-[420px] space-y-3 overflow-y-auto"
              action={<Badge tone="slate">{reviewItems.length} loaded</Badge>}
            >
              {reviewItems.map((review) => (
                <div
                  key={review.reviewsID}
                  className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-xs font-bold text-slate-600">
                        {review.clientName?.[0]?.toUpperCase() ?? 'C'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {review.clientName || 'Client'}
                        </p>
                        <p className="text-xs text-slate-400">
                          {formatDate(review.created_at)}
                        </p>
                      </div>
                    </div>

                    <StarRow rating={Number(review.rating) || 0} size={12} />
                  </div>

                  {review.comment ? (
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      “{review.comment}”
                    </p>
                  ) : null}
                </div>
              ))}
            </Card>
          </div>
        </div>
      ) : null}

      {completedWork.length > 0 ? (
        <Card
          title="Completed work"
          icon={Briefcase}
          action={<Badge tone="brand">{completedWork.length} shown</Badge>}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {completedWork.map((contract) => (
              <Link
                key={contract.contractID}
                to={`/contracts/${contract.contractID}`}
                className="group rounded-2xl border border-line bg-surface p-5 transition hover:border-brand-300 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="line-clamp-1 text-sm font-semibold text-slate-900 transition group-hover:text-brand-700">
                    {contract.projectTitle || 'Untitled Project'}
                  </h3>
                  <Badge tone="sky">Completed</Badge>
                </div>

                <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                  <Briefcase size={14} className="shrink-0" />
                  <span>{contract.clientName || 'Client'}</span>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="font-bold text-brand-700">
                    {formatMoney(contract.agreedPrice ?? 0)}
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Calendar size={13} />
                    {formatDate(contract.end_Date)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      ) : null}

      {completedWork.length === 0 && reviewItems.length === 0 ? (
        <Card title="Portfolio status" icon={UserCircle2}>
          <div className="rounded-2xl border-2 border-dashed border-slate-200 px-6 py-12 text-center">
            <Award size={32} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">Your portfolio is still growing</p>
            <p className="mt-2 text-sm text-slate-500">
              Complete contracts and collect reviews to build stronger proof for future clients.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <Button to="/discover" icon={Search}>
                Find work
              </Button>
              <Button to="/profile/edit" variant="soft" icon={Pencil}>
                Edit profile
              </Button>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}