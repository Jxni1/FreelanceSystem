import { Plus, Briefcase, Send, ShieldCheck, Users, CheckCircle2 } from 'lucide-react';
import { useClientDashboard } from '../../hooks/useClientDashboard';
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
};

export default function ClientHomePage() {
  const { firstName, dateLabel, stats, jobPosts, talent, escrow } = useClientDashboard();

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active job posts" value={stats.jobPosts.value} icon={Briefcase} iconTone="brand" delta={stats.jobPosts.delta} deltaDir={stats.jobPosts.deltaDir} />
        <StatCard label="New proposals" value={stats.proposals.value} icon={Send} iconTone="sky" delta={stats.proposals.delta} deltaDir={stats.proposals.deltaDir} />
        <StatCard label="Funds in escrow" value={stats.escrow.value} icon={ShieldCheck} iconTone="brand" delta={stats.escrow.delta} deltaDir={stats.escrow.deltaDir} />
        <StatCard label="Active hires" value={stats.hires.value} icon={Users} iconTone="violet" delta={stats.hires.delta} deltaDir={stats.hires.deltaDir} />
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
          <ul className="divide-y divide-line">
            {jobPosts.map((post) => (
              <li key={post.id} className="flex items-start justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-semibold text-slate-900">{post.title}</p>
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
                <div className="shrink-0 text-right">
                  <p className="font-semibold text-slate-900">{post.budget}</p>
                  <p className="mt-0.5 text-xs font-medium text-brand-700">{post.proposals} proposals</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="border-t border-line px-5 py-4">
            <Button to="/projects/new" variant="outline" size="sm" icon={Plus}>
              New job post
            </Button>
          </div>
        </Card>

        <div className="space-y-6">
          <Card title="Recommended talent" icon={Users} bodyClassName="p-0">
            <ul className="divide-y divide-line">
              {talent.map((person) => (
                <li key={person.id} className="flex items-center gap-3 px-5 py-4">
                  <Avatar name={person.name} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <p className="truncate font-semibold text-slate-900">{person.name}</p>
                      {person.verified ? <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" /> : null}
                    </div>
                    <p className="text-xs text-slate-500">{person.role}</p>
                    <RatingStars rating={person.rating} size="sm" className="mt-0.5" />
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-slate-900">{person.rate}</p>
                    <Button to="/freelancers" variant="outline" size="sm" className="mt-1">
                      View
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <div className="rounded-2xl bg-brand-900 p-5 text-white shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-brand-200" aria-hidden="true" />
              <h2 className="text-sm font-semibold">Escrow protection</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-brand-100">
              <span className="font-semibold text-white">{escrow.amountLabel}</span> {escrow.text}
            </p>
            <Button to="/spending" variant="inverse" className="mt-4">
              Manage escrow
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
