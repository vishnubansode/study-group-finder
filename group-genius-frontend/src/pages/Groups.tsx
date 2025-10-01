import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Search,
  Filter,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Globe,
  Lock,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { groupAPI, tokenService } from '@/services/api';

interface Group {
  id: number;
  name: string;
  course: string;
  description: string;
  members: number;
  maxMembers: number;
  privacy: 'public' | 'private';
  activity: string;
  lastActivity: string;
  tags: string[];
}

export default function Groups() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('All Courses');
  const [selectedActivity, setSelectedActivity] = useState('All Activity');
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      if (!user) {
        setGroups([]);
        return;
      }

      const token = tokenService.getToken();
      if (!token) {
        setError('Authentication token not found. Please sign in again.');
        setGroups([]);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await groupAPI.getAllGroups(token);
        setGroups(response || []);
      } catch (err) {
        console.error('Failed to load study groups:', err);
        setError(err instanceof Error ? err.message : 'Unable to load study groups.');
        setGroups([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, [user]);

  const courseOptions = useMemo(() => {
    const uniqueCourses = new Set<string>();
    groups.forEach((group) => {
      if (group.course) {
        uniqueCourses.add(group.course);
      }
    });
    return ['All Courses', ...Array.from(uniqueCourses).sort()];
  }, [groups]);

  const activityOptions = useMemo(() => {
    const uniqueActivities = new Set<string>();
    groups.forEach((group) => {
      if (group.activity) {
        uniqueActivities.add(group.activity);
      }
    });
    return ['All Activity', ...Array.from(uniqueActivities).sort()];
  }, [groups]);

  const filteredGroups = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return groups.filter((group) => {
      const matchesSearch =
        query.length === 0 ||
        group.name.toLowerCase().includes(query) ||
        group.description.toLowerCase().includes(query) ||
        group.tags?.some((tag) => tag.toLowerCase().includes(query));

      const matchesCourse =
        selectedCourse === 'All Courses' || group.course === selectedCourse;

      const matchesActivity =
        selectedActivity === 'All Activity' || group.activity === selectedActivity;

      return matchesSearch && matchesCourse && matchesActivity;
    });
  }, [groups, searchQuery, selectedCourse, selectedActivity]);

  const getActivityColor = (activity: string) => {
    const normalized = activity.toLowerCase();
    if (normalized.includes('very')) return 'text-accent';
    if (normalized.includes('high') || normalized.includes('active')) return 'text-primary';
    if (normalized.includes('moderate')) return 'text-secondary';
    return 'text-muted-foreground';
  };

  return (
    <div className="min-h-screen bg-background">
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
              <Button className="btn-hero" disabled>
                <Plus className="w-5 h-5 mr-2" />
                Create Group
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-4" disabled>
                <CalendarIcon className="w-5 h-5 mr-2" />
                Scheduler
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <Card className="academic-card mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
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
                  {courseOptions.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedActivity}
                  onChange={(e) => setSelectedActivity(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                >
                  {activityOptions.map((activity) => (
                    <option key={activity} value={activity}>
                      {activity}
                    </option>
                  ))}
                </select>
                <Button variant="outline" disabled>
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredGroups.length} of {groups.length} study groups
          </p>
        </div>

        {error && (
          <Card className="academic-card border-destructive/50 mb-8">
            <CardContent className="p-6 flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-destructive mt-1" />
              <div>
                <h3 className="text-sm font-semibold text-destructive">Unable to load study groups</h3>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : filteredGroups.length > 0 ? (
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
                      {group.activity && (
                        <div className="flex items-center space-x-2 mb-3">
                          <span className={`text-sm font-medium ${getActivityColor(group.activity)}`}>
                            {group.activity}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {group.description || 'This study group has no description yet.'}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {group.tags?.length ? (
                      group.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">No tags provided</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>
                          {group.members}
                          {group.maxMembers ? ` / ${group.maxMembers}` : ''}
                        </span>
                      </div>
                      {group.lastActivity && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{group.lastActivity}</span>
                        </div>
                      )}
                    </div>

                    <Button size="sm" variant="outline" disabled>
                      Coming soon
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No study groups available yet</h3>
            <p className="text-muted-foreground mb-6">
              Once groups are created, they will appear here. You can also reach out to your classmates to start one together.
            </p>
            <Button className="btn-academic" disabled>
              <Plus className="w-4 h-4 mr-2" />
              Create New Group
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}