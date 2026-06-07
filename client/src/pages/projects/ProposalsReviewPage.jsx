import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, X, Check, Zap, Inbox } from 'lucide-react';
import { useProjects } from '../../hooks/useProjects';
import { useProposals } from '../../hooks/useProposals';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { PageHeading } from '../../components/ui/PageHeading';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { SegmentedTabs } from '../../components/ui/SegmentedTabs';

const STATUS_TONE = { Pending: 'amber', Accepted: 'emerald', Rejected: 'rose' };

function formatMoney(value) {
  const n = Number(value);
  return Number.isFinite(n) ? `$${n.toLocaleString()}` : '—';
}

function timeAgo(value) {
  if (!value) return '—';
  const diff = Date.now() - new Date(value).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  return new Date(value).toLocaleDateString();
}

function ProposalCard({ proposal, onHire, onDecline, busyKey }) {
  const actionable = proposal.status === 'Pending';
  return (
    <Card bodyClassName="p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-3">
            <Avatar name={proposal.name} size="lg" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-slate-900">{proposal.name}</p>
                <Badge tone={STATUS_TONE[proposal.status] || 'slate'}>{proposal.status}</Badge>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                {proposal.delivery != null ? `Delivery in ${proposal.delivery} days` : 'Delivery not specified'}
              </p>
            </div>
          </div>

          {proposal.cover ? (
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{proposal.cover}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
          <div className="sm:text-right">
            <p className="text-lg font-bold text-slate-900">{formatMoney(proposal.rate)}</p>
            <p className="text-xs text-slate-500">Bid amount</p>
          </div>
          {actionable ? (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                as="button"
                type="button"
                variant="outline"
                size="sm"
                icon={X}
                onClick={() => onDecline(proposal)}
                disabled={busyKey === `decline-${proposal.id}`}
              >
                Decline
              </Button>
              <Button
                as="button"
                type="button"
                size="sm"
                icon={Check}
                onClick={() => onHire(proposal)}
                disabled={busyKey === `hire-${proposal.id}`}
              >
                Hire
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

export default function ProposalsReviewPage() {
  const { id } = useParams();
  const { project, fetchProjectById } = useProjects();
  const { proposals, isLoading, fetchProposals, acceptProposal, rejectProposal } = useProposals();

  const [tab, setTab] = useState('all');
  const [busyKey, setBusyKey] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetchProjectById(id);
    fetchProposals({ projectId: id, pageSize: 50 }).catch(() => {});
  }, [id, fetchProjectById, fetchProposals]);

  const rows = useMemo(
    () =>
      (proposals.items ?? []).map((p) => ({
        id: p.proposalId ?? p.proposalID,
        name: p.freelancerName || 'Freelancer',
        rate: p.bidAmount,
        delivery: p.deliveryDays,
        cover: p.message,
        status: p.status || 'Pending',
      })),
    [proposals],
  );

  const counts = useMemo(
    () => ({
      all: rows.length,
      pending: rows.filter((r) => r.status === 'Pending').length,
      accepted: rows.filter((r) => r.status === 'Accepted').length,
      declined: rows.filter((r) => r.status === 'Rejected').length,
    }),
    [rows],
  );

  const avgBid = useMemo(() => {
    const bids = rows.map((r) => Number(r.rate)).filter((n) => Number.isFinite(n) && n > 0);
    if (!bids.length) return null;
    return Math.round(bids.reduce((sum, n) => sum + n, 0) / bids.length);
  }, [rows]);

  const visibleRows = useMemo(() => {
    if (tab === 'pending') return rows.filter((r) => r.status === 'Pending');
    if (tab === 'accepted') return rows.filter((r) => r.status === 'Accepted');
    if (tab === 'declined') return rows.filter((r) => r.status === 'Rejected');
    return rows;
  }, [rows, tab]);

  const handleHire = async (proposal) => {
    setActionError('');
    setBusyKey(`hire-${proposal.id}`);
    const result = await acceptProposal(proposal.id);
    if (result?.success) {
      await fetchProposals({ projectId: id, pageSize: 50 });
    } else {
      setActionError(result?.error || 'Could not hire this freelancer. Please try again.');
    }
    setBusyKey('');
  };

  const handleDecline = async (proposal) => {
    setActionError('');
    setBusyKey(`decline-${proposal.id}`);
    const result = await rejectProposal(proposal.id);
    if (result?.success) {
      await fetchProposals({ projectId: id, pageSize: 50 });
    } else {
      setActionError(result?.error || 'Could not decline this proposal. Please try again.');
    }
    setBusyKey('');
  };

  const total = proposals.totalCount || rows.length;
  const jobTitle = project?.title || 'Job post';

  const tabs = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'pending', label: 'Pending', count: counts.pending },
    { key: 'accepted', label: 'Hired', count: counts.accepted },
    { key: 'declined', label: 'Declined', count: counts.declined },
  ];

  return (
    <div className="space-y-5">
      <Breadcrumbs
        items={[
          { label: 'My job posts', to: '/projects' },
          { label: jobTitle, to: `/projects/${id}` },
          { label: 'Proposals' },
        ]}
      />

      <PageHeading title="Proposals" subtitle={`${total} ${total === 1 ? 'proposal' : 'proposals'} for this job post`} />

      {actionError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{actionError}</div>
      ) : null}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <SegmentedTabs tabs={tabs} value={tab} onChange={setTab} />

          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-brand-100 border-t-brand-700" />
            </div>
          ) : visibleRows.length === 0 ? (
            <Card bodyClassName="p-10">
              <div className="flex flex-col items-center gap-2 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                  <Inbox className="h-6 w-6" aria-hidden="true" />
                </span>
                <p className="font-semibold text-slate-900">No proposals here yet</p>
                <p className="text-sm text-slate-500">
                  {tab === 'all'
                    ? 'Freelancers who apply to this job will appear here.'
                    : 'Nothing matches this filter yet.'}
                </p>
              </div>
            </Card>
          ) : (
            visibleRows.map((proposal) => (
              <ProposalCard key={proposal.id} proposal={proposal} onHire={handleHire} onDecline={handleDecline} busyKey={busyKey} />
            ))
          )}
        </div>

        <div className="space-y-5">
          <Card title={jobTitle}>
            <dl className="space-y-2 text-sm">
              {[
                ['Proposals', total],
                ['Pending', counts.pending],
                ['Hired', counts.accepted],
                ['Declined', counts.declined],
                ['Avg. bid', avgBid != null ? formatMoney(avgBid) : '—'],
                ['Budget', project?.budget != null ? formatMoney(project.budget) : '—'],
                ['Posted', timeAgo(project?.createdAt)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="font-medium text-slate-900">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 space-y-2">
              <Button to="/freelancers" className="w-full">
                Invite more talent
              </Button>
              <Button to={`/projects/${id}/edit`} variant="outline" className="w-full">
                Edit job post
              </Button>
            </div>
          </Card>

          <div className="rounded-2xl border border-brand-100 bg-brand-50 p-5">
            <div className="flex items-center gap-2 text-brand-700">
              <Zap className="h-5 w-5" aria-hidden="true" />
              <h2 className="text-sm font-semibold">Review tips</h2>
            </div>
            <p className="mt-2 inline-flex items-start gap-1.5 text-sm text-slate-600">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
              Respond within 48 hours — strong freelancers get hired fast.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
