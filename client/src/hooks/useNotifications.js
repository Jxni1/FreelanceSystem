import { useState, useCallback } from 'react';
import { notificationService } from '../lib/notificationService';


export function useNotifications() {
  const [notifications, setNotifications] = useState({
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: 10,
  });
  const [notification, setNotification] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const normalizeNotification = (item = {}) => ({
    ...item,
    notificationID:
      item.notificationID ?? item.notificationId ?? item.NotificationID,
    userID: item.userID ?? item.userId ?? item.UserID,
    type: item.type ?? item.Type,
    title: item.title ?? item.Title,
    message: item.message ?? item.Message,
    createdAt: item.createdAt ?? item.CreatedAt,
    isRead: item.isRead ?? item.IsRead ?? false,
  });

  const normalizeNotificationsPayload = (data, params = {}) => {
    const rawItems = Array.isArray(data)
      ? data
      : Array.isArray(data?.items)
        ? data.items
        : [];

    const items = rawItems.map(normalizeNotification);

    return {
      items,
      totalCount: data?.totalCount ?? items.length,
      page: data?.page ?? params.page ?? 1,
      pageSize: data?.pageSize ?? params.pageSize ?? 10,
    };
  };

  const fetchNotifications = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await notificationService.getAll(params);
      const normalizedData = normalizeNotificationsPayload(data, params);
      setNotifications(normalizedData);
      return normalizedData;
    } catch (err) {
      console.error('Failed to fetch notifications', err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          'Failed to load notifications.'
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchNotificationById = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await notificationService.getById(id);
      const normalized = normalizeNotification(data);
      setNotification(normalized);
      return normalized;
    } catch (err) {
      console.error('Failed to fetch notification', err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          'Failed to load notification.'
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await notificationService.getUnreadCount();
      const count =
        typeof data === 'number'
          ? data
          : data?.value ?? data?.count ?? data?.data ?? 0;

      setUnreadCount(count);
      return count;
    } catch (err) {
      console.error('Failed to fetch unread count', err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          'Failed to load unread count.'
      );
      throw err;
    }
  }, []);

  const createNotification = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const created = await notificationService.create(data);
      return normalizeNotification(created);
    } catch (err) {
      console.error('Failed to create notification', err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          'Failed to create notification.'
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateNotification = async (id, data) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await notificationService.update(id, data);
      return normalizeNotification(updated);
    } catch (err) {
      console.error('Failed to update notification', err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          'Failed to update notification.'
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await notificationService.markAsRead(id);

      setNotifications((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.notificationID === id ? { ...item, isRead: true } : item
        ),
      }));

      setNotification((prev) =>
        prev?.notificationID === id ? { ...prev, isRead: true } : prev
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
      return result;
    } catch (err) {
      console.error('Failed to mark notification as read', err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          'Failed to mark notification as read.'
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const markAsUnread = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await notificationService.markAsUnread(id);

      setNotifications((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.notificationID === id ? { ...item, isRead: false } : item
        ),
      }));

      setNotification((prev) =>
        prev?.notificationID === id ? { ...prev, isRead: false } : prev
      );

      setUnreadCount((prev) => prev + 1);
      return result;
    } catch (err) {
      console.error('Failed to mark notification as unread', err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          'Failed to mark notification as unread.'
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const markAllAsRead = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await notificationService.markAllAsRead();

      setNotifications((prev) => ({
        ...prev,
        items: prev.items.map((item) => ({ ...item, isRead: true })),
      }));

      setNotification((prev) => (prev ? { ...prev, isRead: true } : prev));
      setUnreadCount(0);

      return result;
    } catch (err) {
      console.error('Failed to mark all notifications as read', err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          'Failed to mark all notifications as read.'
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteNotification = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      await notificationService.delete(id);

      const deletedItem = notifications.items.find(
        (item) => item.notificationID === id
      );

      setNotifications((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.notificationID !== id),
        totalCount: Math.max(0, prev.totalCount - 1),
      }));

      if (deletedItem && !deletedItem.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      if (notification?.notificationID === id) {
        setNotification(null);
      }

      return true;
    } catch (err) {
      console.error('Failed to delete notification', err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          'Failed to delete notification.'
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAllReadNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await notificationService.deleteAllRead();

      setNotifications((prev) => ({
        ...prev,
        items: prev.items.filter((item) => !item.isRead),
      }));

      return true;
    } catch (err) {
      console.error('Failed to delete all read notifications', err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          'Failed to delete read notifications.'
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    notifications,
    notification,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    fetchNotificationById,
    fetchUnreadCount,
    createNotification,
    updateNotification,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    deleteAllReadNotifications,
  };
}