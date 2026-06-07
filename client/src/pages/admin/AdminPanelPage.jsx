import { Download, ShieldCheck, TrendingUp, Users, Flag, Briefcase, BarChart2 } from 'lucide-react';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import { PageHeading } from '../../components/ui/PageHeading';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Button } from '../../components/ui/Button';

const TYPE_TONE = {
  'Job post': 'emerald',
  Freelancer: 'sky',
  Dispute: 'rose',
  Client: 'violet',
  Review: 'amber',
};

const REASON_TONE = {
  'Spam / scam': 'rose',
  Plagiarism: 'amber',
  Payment: 'sky',
  Policy: 'violet',
  Integrity: 'blue',
};

export default function AdminPanelPage() {
  const { stats, moderation, health, escalated, flaggedCount } = useAdminDashboard();

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="Platform overview · last 30 days"
        title="Trust & Safety control"
        actions={
          <>
            <Button variant="outline" icon={Download}>
              Export
            </Button>
            <Button to="/admin/reports" icon={ShieldCheck}>
              Review queue
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Gross marketplace volume" value={stats.grossVolume.value} icon={TrendingUp} iconTone="emerald" delta={stats.grossVolume.delta} deltaDir={stats.grossVolume.deltaDir} />
        <StatCard label="Active users (30d)" value={stats.activeUsers.value} icon={Users} iconTone="sky" delta={stats.activeUsers.delta} deltaDir={stats.activeUsers.deltaDir} />
        <StatCard label="Open disputes" value={stats.openDisputes.value} icon={Flag} iconTone="rose" delta={stats.openDisputes.delta} deltaDir={stats.openDisputes.deltaDir} />
        <StatCard label="Jobs posted" value={stats.jobsPosted.value} icon={Briefcase} iconTone="violet" delta={stats.jobsPosted.delta} deltaDir={stats.jobsPosted.deltaDir} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card
          className="lg:col-span-2"
          bodyClassName="p-0"
          title="Moderation queue"
          icon={ShieldCheck}
          badge={<Badge tone="amber">{flaggedCount} flagged</Badge>}
          action={
            <Button to="/admin/reports" variant="link" size="link">
              Triage all
            </Button>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-5 py-2 font-medium">Type</th>
                  <th className="py-2 pr-4 font-medium">Item</th>
                  <th className="py-2 pr-4 font-medium">Subject</th>
                  <th className="py-2 pr-4 font-medium">Reason</th>
                  <th className="py-2 pr-5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {moderation.map((row) => (
                  <tr key={row.id}>
                    <td className="whitespace-nowrap px-5 py-3">
                      <Badge tone={TYPE_TONE[row.type] ?? 'slate'}>{row.type}</Badge>
                    </td>
                    <td className="whitespace-nowrap py-3 pr-4 text-slate-700">{row.item}</td>
                    <td className="whitespace-nowrap py-3 pr-4 text-slate-500">{row.subject}</td>
                    <td className="whitespace-nowrap py-3 pr-4">
                      <Badge tone={REASON_TONE[row.reason] ?? 'slate'}>{row.reason}</Badge>
                    </td>
                    <td className="py-3 pr-5 text-right">
                      <Button to="/admin/reports" variant="outline" size="sm">
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-6">
          <Card title="Marketplace health" icon={BarChart2}>
            <ul className="space-y-4">
              {health.map((metric) => (
                <li key={metric.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">{metric.label}</span>
                    <span className="font-semibold text-slate-900 tabular-nums">{metric.value}</span>
                  </div>
                  <ProgressBar value={metric.percent} tone={metric.tone} className="mt-1.5" />
                </li>
              ))}
            </ul>
          </Card>

          <div className="rounded-2xl border border-clay-100 bg-clay-50 p-5">
            <div className="flex items-center gap-2 text-clay-600">
              <Flag className="h-5 w-5" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-slate-900">{escalated.count} disputes escalated</h2>
            </div>
            <p className="mt-2 text-sm text-slate-600">{escalated.text}</p>
            <Button variant="accent" className="mt-4">
              Resolve now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
