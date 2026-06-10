import {
  Search,
  DollarSign,
  FileText,
  Send,
  Award,
  Zap,
  Gauge,
  CheckCircle2,
  Circle,
  Briefcase,
  ArrowRight,
  Clock3,
  BarChart3,
} from 'lucide-react';
import { useFreelancerDashboard } from '../../hooks/useFreelancerDashboard';
import { PageHeading } from '../../components/ui/PageHeading';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Button } from '../../components/ui/Button';

function formatMoney(value) {
  return typeof value === 'number' ? `$${value.toLocaleString()}` : value || '—';
}

function formatSubmittedDate(value) {
  if (!value) return 'Recently';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function FreelancerHomePage() {
  const {
    firstName,
    stats,
    pipeline,
    activeContract,
    recentProposals,
    profileStrength,
    quickActions,
  } = useFreelancerDashboard();

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
        <StatCard
          label="This month"
          value={stats.earnings.value}
          icon={DollarSign}
          iconTone="brand"
          delta={stats.earnings.delta}
          deltaDir={stats.earnings.deltaDir}
        />
        <StatCard
          label="Active contracts"
          value={stats.activeContracts.value}
          icon={FileText}
          iconTone="sky"
          delta={stats.activeContracts.delta}
          deltaDir={stats.activeContracts.deltaDir}
        />
        <StatCard
          label="Proposals out"
          value={stats.proposalsOut.value}
          icon={Send}
          iconTone="violet"
          delta={stats.proposalsOut.delta}
          deltaDir={stats.proposalsOut.deltaDir}
        />
        <StatCard
          label="Proposal success"
          value={stats.proposalSuccess.value}
          icon={Briefcase}
          iconTone="amber"
          delta={stats.proposalSuccess.delta}
          deltaDir={stats.proposalSuccess.deltaDir}
        />
        <StatCard
          label="Job success"
          value={stats.jobSuccess.value}
          icon={Award}
          iconTone="brand"
          delta={stats.jobSuccess.delta}
          deltaDir={stats.jobSuccess.deltaDir}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <Card
              className="lg:col-span-3"
              title="Quick actions"
              icon={Zap}
              action={<Badge tone="brand">Your workspace</Badge>}
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {quickActions.map((action) => (
                  <Button
                    key={action.label}
                    to={action.to}
                    variant={action.variant}
                    className="justify-between"
                  >
                    <span>{action.label}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ))}
              </div>

              <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Focus on profile updates, active contracts, and sending better proposals — not just more proposals.
              </div>
            </Card>

            <Card
              className="lg:col-span-2"
              title="Profile strength"
              icon={Gauge}
              action={
                <span className="text-sm font-semibold text-brand-700">
                  {profileStrength.percent}%
                </span>
              }
            >
              <ProgressBar value={profileStrength.percent} tone="brand" />
              <ul className="mt-4 space-y-2.5">
                {profileStrength.checklist.slice(0, 4).map((item) => (
                  <li key={item.label} className="flex items-center gap-2 text-sm">
                    {item.done ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                    ) : (
                      <Circle className="h-4 w-4 shrink-0 text-slate-300" aria-hidden="true" />
                    )}
                    <span className={item.done ? 'text-slate-700' : 'text-slate-500'}>
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>

              <Button to="/profile" variant="soft" className="mt-4 w-full">
                Complete profile
              </Button>
            </Card>
          </div>

          <Card
            title="Active contract"
            icon={FileText}
            action={<Badge tone="brand">{activeContract.status}</Badge>}
          >
            <div className="space-y-4">
              <div>
                <p className="text-base font-semibold text-slate-900">{activeContract.title}</p>
                <p className="mt-1 text-sm text-slate-500">
                  Client: <span className="font-medium text-slate-700">{activeContract.clientName}</span>
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Milestone {activeContract.milestoneCurrent} of {activeContract.milestoneTotal} · due {activeContract.due}
                </p>
              </div>

              <ProgressBar value={progressPct} tone="brand" />

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">{formatMoney(activeContract.earned)} earned</span>
                <span className="font-semibold text-slate-900">{formatMoney(activeContract.total)}</span>
              </div>

              <Button to="/contracts" variant="soft" className="w-full sm:w-auto">
                Submit milestone
              </Button>
            </div>
          </Card>

          <Card
            title="Recent proposals"
            icon={Send}
            bodyClassName="p-0"
            action={<Badge tone="slate">{stats.proposalsOut.value} total</Badge>}
          >
            {recentProposals.length > 0 ? (
              <ul className="divide-y divide-line">
                {recentProposals.map((proposal) => (
                  <li key={proposal.id} className="flex items-center justify-between gap-4 px-5 py-4">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">{proposal.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                        <span>{proposal.clientName}</span>
                        <span>•</span>
                        <span>{formatSubmittedDate(proposal.submittedAt)}</span>
                        {proposal.budget ? (
                          <>
                            <span>•</span>
                            <span className="font-medium text-slate-700">{formatMoney(proposal.budget)}</span>
                          </>
                        ) : null}
                      </div>
                    </div>

                    <Badge tone={proposal.tone}>{proposal.status}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-5 py-6 text-sm text-slate-500">
                No proposals yet. Start applying to projects to build your pipeline.
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6 xl:col-span-4">
          <Card
            title="Proposal pipeline"
            icon={BarChart3}
            action={<Badge tone="brand">Live</Badge>}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-600">Pending</span>
                <span className="text-base font-semibold text-slate-900">{pipeline.pending}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-600">Accepted</span>
                <span className="text-base font-semibold text-emerald-600">{pipeline.accepted}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-600">Rejected</span>
                <span className="text-base font-semibold text-rose-600">{pipeline.rejected}</span>
              </div>

              <Button to="/my-work" variant="soft" className="mt-2 w-full">
                View all proposals
              </Button>
            </div>
          </Card>

          <Card title="Today focus" icon={Clock3}>
            <div className="space-y-2 text-sm text-slate-600">
              <p>Keep your profile polished so clients trust you faster.</p>
              <p>Stay on top of current work before taking on too many new offers.</p>
              <p>Use your proposal page to review what is converting and what is not.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}