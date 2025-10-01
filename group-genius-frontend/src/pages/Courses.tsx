import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Search, 
  Filter,
  Users,
  Calendar,
  Clock,
  Star,
  TrendingUp,
  Plus,
  GraduationCap,
  Target
} from 'lucide-react';
import { Link } from 'react-router-dom';

const enrolledCourses = [
  {
    id: 1,
    code: 'CS 101',
    name: 'Introduction to Computer Science',
    instructor: 'Dr. Sarah Mitchell',
    credits: 4,
    schedule: 'MWF 10:00-11:00 AM',
    progress: 75,
    grade: 'A-',
    studyGroups: 3,
    nextAssignment: 'Programming Project 3',
    dueDate: 'Nov 15, 2024',
    color: 'primary'
  },
  {
    id: 2,
    code: 'MATH 201',
    name: 'Calculus II',
    instructor: 'Prof. Michael Chen',
    credits: 4,
    schedule: 'TTh 2:00-3:30 PM',
    progress: 68,
    grade: 'B+',
    studyGroups: 2,
    nextAssignment: 'Integration Techniques Quiz',
    dueDate: 'Nov 12, 2024',
    color: 'secondary'
  },
  {
    id: 3,
    code: 'PHYS 151',
    name: 'Physics I: Mechanics',
    instructor: 'Dr. Emma Rodriguez',
    credits: 4,
    schedule: 'MWF 1:00-2:00 PM, Lab W 3:00-5:00 PM',
    progress: 82,
    grade: 'A',
    studyGroups: 1,
    nextAssignment: 'Lab Report 4',
    dueDate: 'Nov 18, 2024',
    color: 'accent'
  },
  {
    id: 4,
    code: 'HIST 120',
    name: 'World History',
    instructor: 'Prof. James Wilson',
    credits: 3,
    schedule: 'TTh 11:00 AM-12:30 PM',
    progress: 60,
    grade: 'B',
    studyGroups: 1,
    nextAssignment: 'Research Paper Draft',
    dueDate: 'Nov 20, 2024',
    color: 'primary'
  }
];

const availableCourses = [
  {
    id: 5,
    code: 'CS 201',
    name: 'Data Structures and Algorithms',
    instructor: 'Dr. Lisa Park',
    credits: 4,
    schedule: 'MWF 9:00-10:00 AM',
    prerequisites: ['CS 101'],
    enrolled: false,
    rating: 4.8,
    difficulty: 'Hard'
  },
  {
    id: 6,
    code: 'MATH 301',
    name: 'Linear Algebra',
    instructor: 'Prof. Robert Kim',
    credits: 3,
    schedule: 'TTh 10:00-11:30 AM',
    prerequisites: ['MATH 201'],
    enrolled: false,
    rating: 4.6,
    difficulty: 'Medium'
  }
];

export default function Courses() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'enrolled' | 'available'>('enrolled');

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-accent';
    if (progress >= 60) return 'bg-primary';
    return 'bg-secondary';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-accent';
      case 'Medium': return 'text-primary';
      case 'Hard': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'primary': return 'from-primary to-primary/80';
      case 'secondary': return 'from-secondary to-secondary/80';
      case 'accent': return 'from-accent to-accent/80';
      default: return 'from-primary to-primary/80';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-8">
      {/* Header */}
      <div className="bg-gradient-secondary px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="heading-hero mb-4">My Courses</h1>
              <p className="text-xl text-muted-foreground max-w-2xl">
                Track your academic progress, connect with study groups, and manage assignments across all your courses.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="btn-hero">
                <Plus className="w-5 h-5 mr-2" />
                Enroll in Course
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-4">
                <Calendar className="w-5 h-5 mr-2" />
                View Schedule
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="academic-card hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Credits
              </CardTitle>
              <GraduationCap className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {enrolledCourses.reduce((sum, course) => sum + course.credits, 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                This semester
              </p>
            </CardContent>
          </Card>

          <Card className="academic-card hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Grade
              </CardTitle>
              <Target className="w-4 h-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">A-</div>
              <p className="text-xs text-accent flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +0.2 from last semester
              </p>
            </CardContent>
          </Card>

          <Card className="academic-card hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Study Groups
              </CardTitle>
              <Users className="w-4 h-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {enrolledCourses.reduce((sum, course) => sum + course.studyGroups, 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Active groups joined
              </p>
            </CardContent>
          </Card>

          <Card className="academic-card hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Overall Progress
              </CardTitle>
              <BookOpen className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">73%</div>
              <Progress value={73} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Tabs and Search */}
        <Card className="academic-card mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex space-x-1 bg-muted p-1 rounded-lg">
                <Button
                  variant={activeTab === 'enrolled' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('enrolled')}
                  className={activeTab === 'enrolled' ? 'btn-academic' : ''}
                >
                  Enrolled Courses ({enrolledCourses.length})
                </Button>
                <Button
                  variant={activeTab === 'available' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('available')}
                  className={activeTab === 'available' ? 'btn-academic' : ''}
                >
                  Available Courses ({availableCourses.length})
                </Button>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Lists */}
        {activeTab === 'enrolled' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {enrolledCourses.map((course) => (
              <Card key={course.id} className="academic-card hover-lift">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`w-12 h-12 bg-gradient-to-br ${getColorClasses(course.color)} rounded-lg flex items-center justify-center`}>
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{course.code}</CardTitle>
                          <p className="text-sm text-muted-foreground">{course.name}</p>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>{course.instructor}</p>
                        <p>{course.schedule}</p>
                        <p>{course.credits} credits</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="font-semibold">
                      {course.grade}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Progress</span>
                      <span className="text-sm font-medium">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{course.studyGroups} groups</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>Due {course.dueDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-foreground mb-1">Next Assignment:</p>
                    <p className="text-sm text-muted-foreground">{course.nextAssignment}</p>
                  </div>

                  <div className="flex space-x-2">
                    <Link to={`/groups?course=${course.code}`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        <Users className="w-4 h-4 mr-2" />
                        Study Groups
                      </Button>
                    </Link>
                    <Button className="btn-accent flex-1" size="sm">
                      <BookOpen className="w-4 h-4 mr-2" />
                      View Course
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {availableCourses.map((course) => (
              <Card key={course.id} className="academic-card hover-lift">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-foreground" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{course.code}</CardTitle>
                          <p className="text-sm text-muted-foreground">{course.name}</p>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>{course.instructor}</p>
                        <p>{course.schedule}</p>
                        <p>{course.credits} credits</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{course.rating}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Difficulty:</span>
                    <span className={`text-sm font-medium ${getDifficultyColor(course.difficulty)}`}>
                      {course.difficulty}
                    </span>
                  </div>

                  {course.prerequisites.length > 0 && (
                    <div>
                      <span className="text-sm text-muted-foreground">Prerequisites:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {course.prerequisites.map((prereq) => (
                          <Badge key={prereq} variant="outline" className="text-xs">
                            {prereq}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2 pt-4 border-t border-border">
                    <Button variant="outline" className="flex-1" size="sm">
                      View Details
                    </Button>
                    <Button className="btn-academic flex-1" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Enroll
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {((activeTab === 'enrolled' && enrolledCourses.length === 0) || 
          (activeTab === 'available' && availableCourses.length === 0)) && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {activeTab === 'enrolled' ? 'No enrolled courses' : 'No available courses'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {activeTab === 'enrolled' 
                ? 'Start your academic journey by enrolling in courses.' 
                : 'Check back later for new course offerings.'}
            </p>
            {activeTab === 'enrolled' && (
              <Button className="btn-academic">
                <Plus className="w-4 h-4 mr-2" />
                Browse Available Courses
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}