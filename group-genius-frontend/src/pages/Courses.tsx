// pages/Courses.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  Search, 
  Plus,
  GraduationCap,
  Target,
  TrendingUp,
  Users,
  Calendar,
  Clock,
  UserPlus,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { courseApi, userCourseApi } from '@/services/courseService';
import { Course, UserCourse, CourseSearchParams, CoursePeer, CourseStats, UserDashboardResponse } from '@/types/course';
import { CourseCard } from '@/components/course/CourseCard';
import { CourseSearch } from '@/components/course/CourseSearch';
import { Pagination } from '@/components/course/Pagination';
import { useAuth } from '@/contexts/AuthContext';

// Confirmation Dialog Component
function ConfirmDropDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  course 
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  course: Course | null;
}) {
  if (!isOpen || !course) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Confirm Course Drop
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to drop this course?
            </p>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs font-mono">
                  {course.courseCode}
                </Badge>
              </div>
              <p className="font-medium text-sm">{course.courseName}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              This action cannot be undone. You will need to re-enroll if you change your mind.
            </p>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Drop Course
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Courses() {
  const [activeTab, setActiveTab] = useState<'enrolled' | 'catalog'>('enrolled');
  const [enrolledCourses, setEnrolledCourses] = useState<UserCourse[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [searchParams, setSearchParams] = useState<CourseSearchParams>({ page: 0, size: 10 });
  const [isLoading, setIsLoading] = useState(false);
  const [enrollingCourseId, setEnrollingCourseId] = useState<number | null>(null);
  const [droppingCourseId, setDroppingCourseId] = useState<number | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [courseStats, setCourseStats] = useState<CourseStats>({
    totalEnrolledCredits: 0,
    totalCourses: 0,
    averageProgress: 0,
    studyGroupsCount: 0,
  });
  const [selectedPeers, setSelectedPeers] = useState<CoursePeer[]>([]);
  const [showPeersDialog, setShowPeersDialog] = useState(false);
  
  // Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [courseToDrop, setCourseToDrop] = useState<Course | null>(null);

  const { toast } = useToast();
  const { user } = useAuth();

  // Load user dashboard data when component mounts or active tab changes
  useEffect(() => {
    if (user && activeTab === 'enrolled') {
      loadUserDashboard();
    }
  }, [user, activeTab]);

  // Load available courses when catalog tab is active
  useEffect(() => {
    if (activeTab === 'catalog') {
      loadAvailableCourses();
    }
  }, [activeTab, searchParams]);

  const loadUserDashboard = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const dashboard: UserDashboardResponse = await userCourseApi.getUserDashboard(user.id);
      setEnrolledCourses(dashboard.enrolledCourses);
      
      // Calculate stats from enrolled courses
      const stats = {
        totalEnrolledCredits: dashboard.enrolledCourses.length * 3, // Assuming 3 credits per course
        totalCourses: dashboard.enrolledCourses.length,
        averageProgress: 75, // This would come from backend in real implementation
        studyGroupsCount: Math.floor(dashboard.enrolledCourses.length * 1.5), // Mock calculation
      };
      setCourseStats(stats);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      toast({
        title: "Error",
        description: "Failed to load your courses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailableCourses = async () => {
    setIsLoading(true);
    try {
      let response;
      const params = {
        page: searchParams.page || 0,
        size: searchParams.size || 10,
        sortBy: searchParams.sortBy,
        sortDirection: searchParams.sortDirection,
        userId: user?.id,
      } as any;

      if (searchParams.query) {
        // courseService.searchCourses expects (query, {page,size,userId})
        response = await courseApi.searchCourses(searchParams.query, {
          page: params.page,
          size: params.size,
          userId: params.userId,
        });
      } else {
        // courseService.getAllCourses expects a params object
        response = await courseApi.getAllCourses(params);
      }

      setAvailableCourses(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      console.error('Failed to load courses:', error);
      toast({
        title: "Error",
        description: "Failed to load courses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (params: CourseSearchParams) => {
    setSearchParams({ 
      ...searchParams, 
      ...params, 
      page: 0 
    });
  };

  const handlePageChange = (page: number) => {
    setSearchParams({ ...searchParams, page });
  };

  const handlePageSizeChange = (size: number) => {
    setSearchParams({ ...searchParams, size, page: 0 });
  };

  const handleEnroll = async (courseId: number) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to enroll in courses.",
        variant: "destructive",
      });
      return;
    }

    setEnrollingCourseId(courseId);
    try {
      await userCourseApi.enrollInCourse(user.id, courseId);
      
      // Refresh the data
      await loadAvailableCourses();
      await loadUserDashboard();
      
      toast({
        title: "Successfully Enrolled!",
        description: "You have been enrolled in the course",
      });
    } catch (error) {
      console.error('Failed to enroll in course:', error);
      toast({
        title: "Enrollment Failed",
        description: "Failed to enroll in course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setEnrollingCourseId(null);
    }
  };

  // Show confirmation dialog when user clicks drop button
  const handleDropClick = (course: Course) => {
    setCourseToDrop(course);
    setShowConfirmDialog(true);
  };

  // Actually drop the course after confirmation
  const handleDropConfirm = async () => {
    if (!user || !courseToDrop) return;

    setShowConfirmDialog(false);
    setDroppingCourseId(courseToDrop.id);
    
    try {
      await userCourseApi.dropCourse(user.id, courseToDrop.id);
      
      // Refresh the data
      await loadUserDashboard();
      
      toast({
        title: "Course Dropped",
        description: `You have been dropped from ${courseToDrop.courseName}`,
      });
    } catch (error) {
      console.error('Failed to drop course:', error);
      toast({
        title: "Drop Failed",
        description: "Failed to drop course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDroppingCourseId(null);
      setCourseToDrop(null);
    }
  };

  // Cancel the drop operation
  const handleDropCancel = () => {
    setShowConfirmDialog(false);
    setCourseToDrop(null);
  };

  const handleViewPeers = async (courseId: number) => {
    if (!user) return;

    try {
      const response = await userCourseApi.getCoursePeers(courseId, user.id);
      setSelectedPeers(response.peers);
      setShowPeersDialog(true);
    } catch (error) {
      console.error('Failed to load course peers:', error);
      toast({
        title: "Error",
        description: "Failed to load course peers. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 pb-24 lg:pb-8 flex items-center justify-center overflow-x-hidden">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-6">Please log in to view and manage your courses.</p>
            <Button asChild>
              <Link to="/login">Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 pb-24 lg:pb-8 overflow-x-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                  My Courses
                </h1>
              </div>
              <p className="text-xl text-blue-100 max-w-3xl leading-relaxed">
                Manage your academic journey, track progress, connect with study groups, and discover new learning opportunities.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8"
                onClick={() => setActiveTab('catalog')}
              >
                <Plus className="w-5 h-5 mr-2" />
                Browse Courses
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white/30 text-white hover:bg-white/10 px-8"
                asChild
              >
                <Link to="/calendar">
                  <Calendar className="w-5 h-5 mr-2" />
                  View Schedule
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Academic Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-white to-blue-50/50 border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Credits
              </CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <GraduationCap className="w-5 h-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{courseStats.totalEnrolledCredits}</div>
              <p className="text-sm text-gray-500 mt-1">This semester</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-green-50/50 border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Enrolled Courses
              </CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{courseStats.totalCourses}</div>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <CheckCircle className="w-3 h-3 mr-1" />
                Active enrollment
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-purple-50/50 border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Average Progress
              </CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{courseStats.averageProgress}%</div>
              <div className="mt-2">
                <Progress value={courseStats.averageProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-indigo-50/50 border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Study Groups
              </CardTitle>
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{courseStats.studyGroupsCount}</div>
              <p className="text-sm text-indigo-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                Active groups joined
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs and Controls */}
        <Card className="mb-8 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                <Button
                  variant={activeTab === 'enrolled' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('enrolled')}
                  className={`${activeTab === 'enrolled' 
                    ? 'bg-white shadow-sm text-gray-900' 
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  My Courses ({enrolledCourses.length})
                </Button>
                <Button
                  variant={activeTab === 'catalog' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('catalog')}
                  className={`${activeTab === 'catalog' 
                    ? 'bg-white shadow-sm text-gray-900' 
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Course Catalog
                </Button>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => activeTab === 'catalog' ? loadAvailableCourses() : loadUserDashboard()}
                  disabled={isLoading}
                  className="gap-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Refresh
                </Button>
              </div>
            </div>

            {/* Course Search for Catalog Tab */}
            {activeTab === 'catalog' && (
              <div className="mt-6">
                <CourseSearch
                  onSearch={handleSearch}
                  isLoading={isLoading}
                  totalResults={totalElements}
                  placeholder="Search courses by code or name"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Course Content */}
        {activeTab === 'enrolled' ? (
          <div>
            {enrolledCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {enrolledCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    variant="enrolled"
                    onDrop={handleDropClick} // Changed to handleDropClick
                    onViewPeers={handleViewPeers}
                    isDropping={droppingCourseId === course.id}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No enrolled courses</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Start your academic journey by browsing and enrolling in available courses.
                </p>
                <Button 
                  onClick={() => setActiveTab('catalog')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Browse Course Catalog
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div>
            {availableCourses.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {availableCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      variant="catalog"
                      onEnroll={handleEnroll}
                      isEnrolling={enrollingCourseId === course.id}
                    />
                  ))}
                </div>
                
                {/* Pagination */}
                <Pagination
                  currentPage={searchParams.page || 0}
                  totalPages={totalPages}
                  pageSize={searchParams.size || 10}
                  totalElements={totalElements}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  isLoading={isLoading}
                />
              </>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchParams.query ? 'No courses found' : 'No courses available'}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchParams.query 
                    ? `No courses match your search for "${searchParams.query}". Try different keywords.`
                    : 'Check back later for new course offerings or adjust your search criteria.'
                  }
                </p>
                {searchParams.query && (
                  <Button 
                    variant="outline"
                    onClick={() => handleSearch({ query: undefined })}
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Confirmation Dialog for Dropping Course */}
        <ConfirmDropDialog
          isOpen={showConfirmDialog}
          onClose={handleDropCancel}
          onConfirm={handleDropConfirm}
          course={courseToDrop}
        />

        {/* Peers Dialog */}
        {showPeersDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Course Peers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedPeers.map((peer) => (
                  <div key={peer.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <Avatar>
                      <AvatarImage src={peer.profileImageUrl} />
                      <AvatarFallback>
                        {peer.firstName[0]}{peer.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{peer.firstName} {peer.lastName}</p>
                      <p className="text-sm text-gray-500">{peer.email}</p>
                      <p className="text-xs text-gray-400">{peer.commonCourses} common courses</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Connect
                    </Button>
                  </div>
                ))}
                <div className="flex justify-end pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowPeersDialog(false)}
                  >
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}