import { useCallback, useState } from 'react';
import { conversationService } from '../lib/conversationService';

export function useInboxUnread() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUnreadCount = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await conversationService.getUnreadCount();

      const count =
        typeof response === 'number'
          ? response
          : typeof response?.data === 'number'
            ? response.data
            : typeof response?.value === 'number'
              ? response.value
              : typeof response?.count === 'number'
                ? response.count
                : 0;

      setUnreadCount(count);
      return count;
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        'Failed to fetch inbox unread count.'
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    unreadCount,
    setUnreadCount,
    isLoading,
    error,
    fetchUnreadCount,
  };
}