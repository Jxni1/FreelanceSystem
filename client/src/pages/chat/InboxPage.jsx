import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useConversations } from '../../hooks/useConversations';

export default function InboxPage() {
  const {
    conversations,
    pendingRequests,
    isLoading,
    error,
    fetchMyConversations,
    fetchPendingRequests,
  } = useConversations();

  useEffect(() => {
    fetchMyConversations().catch(() => {});
    fetchPendingRequests().catch(() => {});
  }, [fetchMyConversations, fetchPendingRequests]);

  const items = [
    ...pendingRequests.map((item) => ({ ...item, section: 'request' })),
    ...conversations.map((item) => ({ ...item, section: 'conversation' })),
  ]
    .filter(
      (item, index, self) =>
        index === self.findIndex((x) => x.conversationID === item.conversationID)
    )
    .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));

  const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusClasses = (status) => {
    if (status === 'Accepted') {
      return 'border border-emerald-200 bg-emerald-50 text-emerald-700';
    }
    if (status === 'Pending') {
      return 'border border-amber-200 bg-amber-50 text-amber-700';
    }
    if (status === 'Rejected') {
      return 'border border-rose-200 bg-rose-50 text-rose-700';
    }
    return 'border border-slate-200 bg-slate-100 text-slate-700';
  };

  const getInitials = (item) => {
    const left = item.clientUsername?.[0] || '';
    const right = item.freelancerUsername?.[0] || '';
    return `${left}${right}`.toUpperCase() || 'IN';
  };

  const InboxSkeleton = () => (
    <div className="space-y-3 p-4 sm:p-6">
      {[1, 2, 3].map((row) => (
        <div
          key={row}
          className="animate-pulse rounded-2xl border border-slate-200 bg-white/80 p-4"
        >
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-slate-200" />
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="h-4 w-40 rounded bg-slate-200" />
                <div className="h-4 w-16 rounded bg-slate-200" />
              </div>
              <div className="h-3 w-28 rounded bg-slate-100" />
              <div className="h-3 w-full rounded bg-slate-100" />
              <div className="h-3 w-2/3 rounded bg-slate-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-teal-50/60 px-5 py-5 sm:px-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-700">
                Messaging hub
              </div>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                Inbox
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">
                Review accepted conversations and pending message requests in one place.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:min-w-[220px]">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Total
                </div>
                <div className="mt-1 text-lg font-bold text-slate-900">
                  {items.length}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Requests
                </div>
                <div className="mt-1 text-lg font-bold text-amber-600">
                  {pendingRequests.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-4 mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:mx-6">
            {typeof error === 'string'
              ? error
              : error.message || 'Failed to load inbox.'}
          </div>
        )}

        {isLoading ? (
          <InboxSkeleton />
        ) : items.length === 0 ? (
          <div className="px-6 py-16 text-center sm:px-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
              💬
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No conversations yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              New message requests and accepted chats will appear here once someone starts a conversation with you.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 p-3 sm:gap-4 sm:p-5">
            {items.map((item) => {
              const isRequest = item.section === 'request';
              const isUnread = Boolean(item.unreadCount && item.unreadCount > 0);

              return (
                <Link
                  key={item.conversationID}
                  to={`/chat/${item.conversationID}`}
                  className="group block rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-200 hover:bg-slate-50/70 hover:shadow-[0_12px_24px_rgba(15,23,42,0.06)] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                >
                  <div className="flex items-start gap-4">
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 text-sm font-bold text-white shadow-sm">
                      {getInitials(item)}
                      {isUnread && (
                        <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-rose-500" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="truncate text-sm font-semibold text-slate-900 sm:text-[15px]">
                              {item.clientUsername} ↔ {item.freelancerUsername}
                            </h2>

                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusClasses(
                                item.status
                              )}`}
                            >
                              {item.status}
                            </span>

                            {isRequest && (
                              <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                                Request
                              </span>
                            )}

                            {isUnread && (
                              <span className="rounded-full bg-rose-500 px-2 py-1 text-[11px] font-bold text-white shadow-sm">
                                {item.unreadCount > 99 ? '99+' : item.unreadCount} new
                              </span>
                            )}
                          </div>

                          <p
                            className={`mt-2 line-clamp-2 text-sm leading-6 ${
                              isUnread ? 'font-medium text-slate-700' : 'text-slate-500'
                            }`}
                          >
                            {item.lastMessage || 'No messages yet.'}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                            <span className="rounded-full bg-slate-100 px-2.5 py-1">
                              Updated {formatDate(item.updatedAt)}
                            </span>

                            {item.contractID && (
                              <span className="rounded-full bg-teal-50 px-2.5 py-1 text-teal-700">
                                Contract chat
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0">
                          <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition group-hover:border-teal-200 group-hover:text-teal-700">
                            Open
                            <span className="ml-1 transition-transform duration-200 group-hover:translate-x-0.5">
                              →
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}