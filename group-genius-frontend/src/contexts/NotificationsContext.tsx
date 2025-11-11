import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { sessionInvitationAPI } from '../lib/api/sessionInvitationApi';
import { useAuth } from './AuthContext';
import { notificationAPI, type NotificationResponse } from '../lib/api/notificationApi';

export type NotificationStatus = 'read' | 'unread';
export type NotificationType = 'reminder' | 'invitation' | 'session-update';

export type Notification = {
  id: number;
  type: NotificationType;
  message: string;
  status: NotificationStatus;
  timestamp: string;
  channel: 'email' | 'in-app' | 'both';
  session?: string;
  invitation?: string;
};

// Map backend notification to UI model
const mapDto = (dto: NotificationResponse): Notification => {
  const guessType = (): NotificationType => {
    const m = (dto.message || '').toLowerCase();
    if (m.includes('invite')) return 'invitation';
    if (m.includes('resched') || m.includes('updated') || m.includes('cancel')) return 'session-update';
    return 'reminder';
  };
  const d = new Date(dto.createdAt);
  const timestamp = isNaN(d.getTime()) ? dto.createdAt : d.toLocaleString();
    return {
    id: dto.id,
    type: guessType(),
    message: dto.message,
    status: dto.read ? 'read' : 'unread',
    timestamp,
    channel: 'in-app',
      session: dto.sessionId ? String(dto.sessionId) : undefined,
      invitation: (dto as any).invitationId ? String((dto as any).invitationId) : undefined,
  };
};

type ContextValue = {
  notifications: Notification[];
  unreadCount: number;
  filteredNotifications: Notification[];
  isOpen: boolean;
  showOnlyUnread: boolean;
  activeFilter: 'all' | NotificationType;
  togglePanel: () => void;
  setActiveFilter: (f: 'all' | NotificationType) => void;
  setShowOnlyUnread: (v: boolean) => void;
  markAllAsRead: () => void;
  resetAlerts: () => void;
  toggleStatus: (id: number) => void;
  deleteNotification: (id: number) => void;
  addNotification: (n: Notification) => void;
  respondToInvitation: (invitationId: number, action: 'accept' | 'decline', notificationId?: number) => Promise<void>;
};

const NotificationsContext = createContext<ContextValue | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilterState] = useState<'all' | NotificationType>('all');
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const { user } = useAuth();

  const unreadCount = useMemo(() => notifications.filter(n => n.status === 'unread').length, [notifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      if (activeFilter !== 'all' && notification.type !== activeFilter) return false;
      if (showOnlyUnread && notification.status !== 'unread') return false;
      return true;
    });
  }, [notifications, activeFilter, showOnlyUnread]);

  const togglePanel = () => setIsOpen((v) => !v);

  const setActiveFilter = (f: 'all' | NotificationType) => setActiveFilterState(f);

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => n.status === 'unread');
    setNotifications(prev => prev.map(n => n.status === 'unread' ? { ...n, status: 'read' } : n));
    // fire-and-forget backend updates
    try {
      await Promise.allSettled(unread.map(n => notificationAPI.markAsRead(n.id)));
    } catch { /* ignore */ }
  };

  const resetAlerts = () => {
    setActiveFilterState('all');
    setShowOnlyUnread(false);
    // re-fetch from backend
    void load();
  };

  const toggleStatus = async (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: n.status === 'unread' ? 'read' : 'unread' } : n));
    try { await notificationAPI.markAsRead(id); } catch { /* ignore */ }
  };

  const deleteNotification = (id: number) => setNotifications(prev => prev.filter(n => n.id !== id));

  const addNotification = (n: Notification) => setNotifications(prev => [n, ...prev]);

  const load = useCallback(async () => {
    const uid = user?.id ?? (() => {
      try { const raw = localStorage.getItem('user'); return raw ? JSON.parse(raw).id : undefined; } catch { return undefined; }
    })();
    if (!uid) return;
    try {
      const data = await notificationAPI.getUserNotifications(uid);
      setNotifications(data.map(mapDto));
    } catch (e) {
      console.error('Failed to load notifications', e);
    }
  }, [user?.id]);

  useEffect(() => { void load(); }, [load]);

  // Respond to an invitation (accept/decline). Uses authenticated user id from AuthContext when available.
  const respondToInvitation = async (invitationId: number, action: 'accept' | 'decline', notificationId?: number) => {
    try {
      const userId = user?.id ?? (() => {
        // fallback to localStorage-stored user as a last resort
        try {
          const raw = localStorage.getItem('user');
          if (!raw) return undefined;
          const parsed = JSON.parse(raw);
          return parsed?.id;
        } catch { return undefined; }
      })();

      if (!userId) throw new Error('Not authenticated');

      // Call backend endpoint - for session invitations we need to use accept/decline methods
      if (action === 'accept') {
        await sessionInvitationAPI.acceptInvitation(invitationId, userId);
      } else {
        await sessionInvitationAPI.declineInvitation(invitationId, userId);
      }

      // Update local notifications state: remove the notification or mark read
      if (notificationId) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      } else {
        setNotifications(prev => prev.filter(n => n.id !== invitationId));
      }

      // If accepted, broadcast an application event so other parts can refresh
      if (action === 'accept') {
        try {
          window.dispatchEvent(new CustomEvent('invitation:accepted', { detail: { invitationId } }));
        } catch (err) { /* ignore */ }
      }

      // Refresh notifications from backend so new notifications show up
      void load();
    } catch (err) {
      console.error('respondToInvitation error', err);
      throw err;
    }
  };

  const value: ContextValue = {
    notifications,
    unreadCount,
    filteredNotifications,
    isOpen,
    showOnlyUnread,
    activeFilter,
    togglePanel,
    setActiveFilter,
    setShowOnlyUnread,
    markAllAsRead,
    resetAlerts,
    toggleStatus,
    deleteNotification,
    addNotification
    , respondToInvitation
  };

  return (
    <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
  );
};

export const useNotifications = (): ContextValue => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
};

export default NotificationsContext;
