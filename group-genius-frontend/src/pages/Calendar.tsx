import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  RefreshCw
} from 'lucide-react';
import SessionCreateDialog from '@/components/session/SessionCreateDialog';
import SessionEditDialog from '@/components/session/SessionEditDialog';
import { useAuth } from '@/contexts/AuthContext';
import { sessionInvitationAPI } from '@/lib/api/sessionInvitationApi';
import { groupAPI } from '@/lib/api/groupApi';
import { sessionAPI } from '@/lib/api/sessionApi';

const currentDate = new Date();
const currentMonth = currentDate.getMonth();
const currentYear = currentDate.getFullYear();

const toLocalDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

// sessions will be loaded from backend for user's groups
const DEFAULT_SESSIONS: any[] = [];

const sessionTypes = {
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

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [currentViewDate, setCurrentViewDate] = useState(new Date(currentYear, currentMonth, 1));
  const { user } = useAuth();
  const [sessionsState, setSessionsState] = useState<any[]>(DEFAULT_SESSIONS);
  const [invitationMap, setInvitationMap] = useState<Record<number, { id: number; status: string }>>({});
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

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

  const getSessionsForDate = (date: string) => {
    return sessionsState.filter(session => session.date === date);
  };

  const getSessionsForDay = (day: number | null) => {
    if (!day) return [];
    const dateString = `${currentViewDate.getFullYear()}-${String(currentViewDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return getSessionsForDate(dateString);
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

  // Use local calendar date for "today" to avoid timezone shifts
  const today = toLocalDateKey(currentDate);
  const todaySessions = getSessionsForDate(today);
  const upcomingSessions = sessionsState
    .filter(session => new Date(session.date) >= currentDate)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  // Load sessions for groups the user belongs to
  const loadSessions = async () => {
    if (!user) return;
    setLoadingSessions(true);
    try {
      const token = localStorage.getItem('token');
      
      // Load sessions from groups the user is part of
      const groups = await groupAPI.searchGroups(token, { userId: user.id, size: 100, filterByMembership: true });
      const arr = Array.isArray(groups) ? groups : (groups?.content ?? []);
      const groupIds = arr.map((g: any) => g.groupId ?? g.id);
      const pagePromises = groupIds.map((gid: number) => sessionAPI.getSessionsByGroup(gid, 0, 100));
      const pages = await Promise.all(pagePromises);
      
      // Also load all sessions created by the user (including ended ones)
      const createdSessions = await sessionAPI.getSessionsByCreator(user.id);
      
  // Combine and deduplicate sessions
      const allSessions: any[] = [];
      const seenIds = new Set<number>();
      
      // Add sessions from groups
      pages.forEach((p: any) => {
        const items = Array.isArray(p) ? p : (Array.isArray(p.content) ? p.content : (p.items ?? []));
        items.forEach((it: any) => {
          if (!seenIds.has(it.id)) {
            seenIds.add(it.id);
            const mapped = mapDtoToUi(it);
            allSessions.push(mapped);
          }
        });
      });
      
      // Add sessions created by the user (may include ended sessions not in participant list)
      const createdItems = Array.isArray(createdSessions) ? createdSessions : [];
      createdItems.forEach((it: any) => {
        if (!seenIds.has(it.id)) {
          seenIds.add(it.id);
          const mapped = mapDtoToUi(it);
          allSessions.push(mapped);
        }
      });

      // Resolve participation state for current user and only show sessions where
      // the current user is a participant. Also load user's pending/declined invitations
      // so we can show 'Invited' or 'Rejoin' states in the UI for non-creators.
      setLastRefresh(new Date());
      if (user) {
        try {
          // Fetch user's pending and declined invitations once
          const [pending, declined] = await Promise.all([
            sessionInvitationAPI.getPendingInvitations(user.id),
            sessionInvitationAPI.getDeclinedInvitations(user.id),
          ]);

          const invMap: Record<number, { id: number; status: string }> = {};
          pending.forEach((inv: any) => { invMap[inv.sessionId] = { id: inv.id, status: inv.status }; });
          declined.forEach((inv: any) => { invMap[inv.sessionId] = { id: inv.id, status: inv.status }; });
          setInvitationMap(invMap);

          const checks = await Promise.all(allSessions.map(async (s) => {
            try {
              const isPart = await sessionAPI.isParticipant(s.id, user.id);
              return { id: s.id, isPart };
            } catch (err) {
              return { id: s.id, isPart: false };
            }
          }));

          const visible = allSessions
            .map(s => {
              const inv = invMap[s.id] || null;
              return {
                ...s,
                isParticipant: !!(checks.find(c => c.id === s.id)?.isPart),
                invitationStatus: inv ? inv.status : 'NONE',
                invitationId: inv ? inv.id : null,
              };
            })
            // show only sessions where current user is a participant OR where they created the session OR where they have an invitation
            .filter(s => s.isParticipant || s.createdById === user.id || s.invitationStatus !== 'NONE');

          setSessionsState(visible);
        } catch (err) {
          console.warn('Error checking participant status or loading invitations', err);
          // Fallback: show none if we couldn't verify participation
          setSessionsState([]);
        }
      } else {
        // No user -> no sessions
        setSessionsState([]);
      }
    } catch (e) {
      console.error('Failed to load sessions', e);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [user]);

  // Auto-refresh sessions every 30 seconds to show newly created sessions by other users
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      loadSessions();
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [user]);

  const mapDtoToUi = (dto: any) => {
    // dto: SessionResponseDTO (now has startTime and durationDays)
    const start = dto.startTime || dto.start || null;
    // compute endTime from durationDays (durationDays is integer number of days)
    const duration = dto.durationDays == null ? dto.duration || 1 : dto.durationDays;
    // Parse server start into a local Date reliably: if the server string includes a timezone (Z or +/-offset)
    // use Date parsing; otherwise treat the string as local and build a Date from components to avoid implicit UTC conversions.
    const parseServerToLocalDate = (s: string | null) => {
      if (!s) return null;
      const hasTZ = /[zZ]$|[+-]\d{2}:?\d{2}$/.test(s);
      if (hasTZ) return new Date(s);
      // expected format YYYY-MM-DDTHH:mm[:ss]
      const parts = s.split('T');
      if (parts.length < 2) return new Date(s);
      const [y, m, d] = parts[0].split('-').map(Number);
      const [hh, mm] = parts[1].split(':').map(Number);
      return new Date(y, m - 1, d, hh || 0, mm || 0, 0);
    };

  const startDate = parseServerToLocalDate(start);
  const computedEnd = startDate ? new Date(startDate.getTime() + (duration * 24 * 60 * 60 * 1000)) : null;
  const formatLocalDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const date = startDate ? formatLocalDate(startDate) : (dto.date ?? '');
  const startTimeDisplay = startDate ? startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  const time = startDate ? `${startTimeDisplay}${computedEnd ? ' - ' + computedEnd.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}` : '';
    return {
      id: dto.id,
      title: dto.title,
      date,
      time,
      startTime: start,
      endTime: computedEnd ? computedEnd.toISOString() : null,
      description: dto.description,
      meetingLink: dto.meetingLink,
      groupId: dto.groupId,
      createdById: dto.createdById,
      createdByName: dto.createdByName,
      raw: dto,
      startTimeDisplay,
      isParticipant: false,
      type: 'study'
    };
  };

  const handleSessionCreated = (created: any) => {
    (async () => {
      try {
        const mapped = mapDtoToUi(created);
        // Only add if current user is a participant (creator is auto-participant)
        if (user) {
          const isPart = await sessionAPI.isParticipant(mapped.id, user.id).catch(() => false);
          if (isPart) {
            setSessionsState((s) => [mapped, ...s]);
            setLastRefresh(new Date());
          }
        }
        // Also attempt a lightweight reload to keep things consistent
        setTimeout(() => loadSessions(), 1000);
      } catch (e) { console.error(e); }
    })();
  };

  const handleSessionUpdated = (updated: any) => {
    (async () => {
      try {
        const mapped = mapDtoToUi(updated);
        if (user) {
          const isPart = await sessionAPI.isParticipant(mapped.id, user.id).catch(() => false);
          setSessionsState((s) => {
            // If user is participant, upsert; otherwise remove from view
            if (isPart) return s.map((x) => (x.id === mapped.id ? mapped : x));
            return s.filter(x => x.id !== mapped.id);
          });
          setLastRefresh(new Date());
        }
      } catch (e) { console.error(e); }
    })();
  };

  const handleSessionDeleted = (id: number) => {
    setSessionsState((s) => s.filter((x) => x.id !== id));
    setLastRefresh(new Date());
  };

  // Responsive breakpoint detection for mobile view
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [timeAgo, setTimeAgo] = useState<string>('just now');

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Update time ago display
  useEffect(() => {
    const updateTimeAgo = () => {
      const seconds = Math.floor((new Date().getTime() - lastRefresh.getTime()) / 1000);
      if (seconds < 10) setTimeAgo('just now');
      else if (seconds < 60) setTimeAgo(`${seconds}s ago`);
      else if (seconds < 3600) setTimeAgo(`${Math.floor(seconds / 60)}m ago`);
      else setTimeAgo(`${Math.floor(seconds / 3600)}h ago`);
    };
    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [lastRefresh]);

  // Helper: sessions grouped by date for mobile list
  const sessionsByDate = sessionsState.reduce((acc: Record<string, any[]>, s) => {
    if (!s.date) return acc;
    acc[s.date] = acc[s.date] || [];
    acc[s.date].push(s);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      {/* Compact Modern Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg">
                <CalendarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {loadingSessions ? 'Syncing...' : `Updated ${timeAgo}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => loadSessions()}
                disabled={loadingSessions}
                className="h-9 w-9"
                title="Refresh sessions"
              >
                <RefreshCw className={`w-4 h-4 ${loadingSessions ? 'animate-spin' : ''}`} />
              </Button>
              <React.Suspense fallback={<Button size="sm"><Plus className="w-4 h-4 sm:mr-2"/><span className="hidden sm:inline">New</span></Button>}>
                <SessionCreateDialog onCreated={(created) => { handleSessionCreated(created); }} />
              </React.Suspense>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Month Navigation & View Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateMonth('prev')}
              className="h-10 w-10 rounded-xl hover:bg-primary hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="px-4 py-2 bg-card rounded-xl border border-border shadow-sm">
              <h2 className="text-lg font-semibold text-foreground whitespace-nowrap">
                {monthNames[currentViewDate.getMonth()]} {currentViewDate.getFullYear()}
              </h2>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateMonth('next')}
              className="h-10 w-10 rounded-xl hover:bg-primary hover:text-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Main Calendar Area */}
          <div className="xl:col-span-9">
            <Card className="border border-border/50 shadow-lg rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                {/* Mobile: List View | Desktop: Grid View */}
                {isMobile ? (
                  <div className="p-4 space-y-3">
                    {Object.keys(sessionsByDate).length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <CalendarIcon className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">No sessions scheduled</p>
                      </div>
                    ) : (
                      Object.entries(sessionsByDate)
                        .sort((a,b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
                        .map(([date, items]: [string, any[]]) => (
                          <div key={date} className="space-y-2">
                            <div className="flex items-center gap-2 px-2">
                              <div className="h-px flex-1 bg-border" />
                              <p className="text-xs font-medium text-muted-foreground">
                                {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                              </p>
                              <div className="h-px flex-1 bg-border" />
                            </div>
                            {items.map((session) => {
                              const sessionType = sessionTypes[session.type as keyof typeof sessionTypes];
                              const Icon = sessionType.icon;
                              return (
                                <div
                                  key={session.id}
                                  className="group relative bg-gradient-to-br from-card to-card/50 rounded-xl border border-border/50 p-3 shadow-sm hover:shadow-md transition-all duration-200"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className={`${sessionType.color} w-12 h-12 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0`}>
                                      <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h3 className="font-semibold text-sm text-foreground mb-1 truncate">{session.title}</h3>
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Clock className="w-3 h-3" />
                                        <span>{session.time}</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {user?.id === session.createdById && (
                                        <SessionEditDialog session={session} onSaved={(u) => { handleSessionUpdated(u); }} onDeleted={() => { handleSessionDeleted(session.id); }} />
                                      )}
                                      {user && user.id !== session.createdById && (
                                        // For non-creators show participant/invitation state
                                        session.isParticipant ? (
                                          <Badge variant="outline" className="px-3">Joined</Badge>
                                        ) : (
                                          session.invitationStatus === 'PENDING' ? (
                                            <Badge variant="outline" className="px-3">Invited</Badge>
                                          ) : session.invitationStatus === 'DECLINED' ? (
                                            <Button size="sm" onClick={async () => {
                                              try {
                                                if (session.invitationId) {
                                                  await sessionInvitationAPI.rejoinInvitation(session.invitationId, user.id);
                                                } else {
                                                  // Fallback: try to add participant directly
                                                  await sessionAPI.addParticipant(session.id, user.id);
                                                }
                                                // Optimistically mark participant and refresh
                                                setSessionsState(s => s.map(x => x.id === session.id ? { ...x, isParticipant: true, invitationStatus: 'NONE' } : x));
                                                setTimeout(() => loadSessions(), 800);
                                              } catch (err) { console.error(err); }
                                            }}>Rejoin</Button>
                                          ) : (
                                            <Button size="sm" onClick={async () => {
                                              try {
                                                await sessionAPI.addParticipant(session.id, user.id);
                                                setSessionsState(s => s.map(x => x.id === session.id ? { ...x, isParticipant: true } : x));
                                              } catch (err) { console.error(err); }
                                            }}>Join</Button>
                                          )
                                        )
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ))
                    )}
                  </div>
                ) : (
                  <div className="p-6">
                    <div className="grid grid-cols-7 gap-3">
                      {/* Day Headers */}
                      {dayNames.map((day) => (
                        <div key={day} className="text-center py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {day.substring(0, 3)}
                        </div>
                      ))}
                      
                      {/* Calendar Days */}
                      {getDaysInMonth(currentViewDate).map((day, index) => {
                        const daySessions = getSessionsForDay(day);
                        const isToday = day && 
                          currentViewDate.getMonth() === currentDate.getMonth() &&
                          currentViewDate.getFullYear() === currentDate.getFullYear() &&
                          day === currentDate.getDate();
                        
                        return (
                          <div
                            key={index}
                            className={`min-h-[110px] p-3 rounded-xl transition-all duration-200 ${
                              !day 
                                ? 'bg-transparent' 
                                : isToday 
                                ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/40 shadow-md ring-2 ring-primary/20' 
                                : 'bg-card/50 border border-border/40 hover:border-border hover:shadow-md hover:bg-card'
                            }`}
                          >
                            {day && (
                              <>
                                <div className={`text-sm font-semibold mb-2 flex items-center justify-between ${
                                  isToday ? 'text-primary' : 'text-foreground/80'
                                }`}>
                                  <span>{day}</span>
                                  {isToday && (
                                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                  )}
                                </div>
                                <div className="space-y-1.5">
                                  {daySessions.slice(0, 3).map((session) => {
                                    const sessionType = sessionTypes[session.type as keyof typeof sessionTypes];
                                    return (
                                      <div
                                        key={session.id}
                                        className={`text-xs px-2 py-1.5 rounded-lg text-white truncate cursor-pointer transition-all hover:scale-105 hover:shadow-md ${sessionType.color}`}
                                        title={`${session.title} - ${session.time}`}
                                      >
                                        {session.title}
                                      </div>
                                    );
                                  })}
                                  {daySessions.length > 3 && (
                                    <div className="text-xs text-muted-foreground font-medium text-center pt-1">
                                      +{daySessions.length - 3}
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Hidden on mobile */}
          {!isMobile && (
            <div className="xl:col-span-3 space-y-4">
              {/* Today's Sessions */}
              <Card className="border border-border/50 shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-card to-muted/20 border-b border-border/50 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <CardTitle className="text-base">Today's Sessions</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  {todaySessions.length > 0 ? (
                    <div className="space-y-2">
                      {todaySessions.slice(0, 4).map((session) => {
                        const sessionType = sessionTypes[session.type as keyof typeof sessionTypes];
                        const Icon = sessionType.icon;
                        return (
                          <div key={session.id} className="group p-3 rounded-xl bg-gradient-to-br from-card to-muted/10 border border-border/40 hover:border-border hover:shadow-md transition-all">
                            <div className="flex items-center gap-3">
                              <div className={`${sessionType.color} w-10 h-10 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0`}>
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{session.title}</p>
                                <p className="text-xs text-muted-foreground">{session.startTimeDisplay || session.time}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {user?.id === session.createdById && (
                                  <SessionEditDialog session={session} onSaved={(u) => { handleSessionUpdated(u); }} onDeleted={() => { handleSessionDeleted(session.id); }} />
                                )}
                                {user && user.id !== session.createdById && (
                                  session.isParticipant ? (
                                    <Badge variant="outline" className="px-3">Joined</Badge>
                                  ) : (
                                    session.invitationStatus === 'PENDING' ? (
                                      <Badge variant="outline" className="px-3">Invited</Badge>
                                    ) : session.invitationStatus === 'DECLINED' ? (
                                      <Button size="sm" onClick={async () => {
                                        try {
                                          if (session.invitationId) {
                                            await sessionInvitationAPI.rejoinInvitation(session.invitationId, user.id);
                                          } else {
                                            await sessionAPI.addParticipant(session.id, user.id);
                                          }
                                          setSessionsState(s => s.map(x => x.id === session.id ? { ...x, isParticipant: true, invitationStatus: 'NONE' } : x));
                                          setTimeout(() => loadSessions(), 800);
                                        } catch (err) { console.error(err); }
                                      }}>Rejoin</Button>
                                    ) : (
                                      <Button size="sm" onClick={async () => {
                                        try {
                                          await sessionAPI.addParticipant(session.id, user.id);
                                          setSessionsState(s => s.map(x => x.id === session.id ? { ...x, isParticipant: true } : x));
                                        } catch (err) { console.error(err); }
                                      }}>Join</Button>
                                    )
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Clock className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground">No sessions today</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Upcoming Sessions */}
              <Card className="border border-border/50 shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-card to-muted/20 border-b border-border/50 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                      <CalendarIcon className="w-4 h-4 text-secondary-foreground" />
                    </div>
                    <CardTitle className="text-base">Upcoming</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    {upcomingSessions.slice(0, 5).map((session) => {
                      const sessionType = sessionTypes[session.type as keyof typeof sessionTypes];
                      const Icon = sessionType.icon;
                      return (
                        <div key={session.id} className="group p-3 rounded-xl bg-gradient-to-br from-card to-muted/10 border border-border/40 hover:border-border hover:shadow-md transition-all">
                          <div className="flex items-center gap-3">
                            <div className={`${sessionType.color} w-10 h-10 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{session.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {user?.id === session.createdById && (
                                <SessionEditDialog session={session} onSaved={(u) => { handleSessionUpdated(u); }} onDeleted={() => { handleSessionDeleted(session.id); }} />
                              )}
                              {user && user.id !== session.createdById && (
                                session.isParticipant ? (
                                  <Badge variant="outline" className="px-3">Joined</Badge>
                                ) : (
                                  session.invitationStatus === 'PENDING' ? (
                                    <Badge variant="outline" className="px-3">Invited</Badge>
                                  ) : session.invitationStatus === 'DECLINED' ? (
                                    <Button size="sm" onClick={async () => {
                                      try {
                                        if (session.invitationId) {
                                          await sessionInvitationAPI.rejoinInvitation(session.invitationId, user.id);
                                        } else {
                                          await sessionAPI.addParticipant(session.id, user.id);
                                        }
                                        setSessionsState(s => s.map(x => x.id === session.id ? { ...x, isParticipant: true, invitationStatus: 'NONE' } : x));
                                        setTimeout(() => loadSessions(), 800);
                                      } catch (err) { console.error(err); }
                                    }}>Rejoin</Button>
                                  ) : (
                                    <Button size="sm" onClick={async () => {
                                      try {
                                        await sessionAPI.addParticipant(session.id, user.id);
                                        setSessionsState(s => s.map(x => x.id === session.id ? { ...x, isParticipant: true } : x));
                                      } catch (err) { console.error(err); }
                                    }}>Join</Button>
                                  )
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Session Types Legend */}
              <Card className="border border-border/50 shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-card to-muted/20 border-b border-border/50 pb-4">
                  <CardTitle className="text-sm">Session Types</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid gap-2">
                    {Object.entries(sessionTypes).map(([key, type]) => {
                      const Icon = type.icon;
                      return (
                        <div key={key} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className={`w-8 h-8 ${type.color} rounded-lg flex items-center justify-center shadow-sm`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm text-foreground">{type.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}