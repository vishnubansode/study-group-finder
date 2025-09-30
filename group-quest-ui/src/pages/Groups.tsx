import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Search, 
  Filter,
  Plus,
  MessageCircle,
  Calendar,
  Clock,
  Globe,
  Lock,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';

const allGroups = [
  {
    id: 1,
    name: 'CS 101 Study Group',
    course: 'Computer Science',
    description: 'Collaborative learning for intro to computer science. We meet twice weekly and help each other with assignments.',
    members: 12,
    maxMembers: 15,
    privacy: 'public',
    activity: 'Very Active',
    lastActivity: '5 minutes ago',
    tags: ['Programming', 'Algorithms', 'Java'],
    rating: 4.8
  },
  {
    id: 2,
    name: 'Advanced Calculus Masters',
    course: 'Mathematics',
    description: 'For students tackling advanced calculus concepts. We work through problem sets and prepare for exams together.',
    members: 8,
    maxMembers: 10,
    privacy: 'private',
    activity: 'Active',
    lastActivity: '2 hours ago',
    tags: ['Calculus', 'Problem Solving', 'Exams'],
    rating: 4.9
  },
  {
    id: 3,
    name: 'Physics Lab Partners',
    course: 'Physics',
    description: 'Connect with lab partners and discuss physics experiments. Share data, insights, and study for lab practicals.',
    members: 15,
    maxMembers: 20,
    privacy: 'public',
    activity: 'Moderate',
    lastActivity: '1 day ago',
    tags: ['Lab Work', 'Experiments', 'Data Analysis'],
    rating: 4.6
  },
  {
    id: 4,
    name: 'History Research Circle',
    course: 'History',
    description: 'Research-focused group for history majors. We collaborate on projects and share primary source findings.',
    members: 6,
    maxMembers: 12,
    privacy: 'public',
    activity: 'Active',
    lastActivity: '6 hours ago',
    tags: ['Research', 'Primary Sources', 'Projects'],
    rating: 4.7
  },
  {
    id: 5,
    name: 'Spanish Conversation Club',
    course: 'Languages',
    description: 'Practice Spanish conversation in a friendly, supportive environment. All levels welcome!',
    members: 20,
    maxMembers: 25,
    privacy: 'public',
    activity: 'Very Active',
    lastActivity: '30 minutes ago',
    tags: ['Conversation', 'Practice', 'All Levels'],
    rating: 4.8
  },
  {
    id: 6,
    name: 'Organic Chemistry Help',
    course: 'Chemistry',
    description: 'Struggling with organic chemistry? Join us for group study sessions and mechanism practice.',
    members: 10,
    maxMembers: 15,
    privacy: 'public',
    activity: 'Active',
    lastActivity: '4 hours ago',
    tags: ['Organic Chemistry', 'Mechanisms', 'Study Sessions'],
    rating: 4.5
  }
];

const courses = ['All Courses', 'Computer Science', 'Mathematics', 'Physics', 'History', 'Languages', 'Chemistry'];
const activityLevels = ['All Activity', 'Very Active', 'Active', 'Moderate'];

export default function Groups() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('All Courses');
  const [selectedActivity, setSelectedActivity] = useState('All Activity');

  const filteredGroups = allGroups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCourse = selectedCourse === 'All Courses' || group.course === selectedCourse;
    const matchesActivity = selectedActivity === 'All Activity' || group.activity === selectedActivity;
    
    return matchesSearch && matchesCourse && matchesActivity;
  });

  const getActivityColor = (activity: string) => {
    switch (activity) {
      case 'Very Active': return 'text-accent';
      case 'Active': return 'text-primary';
      case 'Moderate': return 'text-secondary';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-secondary px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="heading-hero mb-4">Study Groups</h1>
              <p className="text-xl text-muted-foreground max-w-2xl">
                Discover and join study groups that match your academic interests. Collaborate, learn, and succeed together.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="btn-hero">
                <Plus className="w-5 h-5 mr-2" />
                Create Group
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-4">
                <Users className="w-5 h-5 mr-2" />
                My Groups
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Card className="academic-card mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search groups, courses, or topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                >
                  {courses.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
                <select
                  value={selectedActivity}
                  onChange={(e) => setSelectedActivity(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                >
                  {activityLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredGroups.length} of {allGroups.length} study groups
          </p>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-24 lg:pb-8">
          {filteredGroups.map((group) => (
            <Card key={group.id} className="academic-card hover-lift">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      {group.privacy === 'private' ? (
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Globe className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{group.course}</p>
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{group.rating}</span>
                      </div>
                      <span className="text-muted-foreground">•</span>
                      <span className={`text-sm font-medium ${getActivityColor(group.activity)}`}>
                        {group.activity}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {group.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {group.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{group.members}/{group.maxMembers}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{group.lastActivity}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button size="sm" className="btn-accent">
                      Join Group
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredGroups.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No groups found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search criteria or create a new study group.
            </p>
            <Button className="btn-academic">
              <Plus className="w-4 h-4 mr-2" />
              Create New Group
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}