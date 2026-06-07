import { ShieldCheck, Users, Flag, Briefcase, FileText } from 'lucide-react';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import { PageHeading } from '../../components/ui/PageHeading';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

const ENTITY_TONE = {
  Project: 'emerald',
  Freelancer: 'sky',
  Client: 'violet',
  Review: 'amber',
  User: 'blue',
};

const STATUS_TONE = {
  Pending: 'amber',
  Open: 'amber',
  Resolved: 'emerald',
  Dismissed: 'slate',
  Rejected: 'rose',
};

export default function AdminPanelPage() {
  const { stats, moderation, flaggedCount } = useAdminDashboard();

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="Platform overview"
        title="Trust & Safety control"
        actions={
          <Button to="/admin/reports" icon={ShieldCheck}>
            Review queue
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Users" value={stats.users.toLocaleString()} icon={Users} iconTone="sky" />
        <StatCard label="Jobs posted" value={stats.jobsPosted.toLocaleString()} icon={Briefcase} iconTone="violet" />
        <StatCard label="Contracts" value={stats.contracts.toLocaleString()} icon={FileText} iconTone="brand" />
        <StatCard label="Flagged reports" value={stats.flagged.toLocaleString()} icon={Flag} iconTone="rose" />
      </div>

      <Card
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
        {moderation.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-slate-500">No open reports. Nice and quiet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-5 py-2 font-medium">Type</th>
                  <th className="py-2 pr-4 font-medium">Reason</th>
                  <th className="py-2 pr-4 font-medium">Reported by</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 font-medium">When</th>
                  <th className="py-2 pr-5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {moderation.map((row) => (
                  <tr key={row.id}>
                    <td className="whitespace-nowrap px-5 py-3">
                      <Badge tone={ENTITY_TONE[row.type] ?? 'slate'}>{row.type}</Badge>
                    </td>
                    <td className="py-3 pr-4 text-slate-700">{row.reason}</td>
                    <td className="whitespace-nowrap py-3 pr-4 text-slate-500">{row.reportedBy}</td>
                    <td className="whitespace-nowrap py-3 pr-4">
                      <Badge tone={STATUS_TONE[row.status] ?? 'slate'}>{row.status}</Badge>
                    </td>
                    <td className="whitespace-nowrap py-3 pr-4 text-slate-400">{row.date}</td>
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
        )}
      </Card>
    </div>
  );
}
