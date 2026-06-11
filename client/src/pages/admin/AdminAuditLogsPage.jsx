import { useEffect, useState, useCallback } from 'react';
import { useAuditLogs } from '../../hooks/useAuditLogs';

const PAGE_SIZE = 20;

const ACTION_OPTIONS = [
  'PaymentHeld', 'PaymentReleased', 'PaymentFailed',
  'MilestoneSubmitted', 'MilestoneApproved', 'MilestoneRejected',
  'ContractCancelled',
  'UserRoleChanged',
];

const ENTITY_OPTIONS = ['Payment', 'Contract', 'Milestone', 'User'];

const ACTION_BADGE = {
  PaymentHeld: 'bg-blue-50 text-blue-700 ring-blue-200',
  PaymentReleased: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  PaymentFailed: 'bg-rose-50 text-rose-700 ring-rose-200',
  MilestoneSubmitted: 'bg-amber-50 text-amber-700 ring-amber-200',
  MilestoneApproved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  MilestoneRejected: 'bg-rose-50 text-rose-700 ring-rose-200',
  ContractCancelled: 'bg-orange-50 text-orange-700 ring-orange-200',
  UserRoleChanged: 'bg-violet-50 text-violet-700 ring-violet-200',
};

function ActionBadge({ action }) {
  const cls = ACTION_BADGE[action] ?? 'bg-slate-50 text-slate-700 ring-slate-200';
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}>
      {action}
    </span>
  );
}

export default function AdminAuditLogsPage() {
  const { logs, isLoading, error, fetchLogs } = useAuditLogs();

  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const load = useCallback(() => {
    fetchLogs({
      page,
      pageSize: PAGE_SIZE,
      action: actionFilter || undefined,
      entity: entityFilter || undefined,
      from: fromDate || undefined,
      to: toDate || undefined
    });
  }, [fetchLogs, page, actionFilter, entityFilter, fromDate, toDate]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.max(1, Math.ceil((logs.totalCount || 0) / PAGE_SIZE));

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Audit Logs</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Security, financial and work integrity events
          </p>
        </div>
        <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
          {logs.totalCount ?? 0} total records
        </span>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap gap-3">
        <select
          value={actionFilter}
          onChange={handleFilterChange(setActionFilter)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">All Actions</option>
          {ACTION_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>

        <select
          value={entityFilter}
          onChange={handleFilterChange(setEntityFilter)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">All Entities</option>
          {ENTITY_OPTIONS.map(e => <option key={e} value={e}>{e}</option>)}
        </select>

        <input
          type="date"
          value={fromDate}
          onChange={handleFilterChange(setFromDate)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="From"
        />

        <input
          type="date"
          value={toDate}
          onChange={handleFilterChange(setToDate)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="To"
        />

        {(actionFilter || entityFilter || fromDate || toDate) && (
          <button
            onClick={() => {
              setActionFilter('');
              setEntityFilter('');
              setFromDate('');
              setToDate('');
              setPage(1);
            }}
            className="text-sm text-slate-500 hover:text-rose-500 transition-colors px-2"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin" />
          </div>
        ) : logs.items.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">No audit logs found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Entity</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Old Value</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">New Value</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.items.map((log) => (
                  <tr key={log.auditLogId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <ActionBadge action={log.action} />
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">{log.entity}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-[160px] truncate" title={log.oldValue ?? ''}>
                      {log.oldValue ?? <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-700 max-w-[160px] truncate" title={log.newValue ?? ''}>
                      {log.newValue ?? <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{log.username ?? log.userId}</td>
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs">
                      {log.ipAddress ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}