import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, MessageSquare, Bell } from 'lucide-react';
import { useAuthorization } from '../../hooks/useAuthorization';
import { useProfileContext } from '../../context/ProfileContext';
import { useNotifications } from '../../hooks/useNotifications';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { resolveUploadUrl } from '../../lib/media';

const ROLE_META = {
  client: { search: 'Search talent, jobs, contracts...', workspace: 'Client workspace' },
  freelancer: { search: 'Search jobs, skills, clients...', workspace: 'Freelancer workspace' },
  admin: { search: 'Search users, jobs, tickets...', workspace: 'Admin workspace' },
};

export function Topbar({ onMenu, inboxUnread = 0 }) {
  const navigate = useNavigate();
  const { isAdmin, isFreelancer } = useAuthorization();
  const { profile } = useProfileContext();

  const {
    notifications,
    unreadCount,
    isLoading: notificationsLoading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const [search, setSearch] = useState('');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const role = isAdmin ? 'admin' : isFreelancer ? 'freelancer' : 'client';
  const meta = ROLE_META[role];

  const fullName = profile ? `${profile.name ?? ''} ${profile.surname ?? ''}`.trim() : '';
  const displayName = fullName || profile?.username || '';

  useEffect(() => {
    fetchUnreadCount().catch(() => {});
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (!isNotifOpen) return;
    fetchNotifications({ page: 1, pageSize: 6 }).catch(() => {});
  }, [isNotifOpen, fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleNotif = () => {
    const next = !isNotifOpen;
    setIsNotifOpen(next);
    if (next) {
      fetchNotifications({ page: 1, pageSize: 6 }).catch(() => {});
      fetchUnreadCount().catch(() => {});
    }
  };

  const handleNotificationClick = async (item) => {
    try {
      if (!item.isRead) await markAsRead(item.notificationID);
      setIsNotifOpen(false);
      navigate(getNotificationTarget(item));
    } catch {
      navigate('/notifications');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-canvas/85 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        onClick={onMenu}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-white text-slate-600 transition-colors hover:bg-slate-50 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      <label className="relative w-full max-w-md flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={meta.search}
          className="h-10 w-full rounded-xl border border-line bg-white pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </label>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <Badge tone="brand" className="hidden sm:inline-flex">
          {meta.workspace}
        </Badge>

        <Link
          to="/inbox"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          aria-label="Messages"
        >
          <MessageSquare className="h-5 w-5" aria-hidden="true" />
          {inboxUnread > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-clay-500 ring-2 ring-canvas" />
          ) : null}
        </Link>

        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={toggleNotif}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
            {unreadCount > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-clay-500 px-1 text-xs font-bold text-white ring-2 ring-canvas">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            ) : null}
          </button>

          {isNotifOpen ? (
            <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-line bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Notifications</p>
                  <p className="text-xs text-slate-500">
                    {unreadCount > 0 ? `${unreadCount} unread` : 'You are all caught up'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => markAllAsRead().catch(() => {})}
                  className="text-xs font-medium text-brand-700 hover:text-brand-800"
                >
                  Mark all read
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notificationsLoading ? (
                  <div className="space-y-3 p-4">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="animate-pulse rounded-xl border border-line p-3">
                        <div className="mb-2 h-3 w-24 rounded bg-slate-200" />
                        <div className="mb-2 h-3 w-40 rounded bg-slate-200" />
                        <div className="h-3 w-full rounded bg-slate-100" />
                      </div>
                    ))}
                  </div>
                ) : notifications.items.length === 0 ? (
                  <div className="px-4 py-10 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <Bell className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <p className="text-sm font-medium text-slate-700">No notifications yet</p>
                    <p className="mt-1 text-xs text-slate-500">New project, contract, and system activity will appear here.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {notifications.items.map((item) => (
                      <button
                        key={item.notificationID}
                        type="button"
                        onClick={() => handleNotificationClick(item)}
                        className={`w-full px-4 py-3 text-left transition-colors hover:bg-slate-50 ${!item.isRead ? 'bg-brand-50/60' : 'bg-white'}`}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${!item.isRead ? 'bg-brand-500' : 'bg-slate-300'}`} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <p className="truncate text-sm font-semibold text-slate-900">{item.title || 'Notification'}</p>
                              <span className="shrink-0 text-xs text-slate-400">{formatNotificationDate(item.createdAt)}</span>
                            </div>
                            <p className="mt-1 line-clamp-2 text-sm text-slate-600">{item.message}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-line bg-slate-50 px-4 py-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsNotifOpen(false);
                    navigate('/notifications');
                  }}
                  className="w-full rounded-xl border border-line bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                >
                  View all notifications
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <Link
          to="/profile"
          aria-label="Your profile"
          className="rounded-full transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand-200"
        >
          <Avatar name={displayName} src={resolveUploadUrl(profile?.profilePhoto)} size="md" />
        </Link>
      </div>
    </header>
  );
}

function formatNotificationDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function getNotificationTarget(notification) {
  const type = (notification?.type || '').toLowerCase();
  if (type === 'contract' || type === 'proposal') return '/contracts';
  if (type === 'report') return '/admin/reports';
  if (type === 'project') return '/projects';
  if (type === 'review') return '/reviews';
  return '/notifications';
}

export default Topbar;
