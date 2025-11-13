import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { resolveMediaUrl } from '@/lib/media';
import { 
  Users, 
  Calendar, 
  BookOpen, 
  Award, 
  Plus, 
  Clock, 
  TrendingUp, 
  MessageCircle,
  Target,
  UserPlus,
  ArrowRight,
  GraduationCap,
  Sparkles,
  Edit,
  Bell,
  CheckCircle2,
  X,
  Zap,
  Lightbulb,
  Star,
  Video,
  FileText
} from 'lucide-react';
import React, { useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ChatContainer from '@/components/Chat/ChatContainer';

export default function Dashboard() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  // Security check: Verify that the URL parameter matches the authenticated user
  if (id && user && user.id.toString() !== id) {
    return <Navigate to={`/dashboard/${user.id}`} replace />;
  }
  
  // If no ID in URL but user is authenticated, redirect to dashboard with ID
  if (!id && user) {
    return <Navigate to={`/dashboard/${user.id}`} replace />;
  }

  // Replace demo/mock arrays with real data fetches in future.
  // For now use empty arrays/placeholders to avoid showing dummy data.
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [suggestedPeers, setSuggestedPeers] = useState<any[]>([]);
  const [motivationalTips] = useState<any[]>([]);
  const currentTip = motivationalTips.length ? motivationalTips[Math.floor(Date.now() / (24 * 60 * 60 * 1000)) % motivationalTips.length] : null;
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Welcome back, {user?.firstName}! 👋
              </h1>
              <p className="text-muted-foreground">
                Here's what's happening with your study groups today
              </p>
            </div>
            <div className="flex gap-3">
              <Button className="gap-2" asChild>
                <Link to="/groups">
                  <Plus className="w-4 h-4" />
                  Create Group
                </Link>
              </Button>
              <Button variant="outline" className="gap-2" asChild>
                <Link to="/courses">
                  <BookOpen className="w-4 h-4" />
                  Browse Courses
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 pb-24 lg:pb-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            icon={<Users className="w-5 h-5" />} 
            title="My Groups" 
            value="5"
            change="+2 this week"
            trend="up"
          />
          <StatCard 
            icon={<Calendar className="w-5 h-5" />} 
            title="Sessions This Week" 
            value="8"
            change="3 completed"
            trend="neutral"
          />
          <StatCard 
            icon={<Clock className="w-5 h-5" />} 
            title="Study Hours" 
            value="24.5"
            change="+5.2 from last week"
            trend="up"
          />
          <StatCard 
            icon={<Award className="w-5 h-5" />} 
            title="Achievements" 
            value="12"
            change="2 new badges"
            trend="up"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left & Center Columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <Card className="bg-gradient-to-br from-primary/5 via-background to-secondary/5">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                    <AvatarImage src={resolveMediaUrl(user?.avatar || user?.profileImageUrl) ?? undefined} />
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-secondary text-white">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h2 className="text-2xl font-bold">{user?.firstName} {user?.lastName}</h2>
                      <Badge variant="secondary" className="w-fit mx-auto sm:mx-0">
                        <GraduationCap className="w-3 h-3 mr-1" />
                        Student
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{user?.email}</p>
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      <Badge variant="outline" className="gap-1">
                        <BookOpen className="w-3 h-3" />
                        4 Courses
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Users className="w-3 h-3" />
                        5 Groups
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Star className="w-3 h-3" />
                        12 Achievements
                      </Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2" asChild>
                    <Link to="/profile">
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Sessions Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Upcoming Study Sessions
                    </CardTitle>
                    <CardDescription className="mt-1">Your scheduled sessions</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/calendar" className="gap-1">
                      View All
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-all hover:shadow-sm">
                    <div className="flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-primary/10 flex-shrink-0">
                      <span className="text-xs font-semibold text-primary">{session.date}</span>
                      <span className="text-xs text-muted-foreground">{session.time.split(',')[1]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm truncate">{session.topic}</h4>
                        {session.type === 'video' ? (
                          <Badge variant="secondary" className="text-xs"><Video className="w-3 h-3 mr-1" />Online</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">In-Person</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{session.course} • {session.group}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {[...Array(Math.min(session.attendees, 3))].map((_, i) => (
                            <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/80 to-secondary/80 border-2 border-background flex items-center justify-center text-xs text-white font-semibold">
                              {String.fromCharCode(65 + i)}
                            </div>
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">{session.attendees} attending</span>
                      </div>
                    </div>
                    <Button size="sm" className="flex-shrink-0">Join</Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* My Courses Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      My Courses
                    </CardTitle>
                    <CardDescription>Your enrolled courses and progress</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/courses" className="gap-1">
                      View All
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {myCourses.map((course) => (
                  <div key={course.id} className="p-4 rounded-lg border hover:bg-accent/5 transition-colors group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${course.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs font-mono">{course.code}</Badge>
                            <h4 className="font-semibold text-sm">{course.name}</h4>
                          </div>
                          <p className="text-xs text-muted-foreground">{course.professor}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          asChild
                        >
                          <Link to={`/courses?course=${course.code}`}>
                            <Users className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Course Progress</span>
                        <span className="font-semibold">{course.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-secondary/20 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${course.color} transition-all duration-500`}
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Next assignment due soon</span>
                        <Link 
                          to={`/courses?course=${course.code}`}
                          className="text-primary hover:underline font-medium"
                        >
                          View details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="pt-3 border-t">
                  <Button variant="outline" className="w-full gap-2" asChild>
                    <Link to="/courses">
                      <Plus className="w-4 h-4" />
                      Browse Course Catalog
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* My Groups Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      My Study Groups
                    </CardTitle>
                    <CardDescription>Groups you've joined</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/groups" className="gap-1">
                      <Plus className="w-4 h-4" />
                      Create Group
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {myGroups.map((group) => (
                    <div key={group.id} className="p-3 rounded-lg border hover:border-primary/50 transition-all hover:shadow-sm cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-2xl flex-shrink-0">
                          {group.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm truncate">{group.name}</h4>
                            {group.active && (
                              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{group.members} members</p>
                          <p className="text-xs text-muted-foreground">Last active: {group.lastActivity}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Quick Actions Card */}
            <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="w-5 h-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start gap-2 shadow-sm" asChild>
                  <Link to="/groups">
                    <Plus className="w-4 h-4" />
                    Create Study Group
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <Link to="/courses">
                    <BookOpen className="w-4 h-4" />
                    Browse Courses
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <Link to="/calendar">
                    <Calendar className="w-4 h-4" />
                    Schedule Session
                  </Link>
                </Button>
                {/* Chat is embedded below; removed the external Start Chat link */}
              </CardContent>
            </Card>

            {/* Embedded Chat Card */}
            <Card className="h-[420px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  Group Chat
                </CardTitle>
                <CardDescription>Live chat for your primary group</CardDescription>
              </CardHeader>
              <CardContent className="p-0 h-[360px]">
                {/* Use first group as default chat group for now */}
                <ChatContainer groupId={myGroups.length ? myGroups[0].id : 1} username={user?.firstName || user?.email || 'Guest'} />
              </CardContent>
            </Card>
            {/* Notifications Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Bell className="w-5 h-5 text-primary" />
                    Notifications
                  </CardTitle>
                  <Badge variant="secondary">{notifications.filter(n => n.unread).length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {notifications.map((notification) => (
                  <div key={notification.id} className={`p-3 rounded-lg border transition-colors ${notification.unread ? 'bg-primary/5 border-primary/20' : 'hover:bg-accent/5'}`}>
                    <p className="text-sm mb-1">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">{notification.time}</p>
                    {notification.type === 'invite' && (
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="default" className="h-7 text-xs">Accept</Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs">Decline</Button>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Progress/Engagement Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  This Week's Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Groups Joined</span>
                    <span className="font-bold text-lg">5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Sessions Attended</span>
                    <span className="font-bold text-lg">8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Study Hours</span>
                    <span className="font-bold text-lg">24.5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Messages Sent</span>
                    <span className="font-bold text-lg">43</span>
                  </div>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-semibold">Great week! Keep it up! 🎉</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Suggested Peers Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <UserPlus className="w-5 h-5 text-primary" />
                  Suggested Peers
                </CardTitle>
                <CardDescription>Students with common courses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestedPeers.map((peer) => (
                  <div key={peer.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/5 transition-colors">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={peer.avatar || undefined} />
                      <AvatarFallback className="text-xs bg-gradient-to-br from-primary/80 to-secondary/80 text-white">
                        {peer.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm">{peer.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">{peer.commonCourses}</p>
                    </div>
                    <Button size="sm" variant="outline" className="h-7 text-xs">Connect</Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Motivational/Tip Card */}
            {currentTip ? (
              <Card className={`bg-gradient-to-br ${currentTip.color} border-primary/20`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {currentTip.icon}
                    Daily Tip
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{currentTip.text}</p>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  icon, 
  title, 
  value, 
  change, 
  trend 
}: { 
  icon: React.ReactNode; 
  title: string; 
  value: string; 
  change: string; 
  trend: 'up' | 'down' | 'neutral';
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs mt-1 flex items-center gap-1 ${
          trend === 'up' ? 'text-green-600' : 
          trend === 'down' ? 'text-red-600' : 
          'text-muted-foreground'
        }`}>
          {trend === 'up' && <TrendingUp className="w-3 h-3" />}
          {change}
        </p>
      </CardContent>
    </Card>
  );
}