import { useState, useEffect } from 'react';
import { Bell, X, Check, Calendar, UserCheck, UserX, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { notificationAPI, NotificationResponse } from '@/lib/api/notificationApi';
import { sessionInvitationAPI } from '@/lib/api/sessionInvitationApi';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationViewer({ isOpen, onClose }: NotificationViewerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'invitations' | 'reminders' | 'updates'>('all');

  useEffect(() => {
    if (isOpen && user) {
      loadNotifications();
    }
  }, [isOpen, user]);

  const loadNotifications = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const data = await notificationAPI.getUserNotifications(user.id);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notifications',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleAcceptInvitation = async (notification: NotificationResponse) => {
    if (!user?.id || !notification.sessionId) return;

    try {
      // Find the invitation by checking pending invitations
      const invitations = await sessionInvitationAPI.getPendingInvitations(user.id);
      const invitation = invitations.find(inv => inv.sessionId === notification.sessionId);
      
      if (invitation) {
        await sessionInvitationAPI.acceptInvitation(invitation.id, user.id);
        await handleMarkAsRead(notification.id);
        
        toast({
          title: 'Invitation Accepted',
          description: 'You have successfully joined the session',
        });
        
        // Reload notifications
        loadNotifications();
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept invitation',
        variant: 'destructive',
      });
    }
  };

  const handleDeclineInvitation = async (notification: NotificationResponse) => {
    if (!user?.id || !notification.sessionId) return;

    try {
      const invitations = await sessionInvitationAPI.getPendingInvitations(user.id);
      const invitation = invitations.find(inv => inv.sessionId === notification.sessionId);
      
      if (invitation) {
        await sessionInvitationAPI.declineInvitation(invitation.id, user.id);
        await handleMarkAsRead(notification.id);
        
        toast({
          title: 'Invitation Declined',
          description: 'You have declined the session invitation',
        });
        
        loadNotifications();
      }
    } catch (error) {
      console.error('Error declining invitation:', error);
      toast({
        title: 'Error',
        description: 'Failed to decline invitation',
        variant: 'destructive',
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'INVITATION':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'ACCEPTED':
        return <UserCheck className="w-5 h-5 text-green-500" />;
      case 'DECLINED':
        return <UserX className="w-5 h-5 text-red-500" />;
      case 'REMINDER':
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'SESSION_UPDATE':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'SESSION_CANCELLED':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      INVITATION: 'Invitation',
      ACCEPTED: 'Accepted',
      DECLINED: 'Declined',
      REMINDER: 'Reminder',
      SESSION_UPDATE: 'Update',
      SESSION_CANCELLED: 'Cancelled',
      GENERAL: 'General',
    };
    return labels[type] || type;
  };

  const filterNotifications = (filter: string) => {
    switch (filter) {
      case 'invitations':
        return notifications.filter(n => n.type === 'INVITATION');
      case 'reminders':
        return notifications.filter(n => n.type === 'REMINDER');
      case 'updates':
        return notifications.filter(n => ['SESSION_UPDATE', 'SESSION_CANCELLED', 'ACCEPTED', 'DECLINED'].includes(n.type));
      default:
        return notifications;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifications = filterNotifications(activeTab);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Notification Panel */}
      <div className="fixed top-16 right-4 left-4 sm:left-auto w-auto sm:w-full sm:max-w-md h-[calc(100vh-5rem)] bg-background border border-border rounded-lg shadow-2xl z-50 flex flex-col animate-in slide-in-from-top-4 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
            <h2 className="text-base sm:text-lg font-semibold truncate">Notifications</h2>
            {unreadCount > 0 && (
              <Badge variant="default" className="ml-1 sm:ml-2 flex-shrink-0">
                {unreadCount}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-4 mx-2 sm:mx-4 mt-2 flex-shrink-0">
            <TabsTrigger value="all" className="text-[10px] sm:text-xs px-1 sm:px-3">
              <span className="hidden sm:inline">All</span>
              <span className="sm:hidden">All</span>
              {notifications.length > 0 && (
                <Badge variant="secondary" className="ml-0.5 sm:ml-1 h-4 w-4 sm:h-5 sm:w-5 p-0 text-[10px] sm:text-xs flex items-center justify-center">
                  {notifications.length > 99 ? '99+' : notifications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="invitations" className="text-[10px] sm:text-xs px-1 sm:px-3">
              <span className="hidden sm:inline">Invites</span>
              <span className="sm:hidden">Inv</span>
              {notifications.filter(n => n.type === 'INVITATION').length > 0 && (
                <Badge variant="secondary" className="ml-0.5 sm:ml-1 h-4 w-4 sm:h-5 sm:w-5 p-0 text-[10px] sm:text-xs flex items-center justify-center">
                  {notifications.filter(n => n.type === 'INVITATION').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="reminders" className="text-[10px] sm:text-xs px-1 sm:px-3">
              <span className="hidden sm:inline">Reminders</span>
              <span className="sm:hidden">Rem</span>
              {notifications.filter(n => n.type === 'REMINDER').length > 0 && (
                <Badge variant="secondary" className="ml-0.5 sm:ml-1 h-4 w-4 sm:h-5 sm:w-5 p-0 text-[10px] sm:text-xs flex items-center justify-center">
                  {notifications.filter(n => n.type === 'REMINDER').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="updates" className="text-[10px] sm:text-xs px-1 sm:px-3">
              <span className="hidden sm:inline">Updates</span>
              <span className="sm:hidden">Upd</span>
              {notifications.filter(n => ['SESSION_UPDATE', 'SESSION_CANCELLED', 'ACCEPTED', 'DECLINED'].includes(n.type)).length > 0 && (
                <Badge variant="secondary" className="ml-0.5 sm:ml-1 h-4 w-4 sm:h-5 sm:w-5 p-0 text-[10px] sm:text-xs flex items-center justify-center">
                  {notifications.filter(n => ['SESSION_UPDATE', 'SESSION_CANCELLED', 'ACCEPTED', 'DECLINED'].includes(n.type)).length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Content */}
          <TabsContent value={activeTab} className="flex-1 m-0 p-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-2 sm:p-4 space-y-2">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                    <Bell className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">No notifications</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      You're all caught up!
                    </p>
                  </div>
                ) : (
                  filteredNotifications.map((notification, index) => (
                    <div key={notification.id}>
                      <Card
                        className={`p-2 sm:p-3 transition-all hover:shadow-md ${
                          !notification.read ? 'bg-primary/5 border-primary/20' : 'bg-card'
                        }`}
                      >
                        <div className="flex gap-2 sm:gap-3">
                          {/* Icon */}
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1 sm:gap-2 mb-1 flex-wrap">
                              <Badge variant="outline" className="text-[10px] sm:text-xs">
                                {getNotificationTypeLabel(notification.type)}
                              </Badge>
                              <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                              </span>
                            </div>

                            <p className="text-xs sm:text-sm text-foreground mb-2 break-words">{notification.message}</p>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                              {notification.type === 'INVITATION' && !notification.read && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="default"
                                    className="h-7 text-[10px] sm:text-xs px-2 sm:px-3"
                                    onClick={() => handleAcceptInvitation(notification)}
                                  >
                                    <Check className="w-3 h-3 mr-1" />
                                    Accept
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-[10px] sm:text-xs px-2 sm:px-3"
                                    onClick={() => handleDeclineInvitation(notification)}
                                  >
                                    <X className="w-3 h-3 mr-1" />
                                    Decline
                                  </Button>
                                </>
                              )}
                              {!notification.read && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 text-[10px] sm:text-xs ml-auto px-2 sm:px-3"
                                  onClick={() => handleMarkAsRead(notification.id)}
                                >
                                  <span className="hidden sm:inline">Mark as read</span>
                                  <span className="sm:hidden">Read</span>
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                      {index < filteredNotifications.length - 1 && (
                        <Separator className="my-1 sm:my-2" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
