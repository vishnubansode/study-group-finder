import { useState } from 'react';
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
  Coffee
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

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [currentViewDate, setCurrentViewDate] = useState(new Date(currentYear, currentMonth, 1));

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
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="btn-hero">
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
                <Button className="w-full btn-academic" size="sm">
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
    </div>
  );
}