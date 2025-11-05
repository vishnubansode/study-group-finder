// components/course/CourseCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  BookOpen, 
  Users, 
  UserPlus,
  Plus,
  Check,
  X
} from 'lucide-react';
import { Course } from '@/types/course';
import { useState } from 'react';

interface CourseCardProps {
  course: Course;
  variant?: 'catalog' | 'enrolled';
  onEnroll?: (courseId: number) => void;
  onDrop?: (course: Course) => void; // Changed from courseId to Course object
  onViewPeers?: (courseId: number) => void;
  isEnrolling?: boolean;
  isDropping?: boolean;
}

export function CourseCard({
  course,
  variant = 'catalog',
  onEnroll,
  onDrop,
  onViewPeers,
  isEnrolling = false,
  isDropping = false,
}: CourseCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <Card className="hover:shadow-lg transition-all duration-200 group h-full flex flex-col border-0 bg-white">
      <CardHeader className="pb-3 min-h-[104px]">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs font-mono">
                  {course.courseCode}
                </Badge>
                {variant === 'enrolled' && (
                  <Badge variant="default" className="text-xs">
                    Enrolled
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg sm:text-xl font-bold leading-tight mb-1 line-clamp-2">
                {course.courseName}
              </CardTitle>
            </div>
          </div>
          
          {variant === 'enrolled' && onDrop && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onDrop(course)} // Pass the course object
              disabled={isDropping}
            >
              {isDropping ? (
                <div className="w-4 h-4 border-2 border-red-400 border-t-red-600 rounded-full animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>

        {course.description && showDetails && (
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
            {course.description}
          </p>
        )}
      </CardHeader>

  <CardContent className="space-y-4 mt-auto">
        {/* Action Buttons - stack on mobile, inline on larger screens */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-200">
          {variant === 'catalog' ? (
            <>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:flex-1"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? 'Hide Details' : 'Show Details'}
              </Button>
              {onEnroll && (
                <Button
                  size="lg"
                  className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => onEnroll(course.id)}
                  disabled={isEnrolling || course.isEnrolled}
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
                  size="lg"
                  className="w-full sm:flex-1"
                  onClick={() => onViewPeers(course.id)}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  View Peers
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}