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
import { sessionInvitationAPI, sessionParticipantAPI } from '@/lib/api/sessionInvitationApi';
import { groupAPI } from '@/lib/api/groupApi';
import { sessionAPI } from '@/lib/api/sessionApi';

const currentDate = new Date();
const currentMonth = currentDate.getMonth();
const currentYear = currentDate.getFullYear();

const toLocalDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

// sessions will be loaded from backend for user's groups
const DEFAULT_SESSIONS: any[] = [];

// Helper to generate a color based on session ID for visual variety
const getSessionColor = (sessionId: number) => {
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-green-500',
    'bg-orange-500',
    'bg-teal-500',
    'bg-indigo-500',
    'bg-rose-500'
  ];
  return colors[sessionId % colors.length];
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
  const [stickyNotes, setStickyNotes] = useState<any[]>([]);
  const [noteAssignments, setNoteAssignments] = useState<Record<string, string>>({});
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
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

    const dateKeyToDate = (dateKey: string) => {
      const parts = dateKey.split('-').map((p) => Number(p));
      return new Date(parts[0], parts[1] - 1, parts[2]);
    };

    // Return sessions that occur on the provided local date (dateKey in YYYY-MM-DD)
    const getSessionsForDate = (dateKey: string) => {
      return sessionsState.filter((session) => {
        // If map didn't provide a parsed startDateObj fallback to single-day match
        if (!session.startDateObj) return session.date === dateKey;

        const start = new Date(session.startDateObj);
        start.setHours(0, 0, 0, 0);
        const duration = session.durationDays ?? 1;
        const end = new Date(start);
        // session spans `duration` days including the start day
        end.setDate(end.getDate() + duration - 1);

        const target = dateKeyToDate(dateKey);
        target.setHours(0, 0, 0, 0);

        return target >= start && target <= end;
      });
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
    if (!user) {
      console.log('Calendar: No user, skipping loadSessions');
      return;
    }
    console.log('Calendar: Starting loadSessions for user', user.id);
    setLoadingSessions(true);
    try {
      const token = localStorage.getItem('token');
      
      // Load sessions from groups the user is part of
      const groups = await groupAPI.searchGroups(token, { userId: user.id, size: 100, filterByMembership: true });
      const arr = Array.isArray(groups) ? groups : (groups?.content ?? []);
      console.log('Calendar: Fetched groups', arr.length);
      
      const groupIds = arr.map((g: any) => g.groupId ?? g.id);
      const pagePromises = groupIds.map((gid: number) => sessionAPI.getSessionsByGroup(gid, 0, 100));
      const pages = await Promise.all(pagePromises);
      console.log('Calendar: Fetched session pages', pages);
      
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

      console.log('Calendar: Total unique sessions found', allSessions.length);
      if (allSessions.length > 0) {
        console.log('Calendar: Sample mapped session', allSessions[0]);
      }

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

          const sessionIds = allSessions.map((s) => s.id);
          const rawStatusMap = sessionIds.length
            ? await sessionParticipantAPI.getParticipationStatus(user.id, sessionIds)
            : {};
          const participationStatus: Record<number, boolean> = Object.entries(rawStatusMap).reduce((acc, [key, value]) => {
            acc[Number(key)] = Boolean(value);
            return acc;
          }, {} as Record<number, boolean>);

          const visible = allSessions.map(s => {
            const inv = invMap[s.id] || null;
            return {
              ...s,
              isParticipant: participationStatus[s.id] ?? false,
              invitationStatus: inv ? inv.status : 'NONE',
              invitationId: inv ? inv.id : null,
            };
          });
          
          console.log('Calendar: Setting sessionsState with', visible.length, 'sessions');
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

  // Load sticky notes and assignments from localStorage
  useEffect(() => {
    if (!user) return;
    const savedNotes = localStorage.getItem(`stickyNotes_${user.id}`);
    if (savedNotes) {
      try {
        setStickyNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error('Failed to load sticky notes', e);
      }
    }

    const savedAssign = localStorage.getItem(`stickyNoteAssignments_${user.id}`);
    if (savedAssign) {
      try {
        setNoteAssignments(JSON.parse(savedAssign));
      } catch (e) {
        console.error('Failed to load sticky note assignments', e);
      }
    }
  }, [user]);

  // Persist assignments when changed
  useEffect(() => {
    if (!user) return;
    localStorage.setItem(`stickyNoteAssignments_${user.id}`, JSON.stringify(noteAssignments));
  }, [noteAssignments, user]);

  // Auto-refresh sessions every 30 seconds to show newly created sessions by other users
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      loadSessions();
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [user]);

  const normalizeDateTimeInput = (value: string | null, dateHint?: string | null) => {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (trimmed.includes('T')) return trimmed;
    if (dateHint) return `${dateHint}T${trimmed}`;
    return trimmed;
  };

  const parseServerToLocalDate = (value: string | null, dateHint?: string | null) => {
    const normalized = normalizeDateTimeInput(value, dateHint);
    if (!normalized) return null;
    const hasTZ = /[zZ]$|[+-]\d{2}:?\d{2}$/.test(normalized);
    const candidate = hasTZ ? new Date(normalized) : new Date(normalized);
    return Number.isNaN(candidate.getTime()) ? null : candidate;
  };

  const formatLocalDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const formatSimpleTime = (value?: string | null) => value ? value.split(':').slice(0, 2).join(':') : '';

  const mapDtoToUi = (dto: any) => {
    // dto: SessionResponseDTO (now has startTime and durationDays)
    const start = dto.startTime || dto.start || null;
    const firstDayEnd = dto.endTime || dto.end || null;
    const duration = dto.durationDays == null ? dto.duration || 1 : dto.durationDays;
    const startDate = parseServerToLocalDate(start, dto.date);
    const firstDayEndDate = parseServerToLocalDate(firstDayEnd, dto.date);
    const computedEnd = firstDayEndDate ? new Date(firstDayEndDate.getTime() + (Math.max(duration - 1, 0) * 24 * 60 * 60 * 1000)) : null;
    const endTimeDisplay = firstDayEndDate ? firstDayEndDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : formatSimpleTime(firstDayEnd);
    const date = startDate ? formatLocalDate(startDate) : (dto.date ?? '');
    const startTimeDisplay = startDate ? startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : formatSimpleTime(start);
    const time = startTimeDisplay ? `${startTimeDisplay}${endTimeDisplay ? ' - ' + endTimeDisplay : ''}` : (startTimeDisplay || endTimeDisplay);
    return {
      id: dto.id,
      title: dto.title,
      date,
      // expose parsed start Date object and duration so calendar can render multi-day spans
      startDateObj: startDate,
      durationDays: duration,
      time,
      startTime: startDate ? startDate.toISOString() : null,
      endTime: firstDayEndDate ? firstDayEndDate.toISOString() : null,
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
  const [showMobileCalendar, setShowMobileCalendar] = useState<boolean>(false);
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
          
          {/* Mobile View Toggle */}
          {isMobile && (
            <div className="flex gap-2">
              <Button
                variant={!showMobileCalendar ? "default" : "outline"}
                size="sm"
                onClick={() => setShowMobileCalendar(false)}
                className="text-xs"
              >
                List View
              </Button>
              <Button
                variant={showMobileCalendar ? "default" : "outline"}
                size="sm"
                onClick={() => setShowMobileCalendar(true)}
                className="text-xs"
              >
                Calendar View
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Main Calendar Area */}
          <div className="xl:col-span-9">
            <Card className="border border-border/50 shadow-lg rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                {/* Mobile: List View or Calendar | Desktop: Grid View */}
                {isMobile && !showMobileCalendar ? (
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
                              const sessionColor = getSessionColor(session.id);
                              return (
                                <div
                                  key={session.id}
                                  className="group relative bg-gradient-to-br from-card to-card/50 rounded-xl border border-border/50 p-3 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                                  onClick={() => {
                                    if (session.meetingLink) {
                                      window.open(session.meetingLink, '_blank');
                                    }
                                  }}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className={`${sessionColor} w-12 h-12 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0`}>
                                      {session.meetingLink ? <Video className="w-6 h-6 text-white" /> : <CalendarIcon className="w-6 h-6 text-white" />}
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
                  <div className="p-2 sm:p-6">
                    <div className="grid grid-cols-7 gap-1 sm:gap-3">
                      {/* Day Headers */}
                      {dayNames.map((day) => (
                        <div key={day} className="text-center py-2 sm:py-3 text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {day.substring(0, 3)}
                        </div>
                      ))}
                      
                      {/* Calendar Days */}
                      {getDaysInMonth(currentViewDate).map((day, index) => {
                        const daySessions = getSessionsForDay(day);
                        const hasEvents = daySessions.length > 0;
                        const isToday = day && 
                          currentViewDate.getMonth() === currentDate.getMonth() &&
                          currentViewDate.getFullYear() === currentDate.getFullYear() &&
                          day === currentDate.getDate();

                        const baseClass = !day
                          ? 'bg-transparent'
                          : isToday
                            ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/40 shadow-md ring-2 ring-primary/20'
                            : hasEvents
                              ? 'bg-gradient-to-br from-blue-200 to-blue-100 border border-blue-300 hover:border-blue-400 shadow-md'
                              : 'bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 hover:border-blue-300 shadow-sm';

                        const dayTextClass = isToday ? 'text-primary' : hasEvents ? 'text-blue-800 font-semibold' : 'text-foreground/80';

                        // Compute date key and assigned notes
                        const dateKey = day ? toLocalDateKey(new Date(currentViewDate.getFullYear(), currentViewDate.getMonth(), day)) : null;
                        const assignedNotes = dateKey 
                          ? Object.entries(noteAssignments)
                              .filter(([nid, d]) => d === dateKey)
                              .map(([nid]) => nid)
                          : [];

                        const getNoteColorBg = (color: string) => {
                          switch (color) {
                            case 'yellow': return 'bg-yellow-400';
                            case 'pink': return 'bg-pink-400';
                            case 'blue': return 'bg-blue-400';
                            case 'green': return 'bg-green-400';
                            default: return 'bg-gray-400';
                          }
                        };

                        return (
                          <div 
                            key={index} 
                            className={`relative min-h-[70px] sm:min-h-[110px] p-1.5 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-200 ${baseClass}`}
                            onDragOver={(e) => {
                              if (day) {
                                e.preventDefault();
                                e.currentTarget.classList.add('ring-2', 'ring-primary', 'ring-offset-1');
                              }
                            }}
                            onDragLeave={(e) => {
                              e.currentTarget.classList.remove('ring-2', 'ring-primary', 'ring-offset-1');
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.currentTarget.classList.remove('ring-2', 'ring-primary', 'ring-offset-1');
                              if (!day || !user) return;
                              
                              try {
                                const payload = e.dataTransfer.getData('application/json');
                                if (!payload) return;
                                const note = JSON.parse(payload) as { id: string; content: string; color: string };
                                if (!note?.id) return;
                                
                                const dk = toLocalDateKey(new Date(currentViewDate.getFullYear(), currentViewDate.getMonth(), day));
                                
                                // Check if this note is already on this day
                                if (noteAssignments[note.id] === dk) {
                                  return; // Already assigned to this day
                                }
                                
                                // Check if day already has 4 different notes
                                const notesOnThisDay = Object.entries(noteAssignments)
                                  .filter(([nid, d]) => d === dk && nid !== note.id)
                                  .length;
                                
                                if (notesOnThisDay >= 4) {
                                  alert('Maximum 4 sticky notes per day');
                                  return;
                                }
                                
                                setNoteAssignments(prev => ({ ...prev, [note.id]: dk }));
                                
                                // Refresh sticky notes from storage
                                const saved = localStorage.getItem(`stickyNotes_${user.id}`);
                                if (saved) {
                                  try { setStickyNotes(JSON.parse(saved)); } catch {}
                                }
                              } catch (err) {
                                console.error('Failed to handle drop', err);
                              }
                            }}
                          >
                            {day && (
                              <>
                                <div className={`text-xs sm:text-sm mb-1 sm:mb-2 flex items-center justify-between ${dayTextClass}`}>
                                  <span className="flex items-center gap-1 sm:gap-2">
                                    <span className={`${dayTextClass}`}>{day}</span>
                                    {hasEvents && (
                                      <span className={`${getSessionColor(daySessions[0].id)} w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full inline-block`} />
                                    )}
                                  </span>
                                  {isToday && <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-primary rounded-full animate-pulse" />}
                                </div>
                                <div className="space-y-1 sm:space-y-1.5">
                                  {/* Render assigned sticky notes */}
                                  {assignedNotes.length > 0 && (
                                    <div className="absolute top-0 right-0 hidden sm:flex flex-col gap-0.5 z-10">
                                      {assignedNotes.map((nid, idx) => {
                                        const note = stickyNotes.find(s => s.id === nid);
                                        if (!note) return null;
                                        
                                        const isExpanded = expandedNoteId === nid;
                                        
                                        const getNoteColors = (color: string) => {
                                          switch (color) {
                                            case 'yellow':
                                              return {
                                                bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
                                                border: 'border-yellow-300',
                                                text: 'text-yellow-900',
                                                shadow: 'shadow-yellow-200'
                                              };
                                            case 'pink':
                                              return {
                                                bg: 'bg-gradient-to-br from-pink-50 to-rose-100',
                                                border: 'border-pink-300',
                                                text: 'text-pink-900',
                                                shadow: 'shadow-pink-200'
                                              };
                                            case 'blue':
                                              return {
                                                bg: 'bg-gradient-to-br from-blue-50 to-cyan-100',
                                                border: 'border-blue-300',
                                                text: 'text-blue-900',
                                                shadow: 'shadow-blue-200'
                                              };
                                            case 'green':
                                              return {
                                                bg: 'bg-gradient-to-br from-green-50 to-emerald-100',
                                                border: 'border-green-300',
                                                text: 'text-green-900',
                                                shadow: 'shadow-green-200'
                                              };
                                            default:
                                              return {
                                                bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
                                                border: 'border-gray-300',
                                                text: 'text-gray-900',
                                                shadow: 'shadow-gray-200'
                                              };
                                          }
                                        };
                                        
                                        const colors = getNoteColors(note.color);
                                        
                                        return (
                                          <div key={nid} className="relative">
                                            {/* Collapsed: Simple colored strip in corner - always visible */}
                                            {!isExpanded && (
                                              <div 
                                                className={`
                                                  w-6 h-6 ${colors.bg} ${colors.border}
                                                  border-2 rounded-bl-lg cursor-pointer
                                                  transition-all duration-200 hover:w-8 hover:h-8 hover:shadow-lg
                                                `}
                                                style={{
                                                  transform: `rotate(${(note.rotation || 0) + (idx * 2)}deg)`,
                                                }}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setExpandedNoteId(nid);
                                                }}
                                              >
                                                {/* Corner fold effect */}
                                                <div className={`absolute bottom-0 left-0 w-2 h-2 ${colors.bg} border-r-2 border-t-2 ${colors.border}`}
                                                     style={{
                                                       clipPath: 'polygon(0 0, 0 100%, 100% 100%)',
                                                       filter: 'brightness(0.85)'
                                                     }}></div>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}

                                  {/* Render sessions */}
                                  {daySessions.slice(0, isMobile ? 1 : 3).map((session) => {
                                    const sessionColor = getSessionColor(session.id);
                                    return (
                                      <div
                                        key={session.id}
                                        className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-white truncate cursor-pointer transition-all hover:scale-105 hover:shadow-md ${sessionColor}`}
                                        title={`${session.title} - ${session.time}${session.meetingLink ? ' (Click to join)' : ''}`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (session.meetingLink) {
                                            window.open(session.meetingLink, '_blank');
                                          }
                                        }}
                                      >
                                        {session.title}
                                      </div>
                                    );
                                  })}
                                  {daySessions.length > (isMobile ? 1 : 3) && (
                                    <div className="text-[10px] sm:text-xs text-muted-foreground font-medium text-center pt-0.5 sm:pt-1">
                                      +{daySessions.length - (isMobile ? 1 : 3)}
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
                        const sessionColor = getSessionColor(session.id);
                        return (
                          <div key={session.id} className="group p-3 rounded-xl bg-gradient-to-br from-card to-muted/10 border border-border/40 hover:border-border hover:shadow-md transition-all cursor-pointer"
                            onClick={() => {
                              if (session.meetingLink) {
                                window.open(session.meetingLink, '_blank');
                              }
                            }}>
                            <div className="flex items-center gap-3">
                              <div className={`${sessionColor} w-10 h-10 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0`}>
                                {session.meetingLink ? <Video className="w-5 h-5 text-white" /> : <CalendarIcon className="w-5 h-5 text-white" />}
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
                      const sessionColor = getSessionColor(session.id);
                      return (
                        <div key={session.id} className="group p-3 rounded-xl bg-gradient-to-br from-card to-muted/10 border border-border/40 hover:border-border hover:shadow-md transition-all cursor-pointer"
                          onClick={() => {
                            if (session.meetingLink) {
                              window.open(session.meetingLink, '_blank');
                            }
                          }}>
                          <div className="flex items-center gap-3">
                            <div className={`${sessionColor} w-10 h-10 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0`}>
                              {session.meetingLink ? <Video className="w-5 h-5 text-white" /> : <CalendarIcon className="w-5 h-5 text-white" />}
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
            </div>
          )}
        </div>
      </div>
      
      {/* Expanded Sticky Note - Rendered outside calendar grid */}
      {expandedNoteId && (() => {
        const note = stickyNotes.find(s => s.id === expandedNoteId);
        if (!note) return null;
        
        const getNoteColors = (color: string) => {
          switch (color) {
            case 'yellow':
              return {
                bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
                border: 'border-yellow-300',
                text: 'text-yellow-900',
                shadow: 'shadow-yellow-200'
              };
            case 'pink':
              return {
                bg: 'bg-gradient-to-br from-pink-50 to-rose-100',
                border: 'border-pink-300',
                text: 'text-pink-900',
                shadow: 'shadow-pink-200'
              };
            case 'blue':
              return {
                bg: 'bg-gradient-to-br from-blue-50 to-cyan-100',
                border: 'border-blue-300',
                text: 'text-blue-900',
                shadow: 'shadow-blue-200'
              };
            case 'green':
              return {
                bg: 'bg-gradient-to-br from-green-50 to-emerald-100',
                border: 'border-green-300',
                text: 'text-green-900',
                shadow: 'shadow-green-200'
              };
            default:
              return {
                bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
                border: 'border-gray-300',
                text: 'text-gray-900',
                shadow: 'shadow-gray-200'
              };
          }
        };
        
        const colors = getNoteColors(note.color);
        
        return (
          <>
            {/* Backdrop overlay */}
            <div 
              className="fixed inset-0 bg-black/50 z-[999] backdrop-blur-sm"
              onClick={() => setExpandedNoteId(null)}
            />
            
            {/* Expanded sticky note */}
            <div 
              className={`
                fixed inset-0 m-auto w-[280px] h-[280px]
                ${colors.bg} ${colors.border} ${colors.text}
                border-2 rounded-sm cursor-pointer z-[1000]
                ${colors.shadow} shadow-2xl
                transition-all duration-300 ease-in-out
              `}
              style={{
                transform: `rotate(${note.rotation || 0}deg)`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                setExpandedNoteId(null);
              }}
            >
              <div className="p-4 h-full flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 overflow-y-auto max-h-[220px]">
                    {note.content ? (
                      <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                        {note.content}
                      </p>
                    ) : (
                      <p className="text-xs opacity-50 italic">Empty note</p>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Remove this sticky note from the calendar?')) {
                        setNoteAssignments(prev => {
                          const newAssignments = { ...prev };
                          delete newAssignments[expandedNoteId];
                          return newAssignments;
                        });
                        setExpandedNoteId(null);
                      }
                    }}
                    className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex-shrink-0"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              {/* Corner fold effect */}
              <div className={`absolute bottom-0 right-0 w-12 h-12 ${colors.bg} border-l-2 border-t-2 ${colors.border}`}
                   style={{
                     clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
                     filter: 'brightness(0.85)'
                   }}></div>
            </div>
          </>
        );
      })()}
    </div>
  );
}