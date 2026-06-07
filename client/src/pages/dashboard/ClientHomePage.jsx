import { Plus, Briefcase, Send, FileText, Users } from 'lucide-react';
import { useClientDashboard } from '../../hooks/useClientDashboard';
import { PageHeading } from '../../components/ui/PageHeading';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { RatingStars } from '../../components/ui/RatingStars';
import { Button } from '../../components/ui/Button';

const STATUS_TONE = {
  Open: 'emerald',
  InProgress: 'sky',
  Completed: 'slate',
  Cancelled: 'rose',
};

export default function ClientHomePage() {
  const { firstName, dateLabel, stats, jobPosts, talent, contractsSummary } = useClientDashboard();

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow={dateLabel}
        title={`Welcome back, ${firstName}`}
        actions={
          <Button to="/projects/new" icon={Plus}>
            Post a job
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Job posts" value={stats.jobPosts} icon={Briefcase} iconTone="brand" />
        <StatCard label="Proposals received" value={stats.proposals} icon={Send} iconTone="sky" />
        <StatCard label="Active contract value" value={`$${stats.activeValue.toLocaleString()}`} icon={FileText} iconTone="brand" />
        <StatCard label="Active hires" value={stats.activeHires} icon={Users} iconTone="violet" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card
          className="lg:col-span-2"
          title="Your job posts"
          icon={Briefcase}
          bodyClassName="p-0"
          action={
            <Button to="/projects" variant="link" size="link">
              View all
            </Button>
          }
        >
          {jobPosts.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
              <p className="text-sm text-slate-500">You haven’t posted any jobs yet.</p>
              <Button to="/projects/new" size="sm" icon={Plus}>
                Post your first job
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {jobPosts.map((post) => (
                <li key={post.id} className="flex items-start justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Button to={`/projects/${post.id}`} variant="link" size="link" className="truncate font-semibold text-slate-900 hover:text-brand-700">
                        {post.title}
                      </Button>
                      <Badge tone={STATUS_TONE[post.status] ?? 'slate'}>{post.status}</Badge>
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
                  {post.budget ? <p className="shrink-0 font-semibold text-slate-900">{post.budget}</p> : null}
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-line px-5 py-4">
            <Button to="/projects/new" variant="outline" size="sm" icon={Plus}>
              New job post
            </Button>
          </div>
        </Card>

        <div className="space-y-6">
          <Card title="Talent" icon={Users} bodyClassName="p-0">
            {talent.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-slate-500">No freelancers to show yet.</p>
            ) : (
              <ul className="divide-y divide-line">
                {talent.map((person) => (
                  <li key={person.id} className="flex items-center gap-3 px-5 py-4">
                    <Avatar name={person.name} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-900">{person.name}</p>
                      <p className="text-xs text-slate-500">{person.role}</p>
                      {person.rating > 0 ? <RatingStars rating={person.rating} size="sm" className="mt-0.5" /> : null}
                    </div>
                    <div className="shrink-0 text-right">
                      {person.rate ? <p className="text-sm font-semibold text-slate-900">{person.rate}</p> : null}
                      <Button to={`/freelancers/${person.id}`} variant="outline" size="sm" className="mt-1">
                        View
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <div className="rounded-2xl bg-brand-900 p-5 text-white shadow-sm">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-brand-200" aria-hidden="true" />
              <h2 className="text-sm font-semibold">Active contracts</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-brand-100">
              <span className="font-semibold text-white">{contractsSummary.count}</span>{' '}
              {contractsSummary.count === 1 ? 'contract' : 'contracts'} in progress ·{' '}
              <span className="font-semibold text-white">${contractsSummary.value.toLocaleString()}</span> contracted.
              Funds release per milestone as you approve the work.
            </p>
            <Button to="/contracts" variant="inverse" className="mt-4">
              View contracts
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
