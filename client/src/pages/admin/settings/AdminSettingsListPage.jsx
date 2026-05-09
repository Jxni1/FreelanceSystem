import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../../hooks/useSettings';

const PAGE_SIZE = 10;

export default function AdminSettingsListPage() {
  const { settings, isLoading, error, fetchSettings, deleteSetting } = useSettings();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchSettings({
      page,
      pageSize: PAGE_SIZE,
      search: search || undefined
    });
  }, [page, search]);

  const handleDelete = async (id, settingKey) => {
    if (window.confirm(`Are you sure you want to delete the setting "${settingKey}"?`)) {
      try {
        await deleteSetting(id);
        fetchSettings({
          page,
          pageSize: PAGE_SIZE,
          search: search || undefined
        });
      } catch (err) {
        console.error('Failed to delete setting:', err);
      }
    }
  };

  const totalPages = Math.max(1, Math.ceil((settings.totalCount || 0) / (settings.pageSize || PAGE_SIZE)));

  if (isLoading && settings.items.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500 min-h-[50vh] flex flex-col items-center justify-center">
        <div className="inline-block w-10 h-10 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin mb-4" />
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Settings Management</h2>
          <p className="text-xs text-slate-500">
            Configure and manage platform settings.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <div className="px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
            Total settings: <span className="font-semibold text-slate-900">{settings.totalCount}</span>
          </div>

          <Link
            to="/admin/settings/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-sm font-semibold text-white transition-colors"
          >
            <span className="text-base leading-none">+</span>
            New Setting
          </Link>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Search by key or description..."
          className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
          {typeof error === 'string' ? error : 'An error occurred while loading settings.'}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase">Key</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase">Value</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase">Description</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase">Updated</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {!isLoading && settings.items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-500">
                    No settings found.
                  </td>
                </tr>
              )}

              {!isLoading &&
                settings.items.map((setting) => (
                  <tr key={setting.settingID} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-900 font-semibold">{setting.key}</td>
                    <td className="px-4 py-3 text-sm text-slate-700 max-w-xs truncate">{setting.value}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{setting.description || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {setting.updatedAt ? new Date(setting.updatedAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/settings/${setting.settingID}/edit`}
                          className="px-2 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-xs hover:bg-slate-200 transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(setting.settingID, setting.key)}
                          className="px-2 py-1 rounded-md bg-rose-50 border border-rose-200 text-rose-600 text-xs hover:bg-rose-100 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <p>
            Page <span className="font-semibold text-slate-700">{page}</span> of{' '}
            <span className="font-semibold text-slate-700">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}