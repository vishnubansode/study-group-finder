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
  CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { courseApi, userCourseApi, mockData } from '@/services/courseService';
import { Course, UserCourse, CourseSearchParams, CoursePeer, CourseStats } from '@/types/course';
import { CourseCard } from '@/components/course/CourseCard';
import { CourseSearch } from '@/components/course/CourseSearch';
import { Pagination } from '@/components/course/Pagination';

// Mock enrolled courses with additional UI data
const enrolledCoursesWithProgress = [
  {
    id: 1,
    enrollmentId: 1,
    userId: 1,
    courseId: 1,
    enrollmentDate: '2024-08-15',
    course: {
      id: 1,
      courseCode: 'CS101',
      courseName: 'Introduction to Computer Science',
      description: 'Fundamentals of programming and computer science concepts including algorithms, data structures, and software engineering principles.',
      instructorName: 'Dr. Sarah Mitchell',
      classSchedule: 'MWF 10:00-11:00 AM',
      creditHours: 4,
      courseCapacity: 30,
      currentEnrollment: 25,
      isEnrolled: true,
    },
    progress: 75,
    grade: 'A-',
    nextAssignment: 'Programming Project 3',
    dueDate: 'Nov 15, 2024',
    studyGroupsCount: 3,
  },
  {
    id: 2,
    enrollmentId: 2,
    userId: 1,
    courseId: 2,
    enrollmentDate: '2024-08-15',
    course: {
      id: 2,
      courseCode: 'MATH201',
      courseName: 'Calculus II',
      description: 'Advanced calculus including integration techniques, infinite series, and applications to physics and engineering.',
      instructorName: 'Prof. Michael Chen',
      classSchedule: 'TTh 2:00-3:30 PM',
      creditHours: 4,
      courseCapacity: 35,
      currentEnrollment: 28,
      isEnrolled: true,
    },
    progress: 68,
    grade: 'B+',
    nextAssignment: 'Integration Techniques Quiz',
    dueDate: 'Nov 12, 2024',
    studyGroupsCount: 2,
  },
  {
    id: 3,
    enrollmentId: 3,
    userId: 1,
    courseId: 3,
    enrollmentDate: '2024-08-15',
    course: {
      id: 3,
      courseCode: 'PHYS151',
      courseName: 'Physics I: Mechanics',
      description: 'Introduction to classical mechanics covering kinematics, dynamics, energy, momentum, and rotational motion.',
      instructorName: 'Dr. Emma Rodriguez',
      classSchedule: 'MWF 1:00-2:00 PM, Lab W 3:00-5:00 PM',
      creditHours: 4,
      courseCapacity: 25,
      currentEnrollment: 22,
      isEnrolled: true,
    },
    progress: 82,
    grade: 'A',
    nextAssignment: 'Lab Report 4',
    dueDate: 'Nov 18, 2024',
    studyGroupsCount: 1,
  },
];

// Mock available courses for catalog
const availableCoursesData = [
  {
    id: 4,
    courseCode: 'CS201',
    courseName: 'Data Structures and Algorithms',
    description: 'Advanced programming concepts including data structures, algorithm design, and complexity analysis.',
    instructorName: 'Dr. Lisa Park',
    classSchedule: 'MWF 9:00-10:00 AM',
    creditHours: 4,
    courseCapacity: 30,
    currentEnrollment: 18,
    isEnrolled: false,
  },
  {
    id: 5,
    courseCode: 'MATH301',
    courseName: 'Linear Algebra',
    description: 'Vector spaces, linear transformations, matrices, eigenvalues, and applications.',
    instructorName: 'Prof. Robert Kim',
    classSchedule: 'TTh 10:00-11:30 AM',
    creditHours: 3,
    courseCapacity: 25,
    currentEnrollment: 20,
    isEnrolled: false,
  },
  {
    id: 6,
    courseCode: 'ENG101',
    courseName: 'English Composition',
    description: 'Fundamentals of academic writing, research, and communication skills.',
    instructorName: 'Prof. Jennifer Adams',
    classSchedule: 'TTh 9:00-10:30 AM',
    creditHours: 3,
    courseCapacity: 20,
    currentEnrollment: 20,
    isEnrolled: false,
  },
  {
    id: 7,
    courseCode: 'HIST120',
    courseName: 'World History',
    description: 'Survey of world civilizations from ancient times to the present.',
    instructorName: 'Prof. James Wilson',
    classSchedule: 'TTh 11:00 AM-12:30 PM',
    creditHours: 3,
    courseCapacity: 35,
    currentEnrollment: 15,
    isEnrolled: false,
  },
  {
    id: 8,
    courseCode: 'BIO101',
    courseName: 'General Biology',
    description: 'Introduction to biological principles including cell biology, genetics, and evolution.',
    instructorName: 'Dr. Maria Santos',
    classSchedule: 'MWF 11:00 AM-12:00 PM, Lab T 2:00-4:00 PM',
    creditHours: 4,
    courseCapacity: 30,
    currentEnrollment: 25,
    isEnrolled: false,
  },
];

export default function Courses() {
  const [activeTab, setActiveTab] = useState<'enrolled' | 'catalog'>('enrolled');
  const [enrolledCourses, setEnrolledCourses] = useState(enrolledCoursesWithProgress);
  const [availableCourses, setAvailableCourses] = useState(availableCoursesData);
  const [searchParams, setSearchParams] = useState<CourseSearchParams>({ page: 0, size: 10 });
  const [isLoading, setIsLoading] = useState(false);
  const [enrollingCourseId, setEnrollingCourseId] = useState<number | null>(null);
  const [droppingCourseId, setDroppingCourseId] = useState<number | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [courseStats, setCourseStats] = useState<CourseStats>({
    totalEnrolledCredits: 15,
    totalCourses: 3,
    averageProgress: 75,
    studyGroupsCount: 6,
  });
  const [selectedPeers, setSelectedPeers] = useState<CoursePeer[]>([]);
  const [showPeersDialog, setShowPeersDialog] = useState(false);

  const { toast } = useToast();

  // Calculate stats from enrolled courses
  useEffect(() => {
    const stats = {
      totalEnrolledCredits: enrolledCourses.reduce((sum, course) => sum + course.course.creditHours, 0),
      totalCourses: enrolledCourses.length,
      averageProgress: enrolledCourses.length > 0 
        ? Math.round(enrolledCourses.reduce((sum, course) => sum + course.progress, 0) / enrolledCourses.length)
        : 0,
      studyGroupsCount: enrolledCourses.reduce((sum, course) => sum + course.studyGroupsCount, 0),
    };
    setCourseStats(stats);
  }, [enrolledCourses]);

  // Load courses based on active tab
  useEffect(() => {
    if (activeTab === 'catalog') {
      loadAvailableCourses();
    }
  }, [activeTab, searchParams]);

  const loadAvailableCourses = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would call the API
      // const response = await courseApi.getAllCourses(searchParams);
      
      // For now, use mock data with client-side filtering
      let filteredCourses = [...availableCoursesData];
      
      if (searchParams.query) {
        const query = searchParams.query.toLowerCase();
        filteredCourses = filteredCourses.filter(course => 
          course.courseCode.toLowerCase().includes(query) ||
          course.courseName.toLowerCase().includes(query) ||
          course.instructorName.toLowerCase().includes(query)
        );
      }

      // Sort results
      if (searchParams.sortBy) {
        filteredCourses.sort((a, b) => {
          const aVal = a[searchParams.sortBy as keyof Course];
          const bVal = b[searchParams.sortBy as keyof Course];
          
          if (typeof aVal === 'string' && typeof bVal === 'string') {
            const result = aVal.localeCompare(bVal);
            return searchParams.sortDir === 'desc' ? -result : result;
          }
          
          if (typeof aVal === 'number' && typeof bVal === 'number') {
            const result = aVal - bVal;
            return searchParams.sortDir === 'desc' ? -result : result;
          }
          
          return 0;
        });
      }

      // Simulate pagination
      const pageSize = searchParams.size || 10;
      const page = searchParams.page || 0;
      const startIndex = page * pageSize;
      const paginatedCourses = filteredCourses.slice(startIndex, startIndex + pageSize);

      setAvailableCourses(paginatedCourses);
      setTotalElements(filteredCourses.length);
      setTotalPages(Math.ceil(filteredCourses.length / pageSize));
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
    setSearchParams({ ...searchParams, ...params, page: 0 });
  };

  const handlePageChange = (page: number) => {
    setSearchParams({ ...searchParams, page });
  };

  const handlePageSizeChange = (size: number) => {
    setSearchParams({ ...searchParams, size, page: 0 });
  };

  const handleEnroll = async (courseId: number) => {
    setEnrollingCourseId(courseId);
    try {
      // In a real app, this would call the API
      // await userCourseApi.enrollInCourse(courseId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const courseToEnroll = availableCourses.find(c => c.id === courseId);
      if (courseToEnroll) {
        const newEnrollment = {
          id: Date.now(),
          enrollmentId: Date.now(),
          userId: 1,
          courseId: courseId,
          enrollmentDate: new Date().toISOString().split('T')[0],
          course: { ...courseToEnroll, isEnrolled: true },
          progress: 0,
          grade: 'In Progress',
          nextAssignment: 'Getting Started',
          dueDate: 'TBD',
          studyGroupsCount: 0,
        };
        
        setEnrolledCourses(prev => [...prev, newEnrollment]);
        setAvailableCourses(prev => prev.map(c => 
          c.id === courseId 
            ? { ...c, isEnrolled: true, currentEnrollment: c.currentEnrollment + 1 }
            : c
        ));
        
        toast({
          title: "Successfully Enrolled!",
          description: `You have been enrolled in ${courseToEnroll.courseName}`,
        });
      }
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

  const handleDrop = async (courseId: number) => {
    setDroppingCourseId(courseId);
    try {
      // In a real app, this would call the API
      // await userCourseApi.dropCourse(courseId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const courseToDrop = enrolledCourses.find(c => c.course.id === courseId);
      if (courseToDrop) {
        setEnrolledCourses(prev => prev.filter(c => c.course.id !== courseId));
        setAvailableCourses(prev => prev.map(c => 
          c.id === courseId 
            ? { ...c, isEnrolled: false, currentEnrollment: Math.max(0, c.currentEnrollment - 1) }
            : c
        ));
        
        toast({
          title: "Course Dropped",
          description: `You have been dropped from ${courseToDrop.course.courseName}`,
        });
      }
    } catch (error) {
      console.error('Failed to drop course:', error);
      toast({
        title: "Drop Failed",
        description: "Failed to drop course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDroppingCourseId(null);
    }
  };

  const handleViewPeers = async (courseId: number) => {
    try {
      // In a real app, this would call the API
      // const peers = await userCourseApi.getCoursePeers(courseId);
      
      // Mock peers data
      const mockPeers: CoursePeer[] = [
        {
          id: 1,
          firstName: 'Alice',
          lastName: 'Johnson',
          email: 'alice.johnson@university.edu',
          enrollmentDate: '2024-08-15',
        },
        {
          id: 2,
          firstName: 'Bob',
          lastName: 'Smith',
          email: 'bob.smith@university.edu',
          enrollmentDate: '2024-08-16',
        },
        {
          id: 3,
          firstName: 'Carol',
          lastName: 'Davis',
          email: 'carol.davis@university.edu',
          enrollmentDate: '2024-08-17',
        },
      ];
      
      setSelectedPeers(mockPeers);
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

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 pb-24 lg:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
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
                  <Calendar className="w-5  mr-2" />
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
                  onClick={() => activeTab === 'catalog' && loadAvailableCourses()}
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
                  placeholder="Search courses by code, name, or instructor..."
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Course Content */}
        {activeTab === 'enrolled' ? (
          <div>
            {enrolledCourses.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {enrolledCourses.map((enrollment) => (
                  <CourseCard
                    key={enrollment.id}
                    course={enrollment.course}
                    variant="enrolled"
                    onDrop={handleDrop}
                    onViewPeers={handleViewPeers}
                    isDropping={droppingCourseId === enrollment.course.id}
                    showProgress={true}
                    progress={enrollment.progress}
                    grade={enrollment.grade}
                    nextAssignment={enrollment.nextAssignment}
                    dueDate={enrollment.dueDate}
                    studyGroupsCount={enrollment.studyGroupsCount}
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
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
                      <p className="text-xs text-gray-400">Enrolled: {peer.enrollmentDate}</p>
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