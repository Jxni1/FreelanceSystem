import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAuthorization } from '../hooks/useAuthorization';
import { useNotifications } from '../hooks/useNotifications';

export function AppShell() {
  const { logout } = useAuth();
  const { isAdmin, isClient, isFreelancer } = useAuthorization();
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    isLoading: notificationsLoading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationMenuRef = useRef(null);

  useEffect(() => {
    fetchUnreadCount().catch(() => {});
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (!isNotificationsOpen) return;

    fetchNotifications({ page: 1, pageSize: 6 }).catch(() => {});
  }, [isNotificationsOpen, fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationMenuRef.current &&
        !notificationMenuRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleNotifications = async () => {
    const nextOpen = !isNotificationsOpen;
    setIsNotificationsOpen(nextOpen);

    if (nextOpen) {
      try {
        await fetchNotifications({ page: 1, pageSize: 6 });
        await fetchUnreadCount();
      } catch {
      }
    }
  };

  const handleNotificationClick = async (item) => {
    try {
      if (!item.isRead) {
        await markAsRead(item.notificationID);
      }

      setIsNotificationsOpen(false);

      const target = getNotificationTarget(item);
      if (target) {
        navigate(target);
      } else {
        navigate('/notifications');
      }
    } catch {
      navigate('/notifications');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch {
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <NavLink
            to={isFreelancer ? '/discover' : '/home'}
            className="font-semibold tracking-wide text-teal-600 hover:text-teal-700"
          >
            Freelance System
          </NavLink>

          <nav className="flex items-center gap-1">
            {isFreelancer && (
              <>
                <NavItem to="/discover">Discover</NavItem>
                <NavItem to="/clients">Clients</NavItem>
                <NavItem to="/my-work">My Work</NavItem>
                <NavItem to="/contracts">Contracts</NavItem>
                <NavItem to="/reviews">Reviews</NavItem>
              </>
            )}

            {isClient && (
              <>
                <NavItem to="/home">Dashboard</NavItem>
                <NavItem to="/projects">Projects</NavItem>
                <NavItem to="/freelancers">Freelancers</NavItem>
                <NavItem to="/contracts">Contracts</NavItem>
                <NavItem to="/reviews">Reviews</NavItem>
              </>
            )}

            {isAdmin && (
              <>
                <NavItem to="/admin">Admin Panel</NavItem>
              </>
            )}
<NavItem to="/notifications">Notifications</NavItem>
            <NavItem to="/profile">Profile</NavItem>

            <div className="relative ml-2" ref={notificationMenuRef}>
              <button
                type="button"
                onClick={toggleNotifications}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                aria-label="Open notifications"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
                  <path d="M9 17a3 3 0 0 0 6 0" />
                </svg>

                {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-amber-400 text-amber-950 text-[11px] font-bold flex items-center justify-center shadow ring-2 ring-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-[380px] max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Notifications</p>
                      <p className="text-xs text-slate-500">
                        {unreadCount > 0
                          ? `${unreadCount} unread`
                          : 'You are all caught up'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleMarkAllAsRead}
                      className="text-xs font-medium text-teal-600 hover:text-teal-700"
                    >
                      Mark all read
                    </button>
                  </div>

                  <div className="max-h-[420px] overflow-y-auto">
                    {notificationsLoading ? (
                      <div className="p-4 space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className="rounded-xl border border-slate-200 p-3 animate-pulse"
                          >
                            <div className="h-3 w-24 bg-slate-200 rounded mb-2" />
                            <div className="h-3 w-40 bg-slate-200 rounded mb-2" />
                            <div className="h-3 w-full bg-slate-100 rounded" />
                          </div>
                        ))}
                      </div>
                    ) : notifications.items.length === 0 ? (
                      <div className="px-4 py-10 text-center">
                        <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <svg
                            className="h-6 w-6"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
                            <path d="M9 17a3 3 0 0 0 6 0" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-slate-700">No notifications yet</p>
                        <p className="mt-1 text-xs text-slate-500">
                          New project, contract, and system activity will appear here.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {notifications.items.map((item) => (
                          <button
                            key={item.notificationID}
                            type="button"
                            onClick={() => handleNotificationClick(item)}
                            className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors ${
                              !item.isRead ? 'bg-teal-50/60' : 'bg-white'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`mt-1 h-2.5 w-2.5 rounded-full flex-shrink-0 ${!item.isRead ? 'bg-teal-500' : 'bg-slate-300'}`} />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-3">
                                  <p className="truncate text-sm font-semibold text-slate-900">
                                    {item.title || 'Notification'}
                                  </p>
                                  <span className="shrink-0 text-[11px] text-slate-400">
                                    {formatNotificationDate(item.createdAt)}
                                  </span>
                                </div>

                                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                                  {item.type || 'General'}
                                </p>

                                <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                                  {item.message}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsNotificationsOpen(false);
                        navigate('/notifications');
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={logout}
              className="ml-2 px-3 py-1.5 rounded-md text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Sign Out
            </button>
          </nav>
        </div>
      </header>

      <main className="py-6">
        <Outlet />
      </main>
    </div>
  );
}

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-1.5 rounded-md text-sm transition-colors ${
          isActive
            ? 'bg-teal-600 text-white'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`
      }
    >
      {children}
    </NavLink>
  );
}

function formatNotificationDate(value) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const diffMs = now - date;
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

  if (type === 'contract') return '/contracts';
  if (type === 'proposal') return '/contracts';
  if (type === 'report') return '/admin';
  if (type === 'project') return '/projects';
  if (type === 'review') return '/reviews';

  return '/notifications';
}