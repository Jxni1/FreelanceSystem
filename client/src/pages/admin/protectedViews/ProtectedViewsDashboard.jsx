import { useEffect, useState } from 'react';
import { useProtectedViews } from '../../../hooks/useProtectedViews';
import { protectedViewService } from '../../../lib/protectedViewService';

const TABS = [
  { key: 'most-viewed', label: 'Most Viewed Projects' },
  { key: 'suspicious', label: 'Suspicious Activity' },
];

export default function ProtectedViewsDashboard() {
  const [activeTab, setActiveTab] = useState('most-viewed');
  const [page, setPage] = useState(1);
  const [projectIdInput, setProjectIdInput] = useState('');
  const [projectIdFilter, setProjectIdFilter] = useState('');
  
  // NEW: Modal states for viewing users
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedProjectTitle, setSelectedProjectTitle] = useState('');
  const [projectViewers, setProjectViewers] = useState([]);
  const [viewersLoading, setViewersLoading] = useState(false);

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

  // NEW: Fetch viewers for a project
  const handleViewViewers = async (projectId, projectTitle) => {
    setSelectedProjectId(projectId);
    setSelectedProjectTitle(projectTitle);
    setViewersLoading(true);
    
    try {
      // Use the existing fetchProjectViews function
      const data = await protectedViewService.getProjectViews(projectId, { 
        page: 1, 
        pageSize: 1000 
      });
      
      // Extract unique viewers
      const uniqueViewers = [];
      const seen = new Set();
      
      if (data?.items && Array.isArray(data.items)) {
        data.items.forEach(item => {
          if (!seen.has(item.userID)) {
            seen.add(item.userID);
            uniqueViewers.push({
              userID: item.userID,
              username: item.username,
              viewedAt: item.viewedAt
            });
          }
        });
      }
      
      setProjectViewers(uniqueViewers);
    } catch (error) {
      console.error('Failed to fetch viewers:', error);
      setProjectViewers([]);
    } finally {
      setViewersLoading(false);
    }
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
                    {/* CHANGED: Make unique viewers clickable */}
                    <td className="px-6 py-3 text-center">
                      <button
                        onClick={() => handleViewViewers(item.projectID, item.projectTitle)}
                        className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 cursor-pointer transition-colors"
                      >
                        {item.uniqueViewers}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} setPage={setPage} data={mostViewed} />
        </>
      )}

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

      {/* NEW: Viewers Modal */}
      {selectedProjectId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="border-b border-slate-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Project Viewers</h2>
                <p className="text-sm text-slate-500 mt-1">{selectedProjectTitle}</p>
              </div>
              <button
                onClick={() => setSelectedProjectId(null)}
                className="text-slate-400 hover:text-slate-600 text-2xl font-bold leading-none"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {viewersLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin" />
                </div>
              ) : projectViewers.length === 0 ? (
                <p className="text-center text-slate-400 py-8">No viewers found</p>
              ) : (
                <div className="space-y-2">
                  {projectViewers.map((viewer) => (
                    <div key={viewer.userID} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div>
                        <p className="font-medium text-slate-900">{viewer.username}</p>
                        <p className="text-xs text-slate-500">{viewer.userID}</p>
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(viewer.viewedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-200 p-6">
              <button
                onClick={() => setSelectedProjectId(null)}
                className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
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