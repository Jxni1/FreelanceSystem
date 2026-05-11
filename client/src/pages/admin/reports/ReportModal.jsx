import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '../../../lib/apiClient';


const ENTITY_OPTIONS = [
  { label: 'Freelancer', value: 'Freelancer' },
  { label: 'Client', value: 'Client' },
  { label: 'Skill', value: 'Skill' },
  { label: 'Project', value: 'Project' },
  { label: 'Proposal', value: 'Proposal' },
  { label: 'Review', value: 'Review' },
  { label: 'File', value: 'File' },
];

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
  Proposal: [
    'Spam',
    'Inappropriate content',
    'Scam or fraud',
    'Other',
  ],
  Review: [
    'Spam',
    'Harassment',
    'Inappropriate content',
    'Other',
  ],
  File: [
    'Inappropriate content',
    'Malware',
    'Spam',
    'Other',
  ],
};

export function ReportModal({
  isOpen,
  onClose,
  initialEntity = '',
  initialEntityId = '',
  initialDisplayLabel = '',
}) {
  const isContextual = Boolean(initialEntity && initialEntityId);

  const [entity, setEntity] = useState(initialEntity);
  const [entityId, setEntityId] = useState(initialEntityId);
  const [displayLabel, setDisplayLabel] = useState(initialDisplayLabel);

  const [entityOptions, setEntityOptions] = useState([]);
  const [isEntityLoading, setIsEntityLoading] = useState(false);

  const [reasonCategory, setReasonCategory] = useState('');
  const [details, setDetails] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reasonOptions = useMemo(() => {
    return REPORT_REASONS[entity] || [];
  }, [entity]);

  useEffect(() => {
    if (!isOpen) return;

    setEntity(initialEntity || '');
    setEntityId(initialEntityId || '');
    setDisplayLabel(initialDisplayLabel || '');
    setReasonCategory('');
    setDetails('');
    setError(null);
    setEntityOptions([]);
  }, [isOpen, initialEntity, initialEntityId, initialDisplayLabel]);

  useEffect(() => {
    const loadEntities = async () => {
      if (isContextual) return;

      if (!entity) {
        setEntityOptions([]);
        setEntityId('');
        setDisplayLabel('');
        return;
      }

      try {
        setIsEntityLoading(true);
        setError(null);
        setEntityId('');
        setDisplayLabel('');

        let endpoint = '';
        let normalize = (items) => items;

        if (entity === 'Project') {
          endpoint = '/api/projects';
          normalize = (items) =>
            items.map((p) => ({
              id: p.projectID,
              label: p.title || p.projectID,
            }));
        } else if (entity === 'Freelancer' || entity === 'Client') {
          endpoint = '/api/users/reportable';
          normalize = (items) => {
            const filtered = items.filter((u) => {
              const role =
                u.role ||
                u.userRole ||
                u.roleName ||
                u.userType ||
                (Array.isArray(u.roles) ? u.roles[0] : null);

              return String(role || '').toLowerCase() === entity.toLowerCase();
            });

            return filtered.map((u) => ({
              id: u.userId || u.userID,
              label:
                u.username ||
                u.email ||
                [u.name || u.firstName, u.surname || u.lastName]
                  .filter(Boolean)
                  .join(' ') ||
                u.userId ||
                u.userID,
            }));
          };
        } else if (entity === 'Skill') {
          endpoint = '/api/skills';
          normalize = (items) =>
            items.map((s) => ({
              id: s.skillID,
              label: s.name || s.skillID,
            }));
        } else {
          setEntityOptions([]);
          return;
        }

        const res = await apiClient.get(endpoint, {
          params: { page: 1, pageSize: 50 },
        });

        const raw = res.data?.items || res.data || [];
        setEntityOptions(normalize(raw).filter((x) => x.id));
      } catch (err) {
        const raw = err?.response?.data;
        const message =
          raw?.message ||
          raw?.error ||
          raw?.title ||
          (typeof raw === 'string'
            ? raw
            : `Failed to load ${entity.toLowerCase()} list.`);
        setError(message);
        setEntityOptions([]);
      } finally {
        setIsEntityLoading(false);
      }
    };

    if (isOpen) {
      loadEntities();
    }
  }, [entity, isOpen, isContextual]);

  const handleSubmit = async () => {
    if (!entity) {
      setError('Please select an entity type.');
      return;
    }

    if (!entityId) {
      setError('Please select an item.');
      return;
    }

    if (!reasonCategory) {
      setError('Please select a reason.');
      return;
    }

    if (reasonCategory === 'Other' && !details.trim()) {
      setError('Please describe the issue.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const packedReason =
        reasonCategory === 'Other'
          ? `Other: ${details.trim()}`
          : details.trim()
          ? `${reasonCategory} — ${details.trim()}`
          : reasonCategory;

      await apiClient.post('/api/reports', {
        entity,
        entityID: entityId,
        reason: packedReason,
      });

      onClose();
      alert('Report submitted successfully.');
    } catch (err) {
      const raw = err?.response?.data;
      const message =
        raw?.message ||
        raw?.error ||
        raw?.title ||
        (typeof raw === 'string' ? raw : 'Failed to submit report.');
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-slate-200 p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-700 text-sm">
              🚩
            </span>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Create a report
              </h2>
              <p className="text-xs text-slate-500">
                Select what you want to report and why.
              </p>
              {displayLabel && (
                <p className="text-[11px] text-slate-500 mt-1 break-all">
                  Target: <span className="font-medium">{displayLabel}</span>
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-[11px] text-slate-500 hover:text-slate-700"
          >
            Close
          </button>
        </div>

        <div className="space-y-4">
          {!isContextual && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Entity type
                </label>
                <select
                  value={entity}
                  onChange={(e) => {
                    setEntity(e.target.value);
                    setEntityOptions([]);
                    setEntityId('');
                    setDisplayLabel('');
                    setReasonCategory('');
                    setDetails('');
                    setError(null);
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
                  value={entityId}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEntityId(value);
                    const opt = entityOptions.find((x) => String(x.id) === value);
                    setDisplayLabel(opt?.label || '');
                    setError(null);
                  }}
                  disabled={!entity || isEntityLoading}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">
                    {!entity
                      ? 'Select an entity first'
                      : isEntityLoading
                      ? 'Loading items...'
                      : entityOptions.length === 0
                      ? `No ${entity.toLowerCase()} found`
                      : `Select a ${entity.toLowerCase()}`}
                  </option>

                  {entityOptions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason
            </label>
            <select
              value={reasonCategory}
              onChange={(e) => {
                setReasonCategory(e.target.value);
                setError(null);
              }}
              disabled={!entity}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value="">
                {entity ? 'Select a reason' : 'Select an entity first'}
              </option>
              {reasonOptions.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </div>

          {(reasonCategory === 'Other' || reasonCategory) && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {reasonCategory === 'Other'
                  ? 'Describe the issue'
                  : 'Additional details'}
              </label>
              <textarea
                rows={4}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder={
                  reasonCategory === 'Other'
                    ? 'Write what happened or what seems wrong...'
                    : 'Optional extra context...'
                }
              />
            </div>
          )}

          {error && <p className="text-[11px] text-rose-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-xs font-semibold text-white disabled:bg-amber-300"
            >
              {isSubmitting ? 'Sending...' : 'Submit report'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}