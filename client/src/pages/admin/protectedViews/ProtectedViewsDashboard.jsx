import { useEffect, useState } from 'react';
import { useProtectedViews } from '../../../hooks/useProtectedViews';

const TABS = [
  { key: 'most-viewed', label: 'Most Viewed Projects' },
  // { key: 'view-logs', label: 'View Logs' },
  { key: 'suspicious', label: 'Suspicious Activity' },
];

export default function ProtectedViewsDashboard() {
  const [activeTab, setActiveTab] = useState('most-viewed');
  const [page, setPage] = useState(1);
  const [projectIdInput, setProjectIdInput] = useState('');
  const [projectIdFilter, setProjectIdFilter] = useState('');

  const {
    viewLogs, mostViewed, suspiciousActivity,
    isLoading, error,
    fetchProjectViews, fetchMostViewed, fetchSuspiciousActivity
  } = useProtectedViews();

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'most-viewed') fetchMostViewed({ page, pageSize: 20 });
    if (activeTab === 'suspicious') fetchSuspiciousActivity({ page, pageSize: 20 });
    if (activeTab === 'view-logs' && projectIdFilter) {
      fetchProjectViews(projectIdFilter, { page, pageSize: 20 });
    }
  }, [activeTab, page, projectIdFilter]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setPage(1);
  };

  const handleLoadLogs = (e) => {
    e.preventDefault();
    setProjectIdFilter(projectIdInput.trim());
    setPage(1);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Protected Views Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Monitor project access, view analytics, and detect suspicious activity.</p>
      </div>

      <div className="flex gap-1 mb-6 border-b border-slate-200">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Most Viewed Tab */}
      {activeTab === 'most-viewed' && !isLoading && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                  <th className="px-6 py-3 text-left">Project</th>
                  <th className="px-6 py-3 text-center">Total Views</th>
                  <th className="px-6 py-3 text-center">Unique Viewers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mostViewed.items.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-400">No view data yet.</td></tr>
                ) : mostViewed.items.map((item, i) => (
                  <tr key={item.projectID} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-medium text-slate-900">{item.projectTitle}</td>
                    <td className="px-6 py-3 text-center">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                        {item.totalViews}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center text-slate-600">{item.uniqueViewers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} setPage={setPage} data={mostViewed} />
        </>
      )}

      {/* View Logs Tab
      {activeTab === 'view-logs' && !isLoading && (
        <>
          <form onSubmit={handleLoadLogs} className="flex gap-3 mb-4">
            <input
              type="text"
              placeholder="Enter Project ID (GUID)..."
              value={projectIdInput}
              onChange={e => setProjectIdInput(e.target.value)}
              className="flex-1 max-w-md px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Load Logs
            </button>
          </form>

          {!projectIdFilter ? (
            <div className="text-center py-16 text-slate-400">Enter a Project ID above to view its access logs.</div>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                      <th className="px-6 py-3 text-left">User</th>
                      <th className="px-6 py-3 text-left">Project</th>
                      <th className="px-6 py-3 text-left">Viewed At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {viewLogs.items.length === 0 ? (
                      <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-400">No views found for this project.</td></tr>
                    ) : viewLogs.items.map(log => (
                      <tr key={log.protectedViewID} className="hover:bg-slate-50">
                        <td className="px-6 py-3 font-medium text-slate-900">{log.username}</td>
                        <td className="px-6 py-3 text-slate-600">{log.projectTitle}</td>
                        <td className="px-6 py-3 text-slate-500 text-xs">{new Date(log.viewedAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} setPage={setPage} data={viewLogs} />
            </>
          )}
        </>
      )} */}

      {/* Suspicious Activity Tab */}
      {activeTab === 'suspicious' && !isLoading && (
        <>
          <div className="mb-3 text-sm text-slate-500">
            Users with <span className="font-semibold text-rose-600">50+ views</span> in the last 24 hours.
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                  <th className="px-6 py-3 text-left">User</th>
                  <th className="px-6 py-3 text-center">View Count</th>
                  <th className="px-6 py-3 text-left">First View</th>
                  <th className="px-6 py-3 text-left">Last View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suspiciousActivity.items.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400">No suspicious activity detected.</td></tr>
                ) : suspiciousActivity.items.map(item => (
                  <tr key={item.userID} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-medium text-slate-900">{item.username}</td>
                    <td className="px-6 py-3 text-center">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        {item.viewCount}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-500 text-xs">{new Date(item.periodStart).toLocaleString()}</td>
                    <td className="px-6 py-3 text-slate-500 text-xs">{new Date(item.periodEnd).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} setPage={setPage} data={suspiciousActivity} />
        </>
      )}
    </div>
  );
}

function Pagination({ page, setPage, data }) {
  if (data.totalCount <= data.pageSize) return null;
  return (
    <div className="flex justify-center gap-2 mt-6">
      <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
        className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 disabled:opacity-40">
        Previous
      </button>
      <span className="px-4 py-2 text-slate-600">Page {page}</span>
      <button disabled={page * data.pageSize >= data.totalCount} onClick={() => setPage(p => p + 1)}
        className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 disabled:opacity-40">
        Next
      </button>
    </div>
  );
}