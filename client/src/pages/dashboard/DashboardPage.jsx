import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAuthorization } from '../../hooks/useAuthorization';
import { Link } from 'react-router-dom';
import { apiClient } from '../../lib/apiClient';

const STAT_CARDS = [
  {
    label: 'Active projects',
    value: '3',
    hint: '+1 this week',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  {
    label: 'Open contracts',
    value: '2',
    hint: '1 awaiting approval',
    color: 'text-sky-600',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
  },
  {
    label: 'Unread messages',
    value: '5',
    hint: 'Respond to freelancers',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
];

const ENTITY_OPTIONS = [
  { label: 'Freelancer', value: 'Freelancer' },
  { label: 'Client', value: 'Client' },
  { label: 'Skill', value: 'Skill' },
  { label: 'Project', value: 'Project' },
];

const ENTITY_CONFIG = {
  Project: {
    endpoint: '/api/projects',
    idKey: 'projectID',
    labelKey: 'title',
    listExtractor: (data) => data?.items || data || [],
  },
  Freelancer: {
    endpoint: '/api/users/reportable',
    listExtractor: (data) => data?.items ?? [],
    toOption: (item) => ({
      id: item.userId || item.userID,
      label:
        item.username ||
        item.email ||
        [item.name || item.firstName, item.surname || item.lastName]
          .filter(Boolean)
          .join(' ') ||
        item.userId ||
        item.userID,
    }),
  },
  Client: {
    endpoint: '/api/users/reportable',
    listExtractor: (data) => data?.items ?? [],
    toOption: (item) => ({
      id: item.userId || item.userID,
      label:
        item.username ||
        item.email ||
        [item.name || item.firstName, item.surname || item.lastName]
          .filter(Boolean)
          .join(' ') ||
        item.userId ||
        item.userID,
    }),
  },
  Skill: {
    endpoint: '/api/skills',
    idKey: 'skillID',
    labelKey: 'name',
    listExtractor: (data) => data?.items || data || [],
  },
};

const REPORT_REASONS = {
  Project: [
    'Spam',
    'Fake project',
    'Inappropriate content',
    'Misleading details',
    'Fraud or scam',
    'Other',
  ],
  Freelancer: [
    'Unprofessional behavior',
    'Harassment',
    'Spam',
    'Scam or fraud',
    'Inappropriate content',
    'Other',
  ],
  Client: [
    'Unfair treatment',
    'Harassment',
    'Payment issue',
    'Spam',
    'Scam or fraud',
    'Other',
  ],
  Skill: [
    'Incorrect skill data',
    'Inappropriate content',
    'Duplicate entry',
    'Spam',
    'Other',
  ],
};

export default function DashboardPage() {
  const { logout } = useAuth();
  const { isAdmin, isFreelancer } = useAuthorization();

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportEntity, setReportEntity] = useState('');
  const [entityOptions, setEntityOptions] = useState([]);
  const [isEntityOptionsLoading, setIsEntityOptionsLoading] = useState(false);
  const [selectedEntityId, setSelectedEntityId] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reportError, setReportError] = useState(null);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const openReport = () => {
    setIsReportOpen(true);
    setReportEntity('');
    setEntityOptions([]);
    setSelectedEntityId('');
    setReportReason('');
    setReportDetails('');
    setReportError(null);
  };

  const closeReport = () => {
    setIsReportOpen(false);
    setReportEntity('');
    setEntityOptions([]);
    setSelectedEntityId('');
    setReportReason('');
    setReportDetails('');
    setReportError(null);
  };

  useEffect(() => {
    const loadEntities = async () => {
      if (!reportEntity || !ENTITY_CONFIG[reportEntity]) {
        setEntityOptions([]);
        setSelectedEntityId('');
        return;
      }

      try {
        setIsEntityOptionsLoading(true);
        setReportError(null);
        setSelectedEntityId('');

        const config = ENTITY_CONFIG[reportEntity];
        const response = await apiClient.get(config.endpoint, {
          params: { page: 1, pageSize: 50 },
        });

        const rawItems = config.listExtractor(response.data) || [];

        const normalized = config.toOption
          ? rawItems.map(config.toOption)
          : rawItems.map((item) => ({
              id: item[config.idKey],
              label: item[config.labelKey] || item[config.idKey],
            }));

        setEntityOptions(normalized.filter((x) => x.id));
      } catch (err) {
        setEntityOptions([]);
        const raw = err?.response?.data;
        const message =
          raw?.message ||
          raw?.error ||
          raw?.title ||
          (typeof raw === 'string'
            ? raw
            : `Failed to load ${reportEntity.toLowerCase()} list.`);
        setReportError(message);
      } finally {
        setIsEntityOptionsLoading(false);
      }
    };

    if (isReportOpen) {
      loadEntities();
    }
  }, [reportEntity, isReportOpen]);

  const handleSubmitReport = async () => {
    if (!reportEntity) {
      setReportError('Please select an entity type.');
      return;
    }

    if (!selectedEntityId) {
      setReportError('Please select a specific item.');
      return;
    }

    if (!reportReason) {
      setReportError('Please select a reason.');
      return;
    }

    if (reportReason === 'Other' && !reportDetails.trim()) {
      setReportError('Please describe the issue.');
      return;
    }

    try {
      setIsSubmittingReport(true);
      setReportError(null);

      const finalReason =
        reportReason === 'Other'
          ? `Other: ${reportDetails.trim()}`
          : reportDetails.trim()
          ? `${reportReason} — ${reportDetails.trim()}`
          : reportReason;

      await apiClient.post('/api/reports', {
        entity: reportEntity,
        entityID: selectedEntityId,
        reason: finalReason,
      });

      closeReport();
      alert('Report submitted successfully.');
    } catch (err) {
      const raw = err?.response?.data;
      const message =
        raw?.message ||
        raw?.error ||
        raw?.title ||
        (typeof raw === 'string' ? raw : 'Failed to submit report.');
      setReportError(message);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="px-6 py-8 max-w-7xl mx-auto text-slate-900">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              {isAdmin
                ? 'Admin Dashboard'
                : isFreelancer
                ? 'Freelancer Dashboard'
                : 'Client Dashboard'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {isAdmin
                ? 'Manage users, projects, contracts, and platform settings.'
                : isFreelancer
                ? 'Browse projects, track your contracts, and manage your work.'
                : 'Plan projects, review freelancers, and keep everything in one cozy place.'}
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600">
            <button
              type="button"
              onClick={openReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-200 bg-amber-50 text-[11px] font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white border border-amber-200 text-[12px]">
                🚩
              </span>
              <span>Report</span>
            </button>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200">
              <span className="inline-flex h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
              <span className="font-medium text-teal-700">
                All systems operational
              </span>
            </div>

            <button
              onClick={logout}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Sign out
            </button>
          </div>
        </header>

        <section className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STAT_CARDS.map((s) => (
            <div
              key={s.label}
              className={`rounded-2xl border ${s.border} ${s.bg} px-4 py-3 shadow-sm`}
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {s.label}
                </p>
                <span className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-white border ${s.border} ${s.color}`}>
                  Live
                </span>
              </div>
              <p className={`mt-2 text-xl font-semibold tabular-nums ${s.color}`}>
                {s.value}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">{s.hint}</p>
            </div>
          ))}
        </section>

        <section className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-teal-100 blur-2xl" />
            <div className="relative p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 text-xl">
                    📦
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">Projects</h3>
                    <p className="text-xs text-slate-500">Plan work and track progress.</p>
                  </div>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 border border-slate-200">
                  {isAdmin ? 'All projects' : isFreelancer ? 'Browse' : 'Your projects'}
                </span>
              </div>

              <p className="text-sm text-slate-600">
                Create new project briefs, invite freelancers, and keep an eye on timelines from one place.
              </p>

              <Link
                to="/projects"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
              >
                Go to Projects
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="absolute -left-10 -top-10 h-24 w-24 rounded-full bg-purple-100 blur-2xl" />
            <div className="relative p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 text-xl">
                    📄
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">Contracts</h3>
                    <p className="text-xs text-slate-500">Keep agreements clear and tidy.</p>
                  </div>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 border border-slate-200">
                  Overview
                </span>
              </div>

              <p className="text-sm text-slate-600">
                Review contract details, check statuses, and approve work milestones with confidence.
              </p>

              <Link
                to={isAdmin ? '/admin/contracts' : '/contracts'}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition-colors"
              >
                Go to Contracts
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="absolute -right-10 -bottom-10 h-24 w-24 rounded-full bg-indigo-100 blur-2xl" />
            <div className="relative p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 text-xl">
                  👤
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Profile</h3>
                  <p className="text-xs text-slate-500">Keep your details up to date.</p>
                </div>
              </div>

              <p className="text-sm text-slate-600">
                Update your name, company info, and preferences so freelancers get a clear picture of who you are.
              </p>

              <Link
                to="/profile"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
              >
                View Profile
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:col-span-2 lg:col-span-1">
            <div className="relative p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 text-xl">
                  🎯
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Skills & matches</h3>
                  <p className="text-xs text-slate-500">Explore skills and refine your brief.</p>
                </div>
              </div>

              <p className="text-sm text-slate-600">
                Browse platform skills, refine what you are looking for, and help us match you with the right freelancers.
              </p>

              <Link
                to={isAdmin ? '/admin/skills' : '/projects'}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
              >
                {isAdmin ? 'Manage Skills' : 'Browse Projects'}
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>
      </div>

      {isReportOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-slate-200 p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-700 text-sm">
                  🚩
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Create a report</h2>
                  <p className="text-xs text-slate-500">
                    Select an entity, then choose a specific item and reason.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeReport}
                className="text-[11px] text-slate-500 hover:text-slate-700"
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Entity type
                </label>
                <select
                  value={reportEntity}
                  onChange={(e) => {
                    setReportEntity(e.target.value);
                    setEntityOptions([]);
                    setSelectedEntityId('');
                    setReportReason('');
                    setReportDetails('');
                    setReportError(null);
                  }}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Select an entity</option>
                  {ENTITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select item
                </label>
                <select
                  value={selectedEntityId}
                  onChange={(e) => {
                    setSelectedEntityId(e.target.value);
                    setReportError(null);
                  }}
                  disabled={!reportEntity || isEntityOptionsLoading}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">
                    {!reportEntity
                      ? 'Select an entity first'
                      : isEntityOptionsLoading
                      ? 'Loading items...'
                      : `Select a ${reportEntity.toLowerCase()}`}
                  </option>

                  {entityOptions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => {
                    setReportReason(e.target.value);
                    setReportError(null);
                  }}
                  disabled={!reportEntity}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">
                    {reportEntity ? 'Select a reason' : 'Select an entity first'}
                  </option>
                  {(REPORT_REASONS[reportEntity] || []).map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              {(reportReason === 'Other' || reportReason) && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {reportReason === 'Other' ? 'Describe the issue' : 'Additional details'}
                  </label>
                  <textarea
                    rows={4}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder={
                      reportReason === 'Other'
                        ? 'Write what happened or what seems wrong...'
                        : 'Optional extra context...'
                    }
                  />
                </div>
              )}

              {reportError && (
                <p className="text-[11px] text-rose-600">{reportError}</p>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeReport}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitReport}
                  disabled={isSubmittingReport}
                  className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-xs font-semibold text-white disabled:bg-amber-300"
                >
                  {isSubmittingReport ? 'Sending...' : 'Submit report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}