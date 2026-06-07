import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BadgeCheck, ShieldCheck, DollarSign, Clock, CheckCircle2, Tag } from 'lucide-react';
import { useProjects } from '../../hooks/useProjects';
import { useContracts } from '../../hooks/useContracts';
import { useProposals } from '../../hooks/useProposals';
import { useClients } from '../../hooks/useClients';
import { useAuthorization } from '../../hooks/useAuthorization';
import { useProtectedViews } from '../../hooks/useProtectedViews';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { RatingStars } from '../../components/ui/RatingStars';
import { Avatar } from '../../components/ui/Avatar';

const STATUS_TONE = {
  Open: 'emerald',
  InProgress: 'sky',
  Completed: 'slate',
  Cancelled: 'rose',
};

function timeAgo(value) {
  if (!value) return 'recently';
  const diff = Date.now() - new Date(value).getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 1) return 'just now';
  if (hrs < 24) return `${hrs} hours ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? 'Yesterday' : `${days} days ago`;
}

function InfoChip({ icon, label, value }) {
  const Icon = icon;
  return (
    <div className="rounded-xl border border-line bg-white px-4 py-3">
      <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
        <Icon className="h-4 w-4 text-slate-400" aria-hidden="true" />
        {label}
      </div>
      <p className="text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { project, isLoading, error, fetchProjectById, deleteProject } = useProjects();
  const { fetchContracts } = useContracts();
  const { proposals, fetchProposals, createProposal, deleteProposal } = useProposals();
  const { client, fetchClientById } = useClients();
  const { isClient, isFreelancer } = useAuthorization();
  const { logView } = useProtectedViews();

  const [showApply, setShowApply] = useState(false);
  const [form, setForm] = useState({ message: '', bidAmount: '', deliveryDays: '' });
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchProjectById(id);
    logView(id);
    fetchContracts({ projectID: id, page: 1, pageSize: 10 }).catch(() => {});
    fetchProposals({ projectId: id, pageSize: 50 }).catch(() => {});
  }, [id, fetchProjectById, fetchContracts, fetchProposals, logView]);

  useEffect(() => {
    if (project?.clientID) fetchClientById(project.clientID).catch(() => {});
  }, [project?.clientID, fetchClientById]);

  const handleApply = async (event) => {
    event.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const res = await createProposal({
        projectId: project.projectID,
        message: form.message.trim(),
        bidAmount: Number(form.bidAmount),
        deliveryDays: Number(form.deliveryDays),
      });
      if (!res?.success) {
        setFormError(res?.error || 'Failed to submit proposal.');
        return;
      }
      setForm({ message: '', bidAmount: '', deliveryDays: '' });
      setShowApply(false);
      await fetchProposals({ projectId: id, pageSize: 50 });
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async (proposalId) => {
    setSubmitting(true);
    try {
      await deleteProposal(proposalId);
      await fetchProposals({ projectId: id, pageSize: 50 });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this job post? This cannot be undone.')) {
      await deleteProject(id);
      navigate('/projects');
    }
  };

  if (isLoading && !project) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-slate-500">
        <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-700" />
        <p>Loading job…</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <Card className="border-rose-200 bg-rose-50">
        <h2 className="text-lg font-bold text-rose-700">Job not found</h2>
        <Button to="/discover" variant="link" size="link" className="mt-2">
          Back to Find work
        </Button>
      </Card>
    );
  }

  const myProposals = [...proposals.items].sort(
    (a, b) => new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0),
  );
  const latest = isFreelancer ? myProposals[0] : null;
  const projectOpen = project.status === 'Open';
  const ref = `#${String(project.projectID).slice(0, 8).toUpperCase()}`;

  const clientName = project.clientName || client?.name || 'Client';
  const clientRating = client?.averageRating || 0;
  const clientReviews = client?.reviewCount ?? 0;

  return (
    <div className="space-y-5">
      <Breadcrumbs
        items={[
          { label: isFreelancer ? 'Find work' : 'My job posts', to: isFreelancer ? '/discover' : '/projects' },
          { label: project.categoryName || 'Projects' },
          { label: project.title },
        ]}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <Badge tone={STATUS_TONE[project.status] ?? 'slate'}>{project.status}</Badge>
              <span>{ref}</span>
              <span>· Posted {timeAgo(project.createdAt)}</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{project.title}</h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                {clientName}
                <BadgeCheck className="h-4 w-4 text-brand-600" aria-hidden="true" />
              </span>
              {clientReviews > 0 ? (
                <span className="inline-flex items-center gap-1.5">
                  <RatingStars rating={clientRating} size="sm" />
                  <span className="text-slate-400">({clientReviews} reviews)</span>
                </span>
              ) : null}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <InfoChip icon={DollarSign} label="Budget" value={`$${project.budget?.toLocaleString() ?? '—'}`} />
              <InfoChip icon={Tag} label="Category" value={project.categoryName || '—'} />
              <InfoChip icon={Clock} label="Posted" value={timeAgo(project.createdAt)} />
              <InfoChip icon={CheckCircle2} label="Status" value={project.status} />
            </div>
          </Card>

          <Card title="About the project">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
              {project.description || 'No description provided.'}
            </p>

            {project.skills?.length ? (
              <>
                <h3 className="mt-5 mb-2 text-sm font-semibold text-slate-900">Skills &amp; expertise</h3>
                <div className="flex flex-wrap gap-1.5">
                  {project.skills.map((skill) => (
                    <Badge key={skill} tone="slate">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </>
            ) : null}
          </Card>

          {isFreelancer && showApply && projectOpen && !latest ? (
            <Card title="Submit your proposal">
              {formError ? (
                <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</div>
              ) : null}
              <form onSubmit={handleApply} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">Bid amount ($)</label>
                    <input
                      type="number"
                      min="1"
                      value={form.bidAmount}
                      onChange={(e) => setForm((f) => ({ ...f, bidAmount: e.target.value }))}
                      className="h-10 w-full rounded-xl border border-line bg-white px-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">Delivery days</label>
                    <input
                      type="number"
                      min="1"
                      value={form.deliveryDays}
                      onChange={(e) => setForm((f) => ({ ...f, deliveryDays: e.target.value }))}
                      className="h-10 w-full rounded-xl border border-line bg-white px-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Cover letter</label>
                  <textarea
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    placeholder="Describe your approach, relevant experience, and why you're the right fit…"
                    className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button as="button" type="submit" variant="accent" disabled={submitting}>
                    {submitting ? 'Submitting…' : 'Submit proposal'}
                  </Button>
                  <Button as="button" type="button" variant="outline" onClick={() => setShowApply(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          ) : null}

          {isFreelancer && latest ? (
            <Card title="Your proposal">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge tone={latest.status === 'Accepted' ? 'emerald' : latest.status === 'Rejected' ? 'rose' : 'amber'}>
                    {latest.status}
                  </Badge>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    ${latest.bidAmount?.toLocaleString()} · {latest.deliveryDays} days
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{latest.message}</p>
                </div>
                {latest.status === 'Pending' ? (
                  <Button as="button" type="button" variant="outline" size="sm" onClick={() => handleWithdraw(latest.proposalId)} disabled={submitting}>
                    Withdraw
                  </Button>
                ) : null}
              </div>
            </Card>
          ) : null}
        </div>

        <div className="space-y-5">
          <Card>
            <p className="text-xs text-slate-500">Project budget</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">${project.budget?.toLocaleString() ?? '—'}</p>
            <Badge tone="brand" icon={ShieldCheck} className="mt-2">Escrow protected</Badge>

            <div className="mt-4 space-y-2">
              {isFreelancer ? (
                <Button
                  as="button"
                  type="button"
                  variant="accent"
                  className="w-full"
                  onClick={() => setShowApply(true)}
                  disabled={!projectOpen || Boolean(latest)}
                >
                  {latest ? 'Already applied' : projectOpen ? 'Apply now' : 'Closed'}
                </Button>
              ) : isClient ? (
                <>
                  <Button to={`/projects/${project.projectID}/proposals`} className="w-full">
                    Review proposals ({proposals.totalCount})
                  </Button>
                  <Button to={`/projects/${project.projectID}/edit`} variant="outline" className="w-full">
                    Edit job post
                  </Button>
                </>
              ) : null}
            </div>
          </Card>

          <Card title="About the client">
            <div className="flex items-center gap-3">
              <Avatar name={clientName} size="md" />
              <div className="min-w-0">
                <p className="inline-flex items-center gap-1 text-sm font-semibold text-slate-900">
                  {clientName}
                  <BadgeCheck className="h-4 w-4 text-brand-600" aria-hidden="true" />
                </p>
                {client?.industry ? <p className="text-xs text-slate-500">{client.industry}</p> : null}
              </div>
            </div>

            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Rating</dt>
                <dd className="font-medium text-slate-900">{clientRating > 0 ? `${Number(clientRating).toFixed(1)} ★` : '—'}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Reviews</dt>
                <dd className="font-medium text-slate-900">{clientReviews}</dd>
              </div>
            </dl>

            <Button to={`/clients/${project.clientID}`} variant="soft" className="mt-4 w-full">
              View client profile
            </Button>
          </Card>

          {isClient ? (
            <button
              type="button"
              onClick={handleDelete}
              className="w-full rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-100"
            >
              Delete job post
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
