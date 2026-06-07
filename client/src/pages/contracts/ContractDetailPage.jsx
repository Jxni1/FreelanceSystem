import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MessageSquare, Pencil, GitBranch, Trash2, ArrowRight, CalendarDays, FileText } from 'lucide-react';
import { useContracts } from '../../hooks/useContracts';
import { useMilestones } from '../../hooks/useMilestones';
import { useAuthorization } from '../../hooks/useAuthorization';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { ProgressBar } from '../../components/ui/ProgressBar';

const STATUS_TONE = {
  Active: 'emerald',
  Pending: 'amber',
  Completed: 'blue',
  Cancelled: 'rose',
};

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatMoney(value) {
  const n = Number(value);
  return Number.isFinite(n) ? `$${n.toLocaleString()}` : '—';
}

function durationDays(start, end) {
  if (!start || !end) return null;
  const a = new Date(start).getTime();
  const b = new Date(end).getTime();
  if (Number.isNaN(a) || Number.isNaN(b) || b < a) return null;
  return Math.round((b - a) / 86400000);
}

const MILESTONE_LABEL = {
  Draft: 'Draft',
  PendingPayment: 'Awaiting funding',
  Funded: 'Funded',
  Submitted: 'Submitted',
  Approved: 'Approved',
  Cancelled: 'Cancelled',
};

function milestoneTone(m) {
  if (m.isOverdue && m.status !== 'Approved' && m.status !== 'Cancelled') return 'rose';
  switch (m.status) {
    case 'Approved':
      return 'emerald';
    case 'Submitted':
      return 'blue';
    case 'Funded':
      return 'sky';
    case 'PendingPayment':
      return 'amber';
    case 'Cancelled':
      return 'rose';
    default:
      return 'slate';
  }
}

export default function ContractDetailsPage() {
  const params = useParams();
  const id = params.id || params.contractId || '';
  const navigate = useNavigate();

  const { selectedContract, isDetailsLoading, error, fetchContractById, deleteContract } = useContracts();
  const { milestones, fetchMilestonesByContract } = useMilestones();

  const contract = selectedContract;
  const isLoading = isDetailsLoading;

  const { isAdmin } = useAuthorization();
  const contractsPath = isAdmin ? '/admin/contracts' : '/contracts';

  useEffect(() => {
    if (!id) return;
    fetchContractById(id);
    fetchMilestonesByContract(id).catch(() => {});
  }, [id, fetchContractById, fetchMilestonesByContract]);

  const handleDelete = async () => {
    if (!id) return;
    if (window.confirm('Are you sure you want to delete this contract?')) {
      try {
        await deleteContract(id);
        navigate(contractsPath);
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-brand-100 border-t-brand-700" aria-hidden="true" />
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card className="border-rose-200 bg-rose-50">
          <p className="font-semibold text-rose-700">Contract not found</p>
          <p className="mt-1 text-sm text-rose-600">
            {typeof error === 'string' ? error : error?.message || 'This contract could not be loaded.'}
          </p>
          <Button to={contractsPath} variant="outline" size="sm" className="mt-3">
            Back to contracts
          </Button>
        </Card>
      </div>
    );
  }

  const editPath = isAdmin ? `/admin/contracts/${contract.contractID}/edit` : `/contracts/${contract.contractID}/edit`;
  const workflowPath = isAdmin
    ? `/admin/contracts/${contract.contractID}/workflow`
    : `/contracts/${contract.contractID}/workflow`;

  const total = Number(contract.agreedPrice) || 0;
  const earned = milestones
    .filter((m) => m.status === 'Approved')
    .reduce((sum, m) => sum + (Number(m.amount) || 0), 0);
  const approvedCount = milestones.filter((m) => m.status === 'Approved').length;
  const paidPct = total > 0 ? (earned / total) * 100 : 0;
  const days = durationDays(contract.start_Date, contract.end_Date);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Breadcrumbs items={[{ label: 'Contracts', to: contractsPath }, { label: contract.projectTitle || 'Contract details' }]} />

      <Card>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900">{contract.projectTitle || 'Contract'}</h1>
              <Badge tone={STATUS_TONE[contract.status] || 'slate'}>{contract.status || 'Unknown'}</Badge>
            </div>
            <p className="mt-1 font-mono text-xs text-slate-400">#{contract.contractID}</p>

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
              <span className="inline-flex items-center gap-2">
                <Avatar name={contract.clientName} size="sm" />
                <span>
                  <span className="block text-[11px] uppercase tracking-wider text-slate-400">Client</span>
                  <span className="font-medium text-slate-900">{contract.clientName || '—'}</span>
                </span>
              </span>
              <ArrowRight className="h-4 w-4 text-slate-300" aria-hidden="true" />
              <span className="inline-flex items-center gap-2">
                <Avatar name={contract.freelancerName} size="sm" />
                <span>
                  <span className="block text-[11px] uppercase tracking-wider text-slate-400">Freelancer</span>
                  <span className="font-medium text-slate-900">{contract.freelancerName || '—'}</span>
                </span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button to={workflowPath} icon={GitBranch}>
              Workflow
            </Button>
            {!isAdmin ? (
              <Button to={`/chat/new?contractId=${contract.contractID}`} variant="outline" icon={MessageSquare}>
                Message
              </Button>
            ) : null}
            <Button to={editPath} variant="outline" icon={Pencil}>
              Edit
            </Button>
            {isAdmin ? (
              <Button
                as="button"
                type="button"
                variant="outline"
                icon={Trash2}
                className="text-rose-600 hover:bg-rose-50"
                onClick={handleDelete}
              >
                Delete
              </Button>
            ) : null}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card title="Description">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
              {contract.description || 'No description provided.'}
            </p>
          </Card>

          <Card
            title="Milestones"
            action={
              <Button to={workflowPath} variant="link" size="link" iconRight={ArrowRight}>
                Manage
              </Button>
            }
          >
            {milestones.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                  <FileText className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="text-sm text-slate-500">No milestones yet.</p>
                <Button to={workflowPath} variant="soft" size="sm">
                  Set up milestones
                </Button>
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {[...milestones]
                  .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
                  .map((m) => (
                    <li key={m.milestoneID} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">{m.title}</p>
                        <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-slate-400">
                          <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                          Due {formatDate(m.dueDate)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="text-sm font-semibold text-slate-900 tabular-nums">{formatMoney(m.amount)}</span>
                        <Badge tone={milestoneTone(m)}>
                          {m.isOverdue && m.status !== 'Approved' && m.status !== 'Cancelled'
                            ? 'Overdue'
                            : MILESTONE_LABEL[m.status] || m.status}
                        </Badge>
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </Card>

          {contract.projectID ? (
            <Card title="Project">
              <Link
                to={`/projects/${contract.projectID}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800"
              >
                {contract.projectTitle ?? 'View project'}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Card>
          ) : null}
        </div>

        <div className="space-y-5">
          <Card>
            <p className="text-xs font-medium text-slate-500">Contract value</p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">{formatMoney(total)}</p>
            {milestones.length > 0 ? (
              <div className="mt-4">
                <ProgressBar value={paidPct} tone="emerald" />
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    {approvedCount} / {milestones.length} milestones paid
                  </span>
                  <span className="font-semibold text-slate-900 tabular-nums">{formatMoney(earned)}</span>
                </div>
              </div>
            ) : null}
          </Card>

          <Card title="Timeline">
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Start</dt>
                <dd className="font-medium text-slate-900">{formatDate(contract.start_Date)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">End</dt>
                <dd className="font-medium text-slate-900">{formatDate(contract.end_Date)}</dd>
              </div>
              {days != null ? (
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Duration</dt>
                  <dd className="font-medium text-slate-900">{days} days</dd>
                </div>
              ) : null}
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
