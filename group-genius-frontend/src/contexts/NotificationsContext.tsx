import React, { createContext, useContext, useMemo, useState } from 'react';

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
};

const mockNotifications: Notification[] = [
  {
    id: 1,
    type: 'reminder',
    message: 'Study session "CS 101 Study Session" starts in 30 minutes.',
    status: 'unread',
    timestamp: 'Today • 1:30 PM',
    channel: 'both',
    session: 'CS 101 Study Session'
  },
  {
    id: 2,
    type: 'invitation',
    message: 'You have been invited to join "Physics Lab Project Team".',
    status: 'unread',
    timestamp: 'Today • 9:12 AM',
    channel: 'in-app',
    session: 'Physics Lab Project Team'
  },
  {
    id: 3,
    type: 'session-update',
    message: '"History Project Meeting" has been rescheduled to Nov 16, 1:00 PM.',
    status: 'read',
    timestamp: 'Yesterday • 8:05 PM',
    channel: 'email',
    session: 'History Project Meeting'
  }
];

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
};

const NotificationsContext = createContext<ContextValue | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilterState] = useState<'all' | NotificationType>('all');
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);

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

  const markAllAsRead = () => setNotifications((prev) => prev.map(n => n.status === 'unread' ? { ...n, status: 'read' } : n));

  const resetAlerts = () => {
    setNotifications(mockNotifications);
    setActiveFilterState('all');
    setShowOnlyUnread(false);
  };

  const toggleStatus = (id: number) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: n.status === 'unread' ? 'read' : 'unread' } : n));

  const deleteNotification = (id: number) => setNotifications(prev => prev.filter(n => n.id !== id));

  const addNotification = (n: Notification) => setNotifications(prev => [n, ...prev]);

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
