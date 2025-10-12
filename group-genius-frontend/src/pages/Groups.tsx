import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
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
import GroupFilters from '@/components/group/GroupFilters';
import GroupList from '@/components/group/GroupList';
import GroupCreateDialog from '@/components/group/GroupCreateDialog';

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
  const [selectedPrivacy, setSelectedPrivacy] = useState<'All' | 'public' | 'private'>('All');
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

      const matchesPrivacy =
        selectedPrivacy === 'All' || group.privacy === selectedPrivacy;

      return matchesSearch && matchesCourse && matchesPrivacy;
    });
  }, [groups, searchQuery, selectedCourse, selectedPrivacy]);

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
              <GroupCreateDialog />
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
            <GroupFilters
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              courseOptions={courseOptions}
              selectedCourse={selectedCourse}
              onCourseChange={setSelectedCourse}
              selectedPrivacy={selectedPrivacy}
              onPrivacyChange={setSelectedPrivacy}
            />
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
          <GroupList groups={filteredGroups} />
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