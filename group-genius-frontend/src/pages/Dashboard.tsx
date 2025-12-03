import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { resolveMediaUrl } from '@/lib/media';
import { 
  Users, 
  Calendar, 
  BookOpen, 
  Plus, 
  TrendingUp, 
  MessageCircle,
  Target,
  UserPlus,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  GraduationCap,
  Edit,
  Zap,
  Star,
  BookmarkCheck,
  Sparkles,
  Layers,
  BarChart3
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ChatContainer from '@/components/Chat/ChatContainer';
import { userCourseApi } from '@/services/courseService';
import type { Course, CoursePeer, UserDashboardResponse } from '@/types/course';

type DashboardCourse = Course & { currentEnrollment?: number };
type StatDetail = {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
};

type StatCardConfig = {
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  details?: StatDetail[];
  chip?: { label: string; value: string };
  insight?: string;
  accent?: {
    gradient?: string;
    iconBg?: string;
    chipBg?: string;
    ring?: string;
  };
};

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

  const [dashboardData, setDashboardData] = useState<UserDashboardResponse | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [expandedCourseId, setExpandedCourseId] = useState<number | null>(null);
  const [expandedPeerId, setExpandedPeerId] = useState<number | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    let isMounted = true;
    setDashboardLoading(true);
    setDashboardError(null);

    userCourseApi.getUserDashboard(user.id)
      .then((data) => {
        if (!isMounted) return;
        setDashboardData(data);
      })
      .catch((error) => {
        if (!isMounted) return;
        setDashboardError(error?.message || 'Unable to load dashboard data.');
      })
      .finally(() => {
        if (!isMounted) return;
        setDashboardLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const enrolledCourses: DashboardCourse[] = (dashboardData?.enrolledCourses ?? []) as DashboardCourse[];
  const suggestedPeers: CoursePeer[] = (dashboardData?.suggestedPeers ?? []) as CoursePeer[];
  const totalCourses = dashboardData?.totalCourses ?? 0;
  const totalPeers = dashboardData?.totalPeers ?? 0;
  const peersWithCommonCourses = suggestedPeers.filter(peer => (peer.commonCourses ?? 0) > 0).length;
  const sharedCourseCount = suggestedPeers.reduce((sum, peer) => sum + (peer.commonCourses ?? 0), 0);
  const totalEnrollment = enrolledCourses.reduce((sum, course) => sum + (course.currentEnrollment ?? 0), 0);
  const averageClassSize = enrolledCourses.length ? Math.round(totalEnrollment / enrolledCourses.length) : 0;
  const activeCourseCount = enrolledCourses.filter(course => course.isEnrolled).length;
  const savedCourseCount = Math.max(totalCourses - activeCourseCount, 0);
  const latestCourseCode = enrolledCourses[0]?.courseCode ?? '—';
  const averagePeerOverlap = suggestedPeers.length ? sharedCourseCount / suggestedPeers.length : 0;
  const formattedAveragePeerOverlap = averagePeerOverlap % 1 === 0 ? averagePeerOverlap.toString() : averagePeerOverlap.toFixed(1);
  const topPeerMatch = suggestedPeers.reduce<CoursePeer | undefined>((currentTop, peer) => {
    if (!currentTop) return peer;
    return (peer.commonCourses ?? 0) > (currentTop.commonCourses ?? 0) ? peer : currentTop;
  }, undefined);
  const engagedPeers = suggestedPeers.filter(peer => (peer.commonCourses ?? 0) >= 2).length;
  const classSizes = enrolledCourses.map((course) => course.currentEnrollment ?? 0);
  const largestClassSize = classSizes.length ? Math.max(...classSizes) : 0;
  const smallestClassSize = classSizes.length ? Math.min(...classSizes) : 0;
  const classSpread = classSizes.length ? Math.max(largestClassSize - smallestClassSize, 0) : 0;
  const courseColorPalette = ['bg-primary', 'bg-secondary', 'bg-accent', 'bg-orange-500', 'bg-emerald-500'];
  const getCourseColor = (index: number) => courseColorPalette[index % courseColorPalette.length];
  const defaultChatGroupId = 1;
  const topPeerMatchName = topPeerMatch ? `${topPeerMatch.firstName} ${topPeerMatch.lastName ?? ''}`.trim() : 'Pending';
  const statCards: StatCardConfig[] = [
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: 'Enrolled Courses',
      value: totalCourses.toString(),
      change: dashboardLoading ? 'Syncing courses...' : activeCourseCount ? `${activeCourseCount} courses active now` : 'Enroll to get started',
      trend: activeCourseCount ? 'up' : 'neutral',
      chip: totalCourses ? { label: 'Active ratio', value: `${activeCourseCount}/${totalCourses}` } : undefined,
      insight: totalCourses ? 'Keep momentum by spreading study blocks through the week.' : 'Add your first class to unlock personalized insights.',
      accent: {
        gradient: 'from-sky-500/15 via-sky-500/5 to-transparent',
        iconBg: 'bg-sky-500/15 text-sky-600',
        chipBg: 'bg-sky-500/10 text-sky-700',
        ring: 'ring-1 ring-sky-500/20',
      },
      details: [
        { label: 'Active now', value: activeCourseCount.toString(), hint: 'Courses currently running', icon: <Zap className="w-3 h-3" /> },
        { label: 'Saved for later', value: savedCourseCount.toString(), hint: 'Pinned to revisit soon', icon: <BookmarkCheck className="w-3 h-3" /> },
        { label: 'Latest course', value: latestCourseCode, hint: 'Most recent enrollment', icon: <BookOpen className="w-3 h-3" /> },
      ],
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: 'Suggested Peers',
      value: totalPeers.toString(),
      change: dashboardLoading ? 'Matching peers...' : peersWithCommonCourses ? `${peersWithCommonCourses} ready to collaborate` : 'Enroll to unlock matches',
      trend: peersWithCommonCourses ? 'up' : 'neutral',
      chip: suggestedPeers.length ? { label: 'High-overlap', value: engagedPeers.toString() } : undefined,
      insight: peersWithCommonCourses ? `Top match: ${topPeerMatchName}` : 'Once you share courses, we surface best-fit peers.',
      accent: {
        gradient: 'from-violet-500/15 via-violet-500/5 to-transparent',
        iconBg: 'bg-violet-500/15 text-violet-600',
        chipBg: 'bg-violet-500/10 text-violet-700',
        ring: 'ring-1 ring-violet-500/20',
      },
      details: [
        { label: 'Matches ready', value: peersWithCommonCourses.toString(), hint: 'Share at least one class', icon: <Users className="w-3 h-3" /> },
        { label: 'Avg overlap', value: `${formattedAveragePeerOverlap} courses`, hint: 'Per suggested peer', icon: <Layers className="w-3 h-3" /> },
        { label: 'Top match', value: topPeerMatchName, hint: 'Most shared courses', icon: <Sparkles className="w-3 h-3" /> },
      ],
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: 'Average Class Size',
      value: averageClassSize.toString(),
      change: enrolledCourses.length ? 'Across your current schedule' : 'Join a course to see data',
      trend: enrolledCourses.length ? 'up' : 'neutral',
      chip: enrolledCourses.length ? { label: 'Sections tracked', value: enrolledCourses.length.toString() } : undefined,
      insight: classSizes.length ? `Largest group has ${largestClassSize} learners; spread of ${classSpread}.` : 'Class insights appear after enrolling.',
      accent: {
        gradient: 'from-emerald-500/15 via-emerald-500/5 to-transparent',
        iconBg: 'bg-emerald-500/15 text-emerald-600',
        chipBg: 'bg-emerald-500/10 text-emerald-700',
        ring: 'ring-1 ring-emerald-500/20',
      },
      details: [
        { label: 'Largest class', value: classSizes.length ? `${largestClassSize} students` : '—', hint: 'Peak enrollment', icon: <TrendingUp className="w-3 h-3" /> },
        { label: 'Smallest class', value: classSizes.length ? `${smallestClassSize} students` : '—', hint: 'Most intimate', icon: <Target className="w-3 h-3" /> },
        { label: 'Spread', value: classSizes.length ? `${classSpread} learners` : '—', hint: 'Range between classes', icon: <BarChart3 className="w-3 h-3" /> },
      ],
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: 'Shared Courses',
      value: sharedCourseCount.toString(),
      change: suggestedPeers.length ? 'Total overlaps with peers' : 'No overlaps yet',
      trend: sharedCourseCount ? 'up' : 'neutral',
      chip: suggestedPeers.length ? { label: 'Peers', value: suggestedPeers.length.toString() } : undefined,
      insight: sharedCourseCount ? 'Leverage overlaps to spin up focused study pods.' : 'Shared course data appears after connecting with peers.',
      accent: {
        gradient: 'from-amber-500/15 via-amber-500/5 to-transparent',
        iconBg: 'bg-amber-500/15 text-amber-600',
        chipBg: 'bg-amber-500/10 text-amber-700',
        ring: 'ring-1 ring-amber-500/20',
      },
      details: [
        { label: 'Engaged peers', value: peersWithCommonCourses.toString(), hint: 'Share at least one class', icon: <Users className="w-3 h-3" /> },
        { label: 'High-overlap peers', value: engagedPeers.toString(), hint: '2+ shared courses', icon: <Target className="w-3 h-3" /> },
        { label: 'Avg per peer', value: formattedAveragePeerOverlap, hint: 'Shared courses each', icon: <BarChart3 className="w-3 h-3" /> },
      ],
    },
  ];
  
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

          {dashboardError && (
            <div className="max-w-7xl mx-auto px-6 mt-4">
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 text-destructive px-4 py-3 text-sm">
                {dashboardError}
              </div>
            </div>
          )}

      <div className="max-w-7xl mx-auto px-6 py-8 pb-24 lg:pb-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card) => (
            <StatCard key={card.title} {...card} />
          ))}
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
                        {dashboardLoading ? 'Syncing courses...' : `${totalCourses} Courses`}
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Users className="w-3 h-3" />
                        {dashboardLoading ? 'Finding peers...' : `${totalPeers} Peers`}
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Star className="w-3 h-3" />
                        {sharedCourseCount} Shared Courses
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

            {/* My Courses Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      Enrolled Courses
                    </CardTitle>
                    <CardDescription>Synced from your dashboard</CardDescription>
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
                {dashboardLoading && (
                  <div className="text-sm text-muted-foreground">Loading courses...</div>
                )}
                {!dashboardLoading && enrolledCourses.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    You haven't enrolled in any courses yet. Visit the catalog to get started.
                  </div>
                )}
                {enrolledCourses.map((course, index) => {
                  const isExpanded = expandedCourseId === course.id;
                  return (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                      className={`w-full text-left p-4 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                        isExpanded ? 'bg-accent/10 border-primary/40 shadow-sm' : 'hover:bg-accent/5'
                      }`}
                      aria-expanded={isExpanded}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 ${getCourseColor(index)} rounded-lg flex items-center justify-center flex-shrink-0 text-white font-semibold`}>
                          {course.courseCode?.slice(0, 2) || 'CC'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs font-mono">{course.courseCode}</Badge>
                            <h4 className="font-semibold text-sm truncate">{course.courseName}</h4>
                          </div>
                          <p className={`text-xs text-muted-foreground mb-2 ${isExpanded ? '' : 'truncate'}`}>
                            {course.description || 'No description available.'}
                          </p>
                          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {course.currentEnrollment ?? 0} currently enrolled
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {course.isEnrolled ? 'Enrolled' : 'Available'}
                            </span>
                          </div>
                          {isExpanded && (
                            <div className="mt-3 text-xs text-muted-foreground space-y-2">
                              <div className="flex flex-wrap gap-4">
                                <span>
                                  Course ID: <span className="font-medium text-foreground">#{course.id}</span>
                                </span>
                                <span>
                                  Enrollment trend: <span className="font-medium text-foreground">{course.currentEnrollment ?? 0} learners</span>
                                </span>
                              </div>
                              <p>
                                {course.description || 'No description provided for this course yet.'}
                              </p>
                              <div className="flex items-center gap-2 text-primary font-medium">
                                <ArrowRight className="w-3 h-3" />
                                Click again to collapse
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
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

            {/* Removed placeholder groups card */}
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
                {/* Use fallback group until user selects one */}
                <ChatContainer groupId={defaultChatGroupId} username={user?.firstName || user?.email || 'Guest'} />
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
                {dashboardLoading && (
                  <div className="text-sm text-muted-foreground">Finding peers who share your courses...</div>
                )}
                {!dashboardLoading && suggestedPeers.length === 0 && (
                  <div className="text-sm text-muted-foreground">No suggestions yet. Enroll in more courses to discover peers.</div>
                )}
                {suggestedPeers.map((peer) => {
                  const isExpanded = expandedPeerId === peer.id;
                  return (
                    <button
                      key={peer.id}
                      type="button"
                      onClick={() => setExpandedPeerId(isExpanded ? null : peer.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                        isExpanded ? 'bg-accent/10 border-primary/40 shadow-sm' : 'hover:bg-accent/5'
                      }`}
                      aria-expanded={isExpanded}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={peer.profileImageUrl || undefined} />
                          <AvatarFallback className="text-xs bg-gradient-to-br from-primary/80 to-secondary/80 text-white">
                            {[peer.firstName, peer.lastName].filter(Boolean).map((n) => n![0]).join('') || 'GG'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">{peer.firstName} {peer.lastName}</h4>
                          <p className="text-xs text-muted-foreground truncate">{peer.email}</p>
                          <p className="text-xs text-primary mt-1">{peer.commonCourses ?? 0} common courses</p>
                          {isExpanded && (
                            <div className="mt-2 text-xs text-muted-foreground space-y-1">
                              {peer.university && <p><span className="font-medium text-foreground">University:</span> {peer.university}</p>}
                              {peer.major && <p><span className="font-medium text-foreground">Major:</span> {peer.major}</p>}
                              {peer.bio && <p className="leading-relaxed">{peer.bio}</p>}
                              <p>
                                Shared courses: <span className="font-medium text-foreground">{peer.commonCourses ?? 0}</span>
                              </p>
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={(event) => {
                            event.stopPropagation();
                            // future: trigger connect action
                          }}
                        >
                          Connect
                        </Button>
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

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
  trend, 
  details,
  chip,
  insight,
  accent
}: StatCardConfig) {
  const accentStyles = {
    gradient: accent?.gradient ?? 'from-primary/10 via-primary/5 to-transparent',
    iconBg: accent?.iconBg ?? 'bg-primary/10 text-primary',
    chipBg: accent?.chipBg ?? 'bg-primary/10 text-primary',
    ring: accent?.ring ?? 'ring-1 ring-border/60',
  };

  const trendStyles = {
    up: { color: 'text-emerald-600', icon: <ArrowUpRight className="w-3 h-3" /> },
    down: { color: 'text-rose-500', icon: <ArrowDownRight className="w-3 h-3" /> },
    neutral: { color: 'text-muted-foreground', icon: <ArrowRight className="w-3 h-3" /> },
  } as const;

  const iconNode = React.isValidElement(icon)
    ? React.cloneElement(icon, { className: 'w-5 h-5' })
    : icon;

  return (
    <Card className={`relative overflow-hidden rounded-2xl border bg-card/90 backdrop-blur shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg ${accentStyles.ring}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${accentStyles.gradient}`} aria-hidden />
      <CardHeader className="relative flex flex-row items-start justify-between gap-3 pb-3">
        <div>
          <CardTitle className="text-sm font-semibold text-foreground/90">{title}</CardTitle>
          <p className={`text-xs mt-1 flex items-center gap-1 font-medium ${trendStyles[trend].color}`}>
            {trendStyles[trend].icon}
            {change}
          </p>
        </div>
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${accentStyles.iconBg}`}>
          {iconNode}
        </div>
      </CardHeader>
      <CardContent className="relative space-y-4">
        <div className="flex items-baseline gap-3 flex-wrap">
          <p className="text-4xl font-semibold tracking-tight">{value}</p>
          {chip ? (
            <span className={`text-[11px] uppercase tracking-wide font-semibold px-3 py-1 rounded-full ${accentStyles.chipBg}`}>
              {chip.label}: {chip.value}
            </span>
          ) : null}
        </div>
        {details?.length ? (
          <dl className="space-y-2.5 text-sm">
            {details.map((detail) => (
              <div
                key={`${title}-${detail.label}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/70 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  {detail.icon ? (
                    <span className="w-7 h-7 rounded-full bg-card/70 flex items-center justify-center text-muted-foreground">
                      {React.isValidElement(detail.icon)
                        ? React.cloneElement(detail.icon, { className: 'w-3.5 h-3.5' })
                        : detail.icon}
                    </span>
                  ) : null}
                  <div className="leading-tight">
                    <dt className="text-xs font-medium text-muted-foreground">{detail.label}</dt>
                    {detail.hint ? (
                      <span className="text-[11px] text-muted-foreground/80">{detail.hint}</span>
                    ) : null}
                  </div>
                </div>
                <dd className="text-sm font-semibold text-foreground">{detail.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {insight ? (
          <p className="text-xs text-muted-foreground/80 border-t border-dashed border-border/70 pt-2">
            {insight}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}