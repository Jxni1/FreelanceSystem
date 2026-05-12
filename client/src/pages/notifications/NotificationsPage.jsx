import { useEffect, useMemo, useState } from 'react';
import { useNotifications } from '../../hooks/useNotifications';

const PAGE_SIZE = 12;

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    load();
  }, [page, filter]);

  async function load() {
    const params = { page, pageSize: PAGE_SIZE };

    if (filter === 'read') params.isRead = true;
    if (filter === 'unread') params.isRead = false;

    await Promise.all([
      fetchNotifications(params),
      fetchUnreadCount(),
    ]);
  }

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil((notifications.totalCount || 0) / PAGE_SIZE));
  }, [notifications.totalCount]);

  async function handleMarkAsRead(id) {
    const result = await markAsRead(id);
    if (result.success) {
      await fetchUnreadCount();
    }
  }

  async function handleMarkAllAsRead() {
    const result = await markAllAsRead();
    if (result.success) {
      await load();
    }
  }

  async function handleDelete(id) {
    const result = await deleteNotification(id);
    if (result.success) {
      await load();
    }
  }

  function getTypeStyles(type) {
    const normalized = (type || '').toLowerCase();

    if (normalized.includes('proposal')) {
      return {
        chip: 'bg-sky-50 text-sky-700 border-sky-200',
        iconWrap: 'bg-sky-50 text-sky-600',
        icon: '📝',
      };
    }

    if (normalized.includes('contract')) {
      return {
        chip: 'bg-purple-50 text-purple-700 border-purple-200',
        iconWrap: 'bg-purple-50 text-purple-600',
        icon: '📄',
      };
    }

    if (normalized.includes('deliverable')) {
      return {
        chip: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        iconWrap: 'bg-emerald-50 text-emerald-600',
        icon: '📦',
      };
    }

    if (normalized.includes('review')) {
      return {
        chip: 'bg-amber-50 text-amber-700 border-amber-200',
        iconWrap: 'bg-amber-50 text-amber-600',
        icon: '⭐',
      };
    }

    if (normalized.includes('report')) {
      return {
        chip: 'bg-rose-50 text-rose-700 border-rose-200',
        iconWrap: 'bg-rose-50 text-rose-600',
        icon: '🚩',
      };
    }

    return {
      chip: 'bg-slate-100 text-slate-700 border-slate-200',
      iconWrap: 'bg-slate-100 text-slate-600',
      icon: '🔔',
    };
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="px-6 py-8 max-w-7xl mx-auto text-slate-900">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-600">
              Inbox
            </p>
            <h1 className="mt-2 text-2xl md:text-3xl font-bold tracking-tight">
              Notifications
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Review activity across proposals, contracts, deliverables, reports, and reviews.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700">
                Unread
              </p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-amber-700">
                {unreadCount}
              </p>
            </div>

            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-100 transition-colors"
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white border border-teal-200 text-[11px]">
                ✓
              </span>
              <span>Mark all as read</span>
            </button>
          </div>
        </header>

        <section className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              key: 'all',
              label: 'All notifications',
              hint: 'Everything in one place',
              color: 'text-teal-600',
              bg: 'bg-teal-50',
              border: 'border-teal-200',
            },
            {
              key: 'unread',
              label: 'Unread',
              hint: 'Needs your attention',
              color: 'text-amber-600',
              bg: 'bg-amber-50',
              border: 'border-amber-200',
            },
            {
              key: 'read',
              label: 'Read',
              hint: 'Already reviewed',
              color: 'text-indigo-600',
              bg: 'bg-indigo-50',
              border: 'border-indigo-200',
            },
          ].map((option) => {
            const active = filter === option.key;

            return (
              <button
                key={option.key}
                type="button"
                onClick={() => {
                  setPage(1);
                  setFilter(option.key);
                }}
                className={`rounded-2xl border px-4 py-4 text-left shadow-sm transition ${
                  active
                    ? `${option.border} ${option.bg} ring-2 ring-offset-1 ring-offset-slate-50 ${
                        option.key === 'all'
                          ? 'ring-teal-200'
                          : option.key === 'unread'
                          ? 'ring-amber-200'
                          : 'ring-indigo-200'
                      }`
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {option.label}
                  </p>
                  <span
                    className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-white border ${option.border} ${option.color}`}
                  >
                    {active ? 'Active' : 'View'}
                  </span>
                </div>

                <p className={`mt-2 text-base font-semibold ${option.color}`}>
                  {option.label}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">{option.hint}</p>
              </button>
            );
          })}
        </section>

        {error && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
            {typeof error === 'string' ? error : 'Failed to load notifications.'}
          </div>
        )}

        <section className="mt-8 space-y-4">
          {isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-slate-500">
              Loading notifications...
            </div>
          ) : notifications.items.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                🔔
              </div>
              <h2 className="text-lg font-semibold text-slate-900">No notifications yet</h2>
              <p className="mt-2 text-sm text-slate-500 max-w-xl mx-auto">
                When someone interacts with your proposals, contracts, deliverables, reports, or reviews, updates will appear here.
              </p>
            </div>
          ) : (
            notifications.items.map((item) => {
              const id = item.notificationID ?? item.id;
              const title = item.title ?? 'Notification';
              const message = item.message ?? '';
              const type = item.type ?? 'General';
              const isRead = Boolean(item.isRead);
              const createdAt = item.createdAt ?? item.created_at;
              const typeStyles = getTypeStyles(type);

              return (
                <div
                  key={id}
                  className={`relative overflow-hidden rounded-2xl border shadow-sm transition ${
                    isRead
                      ? 'border-slate-200 bg-white'
                      : 'border-teal-200 bg-teal-50/40'
                  }`}
                >
                  {!isRead && (
                    <div className="absolute inset-y-0 left-0 w-1 bg-teal-500" />
                  )}

                  <div className="p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start gap-3">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${typeStyles.iconWrap}`}
                          >
                            {typeStyles.icon}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] ${
                                  isRead
                                    ? 'bg-slate-100 text-slate-500 border border-slate-200'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}
                              >
                                {isRead ? 'Read' : 'Unread'}
                              </span>

                              <span
                                className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${typeStyles.chip}`}
                              >
                                {type}
                              </span>
                            </div>

                            <h2 className="text-lg font-semibold text-slate-900">
                              {title}
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                              {message}
                            </p>
                            <p className="mt-3 text-xs text-slate-400">
                              {createdAt ? new Date(createdAt).toLocaleString() : '-'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        {!isRead && (
                          <button
                            type="button"
                            onClick={() => handleMarkAsRead(id)}
                            className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                          >
                            Mark as read
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDelete(id)}
                          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </section>

        {notifications.items.length > 0 && (
          <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Page <span className="font-semibold text-slate-900">{page}</span> of{' '}
              <span className="font-semibold text-slate-900">{totalPages}</span>
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}