import { useState, useEffect, useCallback, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Calendar, Users, Sparkles,StickyNote, AlertCircle, CheckCircle2, Info, Plus, X, Save, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { groupAPI } from '@/lib/api/groupApi';
import { sessionAPI } from '@/lib/api/sessionApi';
import { Group } from '@/types/group';

interface SessionResponseDTO {
  id: number;
  groupId: number;
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  start?: string;
  end?: string;
  date?: string;
  createdById: number;
  createdByName?: string;
  meetingLink?: string;
}

interface Session {
  id: number;
  title: string;
  date: string;
  time: string;
  startTime: string | null;
  endTime: string | null;
  groupId: number;
  groupName?: string;
}

interface PageResponse<T> {
  content?: T[];
  items?: T[];
}


interface StickyNote {
  id: string;
  content: string;
  color: 'yellow' | 'pink' | 'blue' | 'green';
  rotation: number;
}

const parseSessionDate = (value?: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export function Sidebar() {
  const { user } = useAuth();
  const [nextSession, setNextSession] = useState<Session | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  
  const [groups, setGroups] = useState<Group[]>([]);
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([]);
  const [noteAssignments, setNoteAssignments] = useState<Record<string, string>>({});
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const mapDtoToUi = useCallback((dto: SessionResponseDTO, groupName?: string): Session => {
    const start = dto.startTime || dto.start || null;
    const end = dto.endTime || dto.end || null;
    const startDate = parseSessionDate(start);
    const endDate = parseSessionDate(end);
    const date = startDate ? startDate.toISOString().split('T')[0] : (dto.date ?? '');
    const time = startDate
      ? `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${endDate ? ' - ' + endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}`
      : '';
    return {
      id: dto.id,
      title: dto.title,
      date,
      time,
      startTime: startDate ? startDate.toISOString() : null,
      endTime: endDate ? end : null,
      groupId: dto.groupId,
      groupName: groupName || 'Study Group'
    };
  }, []);

  const loadSessionsAndGroups = useCallback(async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('token');
      const groupsData = await groupAPI.searchGroups(token, { userId: user.id, size: 100, filterByMembership: true });
      const groupsArr = Array.isArray(groupsData) ? groupsData : (groupsData?.content ?? []);
      setGroups(groupsArr);
      
      const groupIds = groupsArr.map((g: Group) => g.groupId ?? (g as unknown as { id: number }).id);
      const pagePromises = groupIds.map((gid: number) => sessionAPI.getSessionsByGroup(gid, 0, 100));
      const pages = await Promise.all(pagePromises);
      
      const allSessions: Session[] = [];
      pages.forEach((p: PageResponse<SessionResponseDTO> | SessionResponseDTO[], idx: number) => {
        const items = Array.isArray(p) ? p : (Array.isArray(p.content) ? p.content : (p.items ?? []));
        items.forEach((it: SessionResponseDTO) => {
          const group = groupsArr.find(g => (g.groupId ?? (g as unknown as { id: number }).id) === it.groupId);
          const mapped = mapDtoToUi(it, group?.groupName);
          allSessions.push(mapped);
        });
      });

      // Find next upcoming session
      const now = new Date();
      const upcoming = allSessions
        .filter(s => s.startTime && new Date(s.startTime) > now)
        .sort((a, b) => {
          const timeA = a.startTime ? new Date(a.startTime).getTime() : Infinity;
          const timeB = b.startTime ? new Date(b.startTime).getTime() : Infinity;
          return timeA - timeB;
        })[0] || null;

      setNextSession(upcoming);

      // no-op: notifications removed from sidebar
    } catch (e) {
      console.error('Failed to load sessions', e);
    }
  }, [user, mapDtoToUi]);

  useEffect(() => {
    loadSessionsAndGroups();
    const interval = setInterval(loadSessionsAndGroups, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [loadSessionsAndGroups]);

  // Load sticky notes from localStorage
  useEffect(() => {
    if (!user) return;
    const savedNotes = localStorage.getItem(`stickyNotes_${user.id}`);
    if (savedNotes) {
      try {
        setStickyNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error('Failed to load sticky notes', e);
      }
    } else {
      // Initialize with one empty note
      const initialNote: StickyNote = {
        id: Date.now().toString(),
        content: '',
        color: 'yellow',
        rotation: -1
      };
      setStickyNotes([initialNote]);
    }
    
    // Load note assignments
    const savedAssignments = localStorage.getItem(`stickyNoteAssignments_${user.id}`);
    if (savedAssignments) {
      try {
        setNoteAssignments(JSON.parse(savedAssignments));
      } catch (e) {
        console.error('Failed to load note assignments', e);
      }
    }
  }, [user]);

  // Reload assignments periodically to sync with calendar
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      const savedAssignments = localStorage.getItem(`stickyNoteAssignments_${user.id}`);
      if (savedAssignments) {
        try {
          setNoteAssignments(JSON.parse(savedAssignments));
        } catch (e) {
          console.error('Failed to reload note assignments', e);
        }
      }
    }, 1000); // Check every second for assignment changes
    return () => clearInterval(interval);
  }, [user]);

  // Save sticky notes to localStorage
  useEffect(() => {
    if (!user || stickyNotes.length === 0) return;
    localStorage.setItem(`stickyNotes_${user.id}`, JSON.stringify(stickyNotes));
  }, [stickyNotes, user]);

  const addStickyNote = () => {
    if (stickyNotes.length >= 6) {
      alert('Maximum 6 sticky notes allowed');
      return;
    }
    const colors: StickyNote['color'][] = ['yellow', 'pink', 'blue', 'green'];
    const rotations = [-1, 0.5, -0.5, 1];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomRotation = rotations[Math.floor(Math.random() * rotations.length)];
    
    const newNote: StickyNote = {
      id: Date.now().toString(),
      content: '',
      color: randomColor,
      rotation: randomRotation
    };
    setStickyNotes([...stickyNotes, newNote]);
    setEditingNoteId(newNote.id);
    setEditingContent('');
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const startEditing = (note: StickyNote) => {
    setEditingNoteId(note.id);
    setEditingContent(note.content);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const saveNote = (id: string) => {
    setStickyNotes(notes =>
      notes.map(note =>
        note.id === id ? { ...note, content: editingContent } : note
      )
    );
    setEditingNoteId(null);
    setEditingContent('');
  };

  const deleteNote = (id: string) => {
    setStickyNotes(notes => notes.filter(note => note.id !== id));
    if (editingNoteId === id) {
      setEditingNoteId(null);
      setEditingContent('');
    }
  };

  const getNoteColors = (color: StickyNote['color']) => {
    switch (color) {
      case 'yellow':
        return {
          bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20',
          border: 'border-yellow-300 dark:border-yellow-700',
          text: 'text-yellow-900 dark:text-yellow-200',
          textMuted: 'text-yellow-800 dark:text-yellow-300',
          circle: 'bg-yellow-200 dark:bg-yellow-700'
        };
      case 'pink':
        return {
          bg: 'bg-gradient-to-br from-pink-50 to-rose-100 dark:from-pink-900/20 dark:to-rose-800/20',
          border: 'border-pink-300 dark:border-pink-700',
          text: 'text-pink-900 dark:text-pink-200',
          textMuted: 'text-pink-800 dark:text-pink-300',
          circle: 'bg-pink-200 dark:bg-pink-700'
        };
      case 'blue':
        return {
          bg: 'bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-800/20',
          border: 'border-blue-300 dark:border-blue-700',
          text: 'text-blue-900 dark:text-blue-200',
          textMuted: 'text-blue-800 dark:text-blue-300',
          circle: 'bg-blue-200 dark:bg-blue-700'
        };
      case 'green':
        return {
          bg: 'bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20',
          border: 'border-green-300 dark:border-green-700',
          text: 'text-green-900 dark:text-green-200',
          textMuted: 'text-green-800 dark:text-green-300',
          circle: 'bg-green-200 dark:bg-green-700'
        };
    }
  };

  // Update countdown timer
  useEffect(() => {
    if (!nextSession || !nextSession.startTime) {
      setTimeRemaining('');
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const sessionTime = new Date(nextSession.startTime!);
      const diff = sessionTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Started');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [nextSession]);

  type NotificationType = 'success' | 'warning' | 'reminder' | 'info';

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'reminder':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  // Notifications feature removed from sidebar

  if (!user) {
    return null;
  }

  return (
    <div className="hidden lg:flex w-64 bg-card border-r border-border h-screen fixed left-0 top-16 z-30">
      <ScrollArea className="h-full w-full">
        <div className="p-4 pb-40 space-y-4">
          {/* Next Session Card with Violet Gradient */}
          <Card className="border-0 shadow-lg overflow-hidden bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-lg">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold">Next Session</h3>
              </div>
              
              {nextSession ? (
                <>
                  <div className="mb-3 p-2.5 bg-white/10 rounded-lg backdrop-blur-sm">
                    <p className="text-xs opacity-80 mb-1.5 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      Group
                    </p>
                    <p className="text-sm font-bold truncate">{nextSession.groupName}</p>
                  </div>
                  
                  <div className="mb-3 p-2.5 bg-white/10 rounded-lg backdrop-blur-sm">
                    <p className="text-xs opacity-80 mb-1.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Session
                    </p>
                    <p className="text-sm font-bold truncate">{nextSession.title}</p>
                  </div>
                  
                  <div className="mt-4 p-3 bg-white/15 rounded-xl backdrop-blur-sm border border-white/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs opacity-80 mb-1">Time Remaining</p>
                        <p className="text-lg font-bold tracking-wide">{timeRemaining || nextSession.time}</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-60" />
                  <p className="text-sm opacity-90">No upcoming sessions</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interactive Sticky Notes Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <StickyNote className="w-4 h-4" />
                Sticky Notes ({stickyNotes.length}/6)
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={addStickyNote}
                title="Add new note"
                disabled={stickyNotes.length >= 6}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {(() => {
              // Filter out notes that are assigned to calendar dates
              const assignedNoteIds = new Set(Object.keys(noteAssignments));
              const unassignedNotes = stickyNotes.filter(note => !assignedNoteIds.has(note.id));
              
              if (unassignedNotes.length === 0) {
                return (
                  <div className="text-center py-8 text-muted-foreground text-xs">
                    <StickyNote className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>{stickyNotes.length === 0 ? 'No sticky notes yet' : 'All notes are on the calendar'}</p>
                    <p className="mt-1">{stickyNotes.length === 0 ? 'Click + to create one' : 'Drag notes from calendar or create new ones'}</p>
                  </div>
                );
              }
              
              return unassignedNotes.map((note) => {
              const colors = getNoteColors(note.color);
              const isEditing = editingNoteId === note.id;
              
              return (
                <div
                  key={note.id}
                  draggable={!isEditing}
                  onDragStart={(e) => {
                    if (!isEditing) {
                      e.dataTransfer.setData('application/json', JSON.stringify(note));
                      e.dataTransfer.effectAllowed = 'copy';
                    }
                  }}
                  className={`relative ${colors.bg} rounded-lg border-2 ${colors.border} shadow-md transform ${!isEditing ? 'cursor-move hover:shadow-lg' : ''}`}
                  style={{ transform: `rotate(${note.rotation}deg)` }}
                >
                  <div className={`absolute top-2 right-2 w-6 h-6 ${colors.circle} rounded-full opacity-50`}></div>
                  
                  {isEditing ? (
                    <div className="p-3">
                      <textarea
                        ref={textareaRef}
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className={`w-full min-h-[80px] p-2 text-xs ${colors.text} bg-white/50 dark:bg-black/20 rounded border ${colors.border} resize-none focus:outline-none focus:ring-2 focus:ring-offset-1`}
                        placeholder="Write your note here..."
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            setEditingNoteId(null);
                            setEditingContent('');
                          }
                        }}
                      />
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs"
                          onClick={() => saveNote(note.id)}
                        >
                          <Save className="w-3 h-3 mr-1" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs"
                          onClick={() => {
                            setEditingNoteId(null);
                            setEditingContent('');
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs ml-auto text-red-600 hover:text-red-700"
                          onClick={() => deleteNote(note.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-h-[60px]">
                          {note.content ? (
                            <p className={`text-xs ${colors.textMuted} whitespace-pre-wrap break-words`}>
                              {note.content}
                            </p>
                          ) : (
                            <p className={`text-xs ${colors.textMuted} opacity-50 italic`}>
                              Click to add a note...
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                            onClick={() => startEditing(note)}
                            title="Edit note"
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 opacity-60 hover:opacity-100 text-red-600 hover:text-red-700"
                            onClick={() => deleteNote(note.id)}
                            title="Delete note"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      {!note.content && (
                        <div
                          className="cursor-pointer"
                          onClick={() => startEditing(note)}
                        >
                          <p className={`text-xs ${colors.textMuted} opacity-50 text-center py-2`}>
                            Click to write...
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            });
            })()}
          </div>

          {/* Notifications feature removed */}
        </div>
      </ScrollArea>
    </div>
  );
}