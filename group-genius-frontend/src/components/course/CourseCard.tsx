import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Clock, 
  User,
  Plus,
  Check,
  X,
  Eye,
  UserPlus,
  Trash2
} from 'lucide-react';
import { Course } from '@/types/course';
import { useState } from 'react';

interface CourseCardProps {
  course: Course;
  variant?: 'catalog' | 'enrolled';
  onEnroll?: (courseId: number) => void;
  onDrop?: (courseId: number) => void;
  onViewDetails?: (courseId: number) => void;
  onViewPeers?: (courseId: number) => void;
  isEnrolling?: boolean;
  isDropping?: boolean;
  showProgress?: boolean;
  progress?: number;
  grade?: string;
  nextAssignment?: string;
  dueDate?: string;
  studyGroupsCount?: number;
}

export function CourseCard({
  course,
  variant = 'catalog',
  onEnroll,
  onDrop,
  onViewDetails,
  onViewPeers,
  isEnrolling = false,
  isDropping = false,
  showProgress = false,
  progress = 0,
  grade,
  nextAssignment,
  dueDate,
  studyGroupsCount = 0,
}: CourseCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  const enrollmentPercentage = Math.round((course.currentEnrollment / course.courseCapacity) * 100);
  const isFullyEnrolled = course.currentEnrollment >= course.courseCapacity;
  
  const getEnrollmentStatus = () => {
    if (isFullyEnrolled) return { color: 'destructive', text: 'Full' };
    if (enrollmentPercentage >= 90) return { color: 'secondary', text: 'Almost Full' };
    if (enrollmentPercentage >= 70) return { color: 'default', text: 'Filling Up' };
    return { color: 'outline', text: 'Available' };
  };

  const status = getEnrollmentStatus();

  return (
    <Card className="hover:shadow-lg transition-all duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs font-mono">
                  {course.courseCode}
                </Badge>
                {variant === 'catalog' && (
                  <Badge variant={status.color as any} className="text-xs">
                    {status.text}
                  </Badge>
                )}
                {variant === 'enrolled' && grade && (
                  <Badge variant="default" className="text-xs font-semibold">
                    {grade}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg leading-tight mb-1">
                {course.courseName}
              </CardTitle>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{course.instructorName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{course.classSchedule}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{course.creditHours} credits</span>
                </div>
              </div>
            </div>
          </div>
          
          {variant === 'enrolled' && onDrop && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onDrop(course.id)}
              disabled={isDropping}
            >
              {isDropping ? (
                <div className="w-4 h-4 border-2 border-destructive/30 border-t-destructive rounded-full animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>

        {course.description && showDetails && (
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            {course.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar for Enrolled Courses */}
        {variant === 'enrolled' && showProgress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-secondary/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Next Assignment for Enrolled Courses */}
        {variant === 'enrolled' && nextAssignment && (
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Next Assignment:</p>
                <p className="text-sm text-muted-foreground">{nextAssignment}</p>
              </div>
              {dueDate && (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Due</p>
                  <p className="text-sm font-medium">{dueDate}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enrollment Info for Catalog Courses */}
        {variant === 'catalog' && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {course.currentEnrollment}/{course.courseCapacity} enrolled
              </span>
            </div>
            <span className="text-sm font-medium">{enrollmentPercentage}% full</span>
          </div>
        )}

        {/* Study Groups Info for Enrolled Courses */}
        {variant === 'enrolled' && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{studyGroupsCount} study groups</span>
            </div>
            {dueDate && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Due {dueDate}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t border-border/50">
          {variant === 'catalog' ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setShowDetails(!showDetails)}
              >
                <Eye className="w-4 h-4 mr-2" />
                {showDetails ? 'Hide' : 'Details'}
              </Button>
              {onEnroll && (
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => onEnroll(course.id)}
                  disabled={isEnrolling || isFullyEnrolled || course.isEnrolled}
                >
                  {isEnrolling ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  ) : course.isEnrolled ? (
                    <Check className="w-4 h-4 mr-2" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  {course.isEnrolled ? 'Enrolled' : isEnrolling ? 'Enrolling...' : 'Enroll'}
                </Button>
              )}
            </>
          ) : (
            <>
              {onViewPeers && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onViewPeers(course.id)}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  View Peers
                </Button>
              )}
              {onViewDetails && (
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => onViewDetails(course.id)}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Course Details
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}