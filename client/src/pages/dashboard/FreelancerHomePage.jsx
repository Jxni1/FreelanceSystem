import {
  Search,
  DollarSign,
  FileText,
  Send,
  Eye,
  Award,
  Zap,
  Gauge,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { useFreelancerDashboard } from '../../hooks/useFreelancerDashboard';
import { PageHeading } from '../../components/ui/PageHeading';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { RatingStars } from '../../components/ui/RatingStars';
import { Button } from '../../components/ui/Button';

function formatMoney(value) {
  return typeof value === 'number' ? `$${value.toLocaleString()}` : value;
}

export default function FreelancerHomePage() {
  const { firstName, stats, matches, activeContract, profileStrength } = useFreelancerDashboard();

  const progressPct = activeContract.total
    ? Math.round((activeContract.earned / activeContract.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow={
          <>
            Available for work · <span className="font-medium text-brand-700">Open to offers</span>
          </>
        }
        title={`Welcome back, ${firstName}`}
        actions={
          <Button to="/discover" icon={Search}>
            Find work
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        <StatCard label="This month" value={stats.earnings.value} icon={DollarSign} iconTone="brand" delta={stats.earnings.delta} deltaDir={stats.earnings.deltaDir} />
        <StatCard label="Active contracts" value={stats.activeContracts.value} icon={FileText} iconTone="sky" delta={stats.activeContracts.delta} deltaDir={stats.activeContracts.deltaDir} />
        <StatCard label="Proposals out" value={stats.proposalsOut.value} icon={Send} iconTone="violet" delta={stats.proposalsOut.delta} deltaDir={stats.proposalsOut.deltaDir} />
        <StatCard label="Profile views" value={stats.profileViews.value} icon={Eye} iconTone="amber" delta={stats.profileViews.delta} deltaDir={stats.profileViews.deltaDir} />
        <StatCard label="Job success" value={stats.jobSuccess.value} icon={Award} iconTone="brand" delta={stats.jobSuccess.delta} deltaDir={stats.jobSuccess.deltaDir} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card
          className="lg:col-span-2"
          title="Best matches for you"
          icon={Zap}
          bodyClassName="p-0"
          action={<Badge tone="brand">Updated hourly</Badge>}
        >
          <ul className="divide-y divide-line">
            {matches.map((match) => (
              <li key={match.id} className="flex items-start justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-semibold text-slate-900">{match.title}</p>
                    <Badge tone="brand" icon={Zap}>{match.match}% match</Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                    <span>{match.company}</span>
                    <RatingStars rating={match.rating} size="sm" showValue={false} />
                    <span className="font-semibold text-slate-900">{match.rate}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {match.tags.map((tag) => (
                      <Badge key={tag} tone="slate">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button to="/discover" variant="accent" size="sm" className="shrink-0">
                  Apply
                </Button>
              </li>
            ))}
          </ul>
        </Card>

        <div className="space-y-6">
          <Card title="Active contract" icon={FileText}>
            <p className="font-semibold text-slate-900">{activeContract.title}</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Milestone {activeContract.milestoneCurrent} of {activeContract.milestoneTotal} · due {activeContract.due}
            </p>
            <ProgressBar value={progressPct} tone="brand" className="mt-3" />
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-slate-500">{formatMoney(activeContract.earned)} earned</span>
              <span className="font-semibold text-slate-900">{formatMoney(activeContract.total)}</span>
            </div>
            <Button to="/contracts" variant="soft" className="mt-4 w-full">
              Submit milestone
            </Button>
          </Card>

          <Card title="Profile strength" icon={Gauge} action={<span className="text-sm font-semibold text-brand-700">{profileStrength.percent}%</span>}>
            <ProgressBar value={profileStrength.percent} tone="brand" />
            <ul className="mt-4 space-y-2.5">
              {profileStrength.checklist.map((item) => (
                <li key={item.label} className="flex items-center gap-2 text-sm">
                  {item.done ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-slate-300" aria-hidden="true" />
                  )}
                  <span className={item.done ? 'text-slate-700' : 'text-slate-500'}>{item.label}</span>
                  {item.hint ? <span className="ml-auto text-xs font-medium text-brand-700">{item.hint}</span> : null}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
