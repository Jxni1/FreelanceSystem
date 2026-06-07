import { Search, DollarSign, FileText, Send, CheckCircle2, Circle, Briefcase, Gauge } from 'lucide-react';
import { useFreelancerDashboard } from '../../hooks/useFreelancerDashboard';
import { PageHeading } from '../../components/ui/PageHeading';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Button } from '../../components/ui/Button';

function formatMoney(value) {
  return typeof value === 'number' ? `$${value.toLocaleString()}` : value;
}

export default function FreelancerHomePage() {
  const { firstName, stats, latestProjects, activeContract, profileStrength } = useFreelancerDashboard();

  const progressPct = activeContract && activeContract.total
    ? Math.round((activeContract.earned / activeContract.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="Freelancer workspace"
        title={`Welcome back, ${firstName}`}
        actions={
          <Button to="/discover" icon={Search}>
            Find work
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active contracts" value={stats.activeContracts} icon={FileText} iconTone="sky" />
        <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} iconTone="brand" />
        <StatCard label="Proposals out" value={stats.proposalsOut} icon={Send} iconTone="violet" />
        <StatCard label="Active contract value" value={formatMoney(stats.activeValue)} icon={DollarSign} iconTone="brand" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card
          className="lg:col-span-2"
          title="Latest open projects"
          icon={Briefcase}
          bodyClassName="p-0"
          action={
            <Button to="/discover" variant="link" size="link">
              Browse all
            </Button>
          }
        >
          {latestProjects.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-slate-500">No open projects right now — check back soon.</p>
          ) : (
            <ul className="divide-y divide-line">
              {latestProjects.map((project) => (
                <li key={project.id} className="flex items-start justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <Button to={`/projects/${project.id}`} variant="link" size="link" className="truncate font-semibold text-slate-900 hover:text-brand-700">
                      {project.title}
                    </Button>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                      {project.company ? <span>{project.company}</span> : null}
                      {project.rate ? <span className="font-semibold text-slate-900">{project.rate}</span> : null}
                    </div>
                    {project.tags.length ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {project.tags.map((tag) => (
                          <Badge key={tag} tone="slate">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <Button to={`/projects/${project.id}`} variant="accent" size="sm" className="shrink-0">
                    View
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-6">
          <Card title="Active contract" icon={FileText}>
            {activeContract ? (
              <>
                <p className="font-semibold text-slate-900">{activeContract.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {activeContract.milestoneTotal > 0
                    ? `${activeContract.milestoneCurrent} of ${activeContract.milestoneTotal} milestones paid`
                    : 'No milestones yet'}{' '}
                  · due {activeContract.due}
                </p>
                <ProgressBar value={progressPct} tone="brand" className="mt-3" />
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-slate-500">{formatMoney(activeContract.earned)} earned</span>
                  <span className="font-semibold text-slate-900">{formatMoney(activeContract.total)}</span>
                </div>
                <Button to={`/contracts/${activeContract.id}/workflow`} variant="soft" className="mt-4 w-full">
                  Open workflow
                </Button>
              </>
            ) : (
              <div className="py-2 text-center">
                <p className="text-sm text-slate-500">No active contract yet.</p>
                <Button to="/discover" variant="soft" size="sm" className="mt-3">
                  Find work
                </Button>
              </div>
            )}
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
                </li>
              ))}
            </ul>
            <Button to="/profile/edit" variant="link" size="link" className="mt-3">
              Edit profile
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
