import { useEffect, useState } from 'react';
import {
  Plus,
  Briefcase,
  Send,
  ShieldCheck,
  Users,
  CheckCircle2,
  Clock3,
  FileText,
  Heart,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useClientDashboard } from '../../hooks/useClientDashboard';
import { useFavoriteFreelancers } from '../../hooks/useFavoriteFreelancers';
import { PageHeading } from '../../components/ui/PageHeading';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { RatingStars } from '../../components/ui/RatingStars';
import { Button } from '../../components/ui/Button';

const STATUS_TONE = {
  Receiving: 'emerald',
  Shortlisting: 'amber',
  Interviewing: 'blue',
  Open: 'emerald',
  InProgress: 'sky',
  Completed: 'slate',
  Active: 'violet',
  Ongoing: 'violet',
  Closed: 'slate',
};

const ATTENTION_TONE_CLASS = {
  brand: 'bg-brand-50 text-brand-700 ring-brand-200',
  sky: 'bg-sky-50 text-sky-700 ring-sky-200',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  violet: 'bg-violet-50 text-violet-700 ring-violet-200',
  amber: 'bg-amber-50 text-amber-700 ring-amber-200',
};

export default function ClientHomePage() {
  const [talentView, setTalentView] = useState('recommended');

  const {
    firstName,
    dateLabel,
    stats,
    needsAttention,
    recentProjects,
    myProjects,
    activeHires,
    recentActivity,
    talent,
    escrow,
  } = useClientDashboard();

  const {
    favorites,
    isLoading: favoritesLoading,
    isToggling,
    error: favoritesError,
    fetchFavorites,
    removeFavorite,
  } = useFavoriteFreelancers();

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const favoritePreview = Array.isArray(favorites) ? favorites.slice(0, 3) : [];
  const myProjectsPreview = Array.isArray(myProjects) ? myProjects.slice(0, 3) : [];

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow={dateLabel}
        title={`Good morning, ${firstName}`}
        actions={
          <Button to="/projects/new" icon={Plus}>
            Post a job
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Open job posts"
          value={stats.jobPosts.value}
          icon={Briefcase}
          iconTone="brand"
          delta={stats.jobPosts.delta}
          deltaDir={stats.jobPosts.deltaDir}
        />
        <StatCard
          label="Pending proposals"
          value={stats.proposals.value}
          icon={Send}
          iconTone="sky"
          delta={stats.proposals.delta}
          deltaDir={stats.proposals.deltaDir}
        />
        <StatCard
          label="Active contracts"
          value={stats.activeContracts.value}
          icon={Users}
          iconTone="violet"
          delta={stats.activeContracts.delta}
          deltaDir={stats.activeContracts.deltaDir}
        />
        <StatCard
          label="Completed contracts"
          value={stats.completedContracts.value}
          icon={ShieldCheck}
          iconTone="brand"
          delta={stats.completedContracts.delta}
          deltaDir={stats.completedContracts.deltaDir}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card
          className="xl:col-span-2"
          title="Needs attention"
          icon={Clock3}
          bodyClassName="p-0"
        >
          {needsAttention.length ? (
            <ul className="divide-y divide-line">
              {needsAttention.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-4 px-5 py-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                          ATTENTION_TONE_CLASS[item.tone] ?? ATTENTION_TONE_CLASS.brand
                        }`}
                      >
                        Action
                      </span>
                      <p className="font-semibold text-slate-900">{item.title}</p>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                  </div>
                  <div className="shrink-0">
                    <Button to={item.to} variant="outline" size="sm">
                      {item.cta}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-5 py-6 text-sm text-slate-500">
              No urgent actions right now.
            </div>
          )}
        </Card>

        <Card title="Recent activity" icon={FileText} bodyClassName="p-0">
          {recentActivity.length ? (
            <ul className="divide-y divide-line">
              {recentActivity.map((item) => (
                <li key={item.id} className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Badge tone={item.tone ?? 'slate'}>{item.label}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{item.text}</p>
                  <Button to={item.to} variant="link" size="link" className="mt-2">
                    Open
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-5 py-6 text-sm text-slate-500">
              Activity will appear here as you post jobs and manage contracts.
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card
          className="lg:col-span-2"
          title="All projects"
          icon={Briefcase}
          bodyClassName="p-0"
          action={
            <Button to="/projects" variant="link" size="link">
              View all
            </Button>
          }
        >
          {recentProjects.length ? (
            <>
              <ul className="divide-y divide-line">
                {recentProjects.map((post) => (
                  <li
                    key={post.id}
                    className="flex items-start justify-between gap-4 px-5 py-4"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold text-slate-900">{post.title}</p>
                        <Badge tone={STATUS_TONE[post.status] ?? 'slate'}>
                          {post.status}
                        </Badge>
                      </div>
                      {post.tags?.length ? (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {post.tags.map((tag) => (
                            <Badge key={tag} tone="slate">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-semibold text-slate-900">{post.budget || '—'}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="border-t border-line px-5 py-4">
                <Button to="/projects/new" variant="outline" size="sm" icon={Plus}>
                  New job post
                </Button>
              </div>
            </>
          ) : (
            <div className="px-5 py-6 text-sm text-slate-500">
              No projects visible yet.
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card
            title="My projects"
            icon={FileText}
            bodyClassName="p-0"
            action={
              <Button to="/projects/my-projects" variant="link" size="link">
                View all
              </Button>
            }
          >
            {myProjectsPreview.length ? (
              <ul className="divide-y divide-line">
                {myProjectsPreview.map((post) => (
                  <li
                    key={post.id}
                    className="flex items-start justify-between gap-4 px-5 py-4"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold text-slate-900">{post.title}</p>
                        <Badge tone={STATUS_TONE[post.status] ?? 'slate'}>
                          {post.status}
                        </Badge>
                      </div>
                      {post.tags?.length ? (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {post.tags.map((tag) => (
                            <Badge key={tag} tone="slate">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="font-semibold text-slate-900">{post.budget || '—'}</p>
                      {post.id ? (
                        <Link
                          to={`/projects/${post.id}`}
                          className="mt-2 inline-flex rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                        >
                          Open
                        </Link>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-5 py-6 text-sm text-slate-500">
                You have not posted any projects yet.
              </div>
            )}
          </Card>

          <Card
            title={
              talentView === 'recommended'
                ? 'Recommended talent'
                : 'Favorite freelancers'
            }
            icon={talentView === 'recommended' ? Users : Heart}
            bodyClassName="p-0"
            action={
              talentView === 'recommended' ? (
                <Button to="/freelancers" variant="link" size="link">
                  Browse all
                </Button>
              ) : (
                <Button to="/favorite-freelancers" variant="link" size="link">
                  View all
                </Button>
              )
            }
          >
            {talentView === 'recommended' ? (
              <ul className="divide-y divide-line">
                {talent.map((person) => (
                  <li key={person.id} className="flex items-center gap-3 px-5 py-4">
                    <Avatar name={person.name} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <p className="truncate font-semibold text-slate-900">
                          {person.name}
                        </p>
                        {person.verified ? (
                          <CheckCircle2
                            className="h-4 w-4 shrink-0 text-brand-600"
                            aria-hidden="true"
                          />
                        ) : null}
                      </div>
                      <p className="text-xs text-slate-500">{person.role}</p>
                      <RatingStars rating={person.rating} size="sm" className="mt-0.5" />
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-slate-900">
                        {person.rate || 'View profile'}
                      </p>
                      <Button
                        to="/freelancers"
                        variant="outline"
                        size="sm"
                        className="mt-1"
                      >
                        View
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : favoritesLoading ? (
              <div className="px-5 py-6 text-sm text-slate-500">
                Loading favorite freelancers...
              </div>
            ) : favoritesError ? (
              <div className="px-5 py-6 text-sm text-rose-600">
                {favoritesError}
              </div>
            ) : favoritePreview.length ? (
              <ul className="divide-y divide-line">
                {favoritePreview.map((person) => {
                  const personKey =
                    person.favoriteFreelancerID ??
                    person.freelancerID ??
                    person.id;

                  const personId =
                    person.freelancerID ??
                    person.id ??
                    person.favoriteFreelancerID;

                  return (
                    <li key={personKey} className="flex items-center gap-3 px-5 py-4">
                      <Avatar name={person.name} size="md" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <p className="truncate font-semibold text-slate-900">
                            {person.name}
                          </p>
                          {person.verified ? (
                            <CheckCircle2
                              className="h-4 w-4 shrink-0 text-brand-600"
                              aria-hidden="true"
                            />
                          ) : null}
                        </div>
                        <p className="text-xs text-slate-500">
                          {person.role || person.profession || 'Freelancer'}
                        </p>
                        <RatingStars
                          rating={person.rating ?? person.averageRating ?? 0}
                          size="sm"
                          className="mt-0.5"
                        />
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold text-slate-900">
                          {person.rate ||
                            (person.hourlyRate ? `$${person.hourlyRate}/hr` : 'Saved')}
                        </p>
                        <Button
                          to="/favorite-freelancers"
                          variant="outline"
                          size="sm"
                          className="mt-1"
                        >
                          Open
                        </Button>
                        <button
                          type="button"
                          disabled={isToggling || !personId}
                          onClick={() => removeFavorite(personId)}
                          className="mt-2 block w-full text-xs font-semibold text-rose-600 transition hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="px-5 py-6 text-sm text-slate-500">
                No favorite freelancers yet.
              </div>
            )}

            <div className="border-t border-line px-5 py-3">
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setTalentView('recommended')}
                  aria-label="Show recommended talent"
                  className={`h-2.5 w-2.5 rounded-full transition-all ${
                    talentView === 'recommended'
                      ? 'bg-brand-600 ring-4 ring-brand-100'
                      : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setTalentView('favorites')}
                  aria-label="Show favorite freelancers"
                  className={`h-2.5 w-2.5 rounded-full transition-all ${
                    talentView === 'favorites'
                      ? 'bg-brand-600 ring-4 ring-brand-100'
                      : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              </div>
            </div>
          </Card>

          <div className="rounded-2xl bg-brand-900 p-5 text-white shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-brand-200" aria-hidden="true" />
              <h2 className="text-sm font-semibold">Escrow protection</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-brand-100">
              <span className="font-semibold text-white">{escrow.amountLabel}</span>{' '}
              {escrow.text}
            </p>
            <Button to="/spending" variant="inverse" className="mt-4">
              Manage escrow
            </Button>
          </div>
        </div>
      </div>

      <Card
        title="Active hires"
        icon={Users}
        bodyClassName="p-0"
        action={
          <Button to="/contracts" variant="link" size="link">
            View all
          </Button>
        }
      >
        {activeHires.length ? (
          <ul className="divide-y divide-line">
            {activeHires.map((hire) => {
              const contractId =
                hire.contractID ??
                hire.contractId ??
                hire.ContractID ??
                hire.id;

              return (
                <li
                  key={contractId ?? hire.title}
                  className="flex items-start justify-between gap-4 px-5 py-4"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-semibold text-slate-900">{hire.title}</p>
                      <Badge tone={STATUS_TONE[hire.status] ?? 'slate'}>
                        {hire.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{hire.freelancerName}</p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="font-semibold text-slate-900">{hire.amount || '—'}</p>

                    {contractId ? (
                      <Link
                        to={`/contracts/${contractId}`}
                        className="mt-2 inline-flex rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        Open
                      </Link>
                    ) : (
                      <span className="mt-2 inline-flex rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-400">
                        Unavailable
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="px-5 py-6 text-sm text-slate-500">
            No active hires yet.
          </div>
        )}
      </Card>
    </div>
  );
}