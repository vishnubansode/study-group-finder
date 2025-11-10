import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import EventForm, { EventFormData } from '@/components/group/EventForm';
import { useToast } from '@/components/ui/use-toast';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  MapPin,
  Users,
  AlertCircle,
  BookOpen,
  Video,
  Coffee,
  Bell,
  Mail,
  CircleCheck,
  ArrowRight,
  Clock4,
  UserPlus,
  RefreshCw,
  Trash2
} from 'lucide-react';

const currentDate = new Date();
const currentMonth = currentDate.getMonth();
const currentYear = currentDate.getFullYear();

const events = [
  {
    id: 1,
    title: 'CS 101 Study Session',
    type: 'study',
    date: '2024-11-15',
    time: '2:00 PM - 4:00 PM',
    location: 'Library Room 204',
    participants: 8,
    course: 'CS 101',
    description: 'Group study session for upcoming midterm exam'
  },
  {
    id: 2,
    title: 'Math Assignment Due',
    type: 'deadline',
    date: '2024-11-12',
    time: '11:59 PM',
    location: 'Online Submission',
    course: 'MATH 201',
    description: 'Integration Techniques Problem Set'
  },
  {
    id: 3,
    title: 'Physics Lab',
    type: 'class',
    date: '2024-11-13',
    time: '3:00 PM - 5:00 PM',
    location: 'Physics Building Lab 3',
    course: 'PHYS 151',
    description: 'Momentum and Collisions Experiment'
  },
  {
    id: 4,
    title: 'History Project Meeting',
    type: 'meeting',
    date: '2024-11-16',
    time: '1:00 PM - 2:00 PM',
    location: 'Student Center Room 301',
    participants: 4,
    course: 'HIST 120',
    description: 'Final project planning and research division'
  },
  {
    id: 5,
    title: 'Virtual Study Group',
    type: 'study',
    date: '2024-11-18',
    time: '7:00 PM - 9:00 PM',
    location: 'Zoom Meeting',
    participants: 12,
    course: 'CS 101',
    description: 'Online collaborative coding session'
  },
  {
    id: 6,
    title: 'Coffee & Study',
    type: 'informal',
    date: '2024-11-14',
    time: '10:00 AM - 12:00 PM',
    location: 'Campus Coffee Shop',
    participants: 3,
    course: 'MATH 201',
    description: 'Casual study session over coffee'
  }
];

const eventTypes = {
  study: { color: 'bg-primary', icon: Users, label: 'Study Session' },
  deadline: { color: 'bg-destructive', icon: AlertCircle, label: 'Deadline' },
  class: { color: 'bg-accent', icon: BookOpen, label: 'Class' },
  meeting: { color: 'bg-secondary', icon: Users, label: 'Meeting' },
  informal: { color: 'bg-muted-foreground', icon: Coffee, label: 'Informal' }
};

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type NotificationStatus = 'read' | 'unread';
type NotificationType = 'reminder' | 'invitation' | 'session-update';

type Notification = {
  id: number;
  type: NotificationType;
  message: string;
  status: NotificationStatus;
  timestamp: string;
  channel: 'email' | 'in-app' | 'both';
  session?: string;
};

const notificationTypeMeta: Record<NotificationType, { label: string; accent: string; icon: typeof Bell }> = {
  reminder: { label: 'Reminder', accent: 'bg-primary/10 text-primary', icon: Clock4 },
  invitation: { label: 'Invitation', accent: 'bg-secondary/10 text-secondary-foreground', icon: UserPlus },
  'session-update': { label: 'Session Update', accent: 'bg-accent/10 text-accent-foreground', icon: RefreshCw }
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
  },
  {
    id: 4,
    type: 'reminder',
    message: 'Assignment deadline "Math Assignment Due" approaches in 24 hours.',
    status: 'read',
    timestamp: 'Yesterday • 7:45 PM',
    channel: 'both',
    session: 'Math Assignment Due'
  },
  {
    id: 5,
    type: 'invitation',
    message: '"Virtual Study Group" host approved your request to join.',
    status: 'unread',
    timestamp: '2 days ago',
    channel: 'email',
    session: 'Virtual Study Group'
  }
];

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [currentViewDate, setCurrentViewDate] = useState(new Date(currentYear, currentMonth, 1));
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [activeNotificationFilter, setActiveNotificationFilter] = useState<'all' | NotificationType>('all');
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const { toast } = useToast();

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getEventsForDate = (date: string) => {
    return events.filter(event => event.date === date);
  };

  const getEventsForDay = (day: number | null) => {
    if (!day) return [];
    const dateString = `${currentViewDate.getFullYear()}-${String(currentViewDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return getEventsForDate(dateString);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentViewDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentViewDate(newDate);
  };

  const today = new Date().toISOString().split('T')[0];
  const todayEvents = getEventsForDate(today);
  const upcomingEvents = events
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const handleCreateEvent = async (data: EventFormData) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // await createStudySession(data);
      
      console.log('Creating event:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Session Created!",
        description: `"${data.title}" has been scheduled successfully.`,
      });
      
      setIsCreateDialogOpen(false);
      
      // TODO: Refresh events list after creation
      // await fetchEvents();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const unreadNotifications = useMemo(
    () => notifications.filter((notification) => notification.status === 'unread'),
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      if (activeNotificationFilter !== 'all' && notification.type !== activeNotificationFilter) {
        return false;
      }
      if (showOnlyUnread && notification.status !== 'unread') {
        return false;
      }
      return true;
    });
  }, [notifications, activeNotificationFilter, showOnlyUnread]);

  const handleNotificationStatusToggle = (id: number) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              status: notification.status === 'unread' ? 'read' : 'unread'
            }
          : notification
      )
    );
  };

  const handleNotificationDelete = (id: number) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.status === 'unread' ? { ...notification, status: 'read' } : notification
      )
    );
  };

  const resetAlerts = () => {
    setNotifications(mockNotifications);
    setActiveNotificationFilter('all');
    setShowOnlyUnread(false);
  };

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-8">
      {/* Header */}
      <div className="bg-gradient-secondary px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="heading-hero mb-4">Academic Calendar</h1>
              <p className="text-xl text-muted-foreground max-w-2xl">
                Stay organized with your study sessions, deadlines, and group meetings all in one place.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 relative">
              <div className="self-end sm:self-auto">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-11 w-11 rounded-full border border-border shadow-sm bg-background/80 hover:bg-background"
                  onClick={() => setIsNotificationPanelOpen((prev) => !prev)}
                >
                  <Bell className="h-5 w-5 text-foreground" />
                  {unreadNotifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-semibold text-destructive-foreground shadow-sm">
                      {unreadNotifications.length}
                    </span>
                  )}
                </Button>
                {isNotificationPanelOpen && (
                  <div className="absolute right-0 sm:right-auto sm:left-0 mt-3 w-[24rem] sm:w-[26rem] rounded-2xl border border-border bg-popover shadow-xl ring-1 ring-black/5">
                    <div className="flex items-center justify-between px-5 pt-5 pb-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">Notifications</p>
                        <p className="text-xs text-muted-foreground">
                          {unreadNotifications.length} unread • {notifications.length} total
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={unreadNotifications.length === 0}
                          onClick={markAllAsRead}
                        >
                          <CircleCheck className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={resetAlerts}
                          title="Restore sample alerts"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="px-5 pb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          size="sm"
                          variant={activeNotificationFilter === 'all' ? 'default' : 'outline'}
                          onClick={() => setActiveNotificationFilter('all')}
                          className="rounded-full px-4 py-1 text-xs"
                        >
                          All
                        </Button>
                        {(Object.keys(notificationTypeMeta) as NotificationType[]).map((type) => {
                          const meta = notificationTypeMeta[type];
                          return (
                            <Button
                              key={type}
                              size="sm"
                              variant={activeNotificationFilter === type ? 'default' : 'outline'}
                              onClick={() => setActiveNotificationFilter(type)}
                              className="rounded-full px-4 py-1 text-xs"
                            >
                              {meta.label}
                            </Button>
                          );
                        })}
                        <Button
                          size="sm"
                          variant={showOnlyUnread ? 'default' : 'outline'}
                          onClick={() => setShowOnlyUnread((prev) => !prev)}
                          className="rounded-full px-3 py-1 text-xs"
                        >
                          {showOnlyUnread ? 'Showing Unread' : 'Unread Only'}
                        </Button>
                      </div>
                    </div>
                    <div className="max-h-[22rem] overflow-y-auto scrollbar-thin scrollbar-thumb-muted/40 scrollbar-track-transparent">
                      {filteredNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
                          <Bell className="h-10 w-10 text-muted-foreground/40 mb-3" />
                          <p className="text-sm font-medium text-foreground">No notifications to show</p>
                          <p className="text-xs text-muted-foreground">
                            Adjust the filters or check back later.
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 px-4 pb-4">
                          {filteredNotifications.map((notification) => {
                            const meta = notificationTypeMeta[notification.type];
                            const Icon = meta.icon;
                            return (
                              <div
                                key={notification.id}
                                className={`group rounded-xl border border-border/70 bg-card/30 p-4 transition hover:border-primary/60 hover:bg-card ${
                                  notification.status === 'unread' ? 'ring-1 ring-primary/30' : ''
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-start gap-3">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                                      <Icon className="h-4 w-4 text-primary" />
                                    </span>
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${meta.accent}`}>
                                          {meta.label}
                                        </span>
                                        <span className="text-[11px] uppercase text-muted-foreground tracking-wide">
                                          {notification.channel === 'both'
                                            ? 'In-app & Email'
                                            : notification.channel === 'in-app'
                                            ? 'In-app'
                                            : 'Email'}
                                        </span>
                                      </div>
                                      <p className="text-sm font-medium text-foreground">{notification.message}</p>
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Clock className="h-3.5 w-3.5" />
                                        <span>{notification.timestamp}</span>
                                        {notification.session && (
                                          <>
                                            <span>•</span>
                                            <span>{notification.session}</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 gap-1 px-2 text-xs"
                                      onClick={() => handleNotificationStatusToggle(notification.id)}
                                    >
                                      <Mail className="h-3.5 w-3.5" />
                                      {notification.status === 'unread' ? 'Mark read' : 'Mark unread'}
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8 text-muted-foreground/70 hover:text-destructive"
                                      onClick={() => handleNotificationDelete(notification.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between border-t border-border/70 px-5 py-3">
                      <div className="text-xs text-muted-foreground">
                        Configure reminder timing and channels from settings.
                      </div>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          setIsNotificationPanelOpen(false);
                          toast({
                            title: 'Coming soon',
                            description: 'Notification preferences will be customizable shortly.'
                          });
                        }}
                      >
                        Manage preferences
                        <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <Button 
                className="btn-hero"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Event
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-4">
                <CalendarIcon className="w-5 h-5 mr-2" />
                Import Calendar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Calendar */}
          <div className="lg:col-span-3">
            <Card className="academic-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigateMonth('prev')}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <h2 className="text-xl font-semibold text-foreground">
                        {monthNames[currentViewDate.getMonth()]} {currentViewDate.getFullYear()}
                      </h2>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigateMonth('next')}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={viewMode === 'month' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('month')}
                      className={viewMode === 'month' ? 'btn-academic' : ''}
                    >
                      Month
                    </Button>
                    <Button
                      variant={viewMode === 'week' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('week')}
                      className={viewMode === 'week' ? 'btn-academic' : ''}
                    >
                      Week
                    </Button>
                    <Button variant="outline" size="sm">
                      Today
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Day Headers */}
                  {dayNames.map((day) => (
                    <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground border-b border-border">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar Days */}
                  {getDaysInMonth(currentViewDate).map((day, index) => {
                    const dayEvents = getEventsForDay(day);
                    const isToday = day && 
                      currentViewDate.getMonth() === currentDate.getMonth() &&
                      currentViewDate.getFullYear() === currentDate.getFullYear() &&
                      day === currentDate.getDate();
                    
                    return (
                      <div
                        key={index}
                        className={`min-h-[100px] p-2 border border-border hover:bg-muted/50 transition-colors ${
                          !day ? 'bg-muted/20' : ''
                        } ${isToday ? 'bg-primary/10 border-primary' : ''}`}
                      >
                        {day && (
                          <>
                            <div className={`text-sm font-medium mb-1 ${
                              isToday ? 'text-primary' : 'text-foreground'
                            }`}>
                              {day}
                            </div>
                            <div className="space-y-1">
                              {dayEvents.slice(0, 2).map((event) => {
                                const eventType = eventTypes[event.type as keyof typeof eventTypes];
                                return (
                                  <div
                                    key={event.id}
                                    className={`text-xs p-1 rounded text-white truncate ${eventType.color}`}
                                    title={event.title}
                                  >
                                    {event.title}
                                  </div>
                                );
                              })}
                              {dayEvents.length > 2 && (
                                <div className="text-xs text-muted-foreground">
                                  +{dayEvents.length - 2} more
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Events */}
            <Card className="academic-card">
              <CardHeader>
                <CardTitle>Today's Events</CardTitle>
              </CardHeader>
              <CardContent>
                {todayEvents.length > 0 ? (
                  <div className="space-y-3">
                    {todayEvents.map((event) => {
                      const eventType = eventTypes[event.type as keyof typeof eventTypes];
                      const Icon = eventType.icon;
                      return (
                        <div key={event.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted transition-colors">
                          <div className={`w-8 h-8 ${eventType.color} rounded-lg flex items-center justify-center`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                            <p className="text-xs text-muted-foreground">{event.time}</p>
                            <p className="text-xs text-muted-foreground">{event.location}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No events scheduled for today</p>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="academic-card">
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingEvents.map((event) => {
                    const eventType = eventTypes[event.type as keyof typeof eventTypes];
                    const Icon = eventType.icon;
                    return (
                      <div key={event.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted transition-colors">
                        <div className={`w-8 h-8 ${eventType.color} rounded-lg flex items-center justify-center`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(event.date)}</p>
                          <p className="text-xs text-muted-foreground">{event.time}</p>
                          {event.participants && (
                            <div className="flex items-center space-x-1 mt-1">
                              <Users className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{event.participants} participants</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Event Legend */}
            <Card className="academic-card">
              <CardHeader>
                <CardTitle>Event Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(eventTypes).map(([key, type]) => {
                    const Icon = type.icon;
                    return (
                      <div key={key} className="flex items-center space-x-3">
                        <div className={`w-4 h-4 ${type.color} rounded`} />
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">{type.label}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="academic-card">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full btn-academic" 
                  size="sm"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Study Session
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <Video className="w-4 h-4 mr-2" />
                  Schedule Virtual Meeting
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Export Calendar
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Create Event Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <EventForm
            onSubmit={handleCreateEvent}
            onCancel={() => setIsCreateDialogOpen(false)}
            isLoading={isLoading}
            submitLabel="Create Session"
            cancelLabel="Cancel"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}