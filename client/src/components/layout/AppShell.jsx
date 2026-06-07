import { useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useInboxUnread } from '../../hooks/useInboxUnread';
import { createChatConnection } from '../../lib/chatHub';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppShell() {
  const { accessToken, user } = useAuth();
  const {
    unreadCount: inboxUnread,
    setUnreadCount: setInboxUnread,
    fetchUnreadCount: fetchInboxUnread,
  } = useInboxUnread();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    fetchInboxUnread().catch(() => {});
  }, [fetchInboxUnread]);

  useEffect(() => {
    if (!accessToken) return undefined;

    const connection = createChatConnection(() => accessToken);
    if (!connection) return undefined;

    socketRef.current = connection;

    const refetchUnread = () => {
      fetchInboxUnread().catch(() => {});
    };

    connection.on('inbox_unread_count_updated', (payload) => {
      setInboxUnread(payload?.unreadCount ?? 0);
    });

    connection.on('message_created', (payload) => {
      if (
        payload?.senderUserID &&
        user?.id &&
        String(payload.senderUserID).toLowerCase() !== String(user.id).toLowerCase()
      ) {
        refetchUnread();
      }
    });

    connection.on('message_request_received', refetchUnread);
    connection.on('conversation_created', refetchUnread);
    connection.on('conversation_request_accepted', refetchUnread);
    connection.on('conversation_request_rejected', refetchUnread);
    connection.on('conversation_updated', refetchUnread);

    let cancelled = false;

    connection
      .start()
      .then(() => {
        if (cancelled) return undefined;
        return connection.invoke('GetUnreadCount');
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      socketRef.current = null;
      connection.stop().catch(() => {});
    };
  }, [accessToken, user?.id, fetchInboxUnread, setInboxUnread]);

  return (
    <div className="flex min-h-screen bg-canvas text-slate-900">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} inboxUnread={inboxUnread} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setSidebarOpen(true)} inboxUnread={inboxUnread} />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppShell;
