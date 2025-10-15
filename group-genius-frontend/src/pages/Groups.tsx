import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  Search,
  Plus,
  Globe,
  Lock,
  AlertCircle,
  Loader2,
  UserPlus,
  UserCheck,
  Calendar as CalendarIcon,
  Clock,
  Filter,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { tokenService } from '@/services/api';
import { groupAPI } from '@/lib/api/groupApi';
import GroupCreateDialog, { GroupCreateValues } from '@/components/group/GroupCreateDialog';
import { Group, GroupCreateRequest } from '@/types/group';

export default function Groups() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrivacy, setSelectedPrivacy] = useState<string>('ALL');
  const [selectedCourse, setSelectedCourse] = useState('All Courses');
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Create group dialog
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newGroupPrivacy, setNewGroupPrivacy] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
  const [isCreating, setIsCreating] = useState(false);

  // Members dialog - removed unused states for now since backend doesn't have member list endpoint ready
  // const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  // const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  // const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  // const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  useEffect(() => {
    if (user) {
      fetchGroups();
    }
  }, [user]);

  const fetchGroups = async () => {
    if (!user) return;

    const token = tokenService.getToken();
    if (!token) {
      setError('Authentication token not found. Please sign in again.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await groupAPI.searchGroups(token, {
        privacy: selectedPrivacy === 'ALL' ? undefined : selectedPrivacy,
        name: searchQuery || undefined,
        page: 0,
        size: 50,
      });
      
      // Handle paginated response
      const groupsData = response.content || response;
      setGroups(Array.isArray(groupsData) ? groupsData : []);
    } catch (err) {
      console.error('Failed to load study groups:', err);
      setError(err instanceof Error ? err.message : 'Unable to load study groups.');
      setGroups([]);
    } finally {
      setIsLoading(false);
    }
  };

  const courseOptions = useMemo(() => {
    const uniqueCourses = new Set<string>();
    groups.forEach((group) => {
      if (group.courseName) {
        uniqueCourses.add(group.courseName);
      }
    });
    return ['All Courses', ...Array.from(uniqueCourses).sort()];
  }, [groups]);

  const filteredGroups = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return groups.filter((group) => {
      const matchesSearch =
        query.length === 0 ||
        group.groupName.toLowerCase().includes(query) ||
        group.description.toLowerCase().includes(query);

      const matchesCourse =
        selectedCourse === 'All Courses' || group.courseName === selectedCourse;

      const matchesPrivacy =
        selectedPrivacy === 'ALL' || group.privacyType === selectedPrivacy;

      return matchesSearch && matchesCourse && matchesPrivacy;
    });
  }, [groups, searchQuery, selectedCourse, selectedPrivacy]);

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
              <GroupCreateDialog onCreate={async (values: GroupCreateValues) => {
                if (!user) return;
                const token = tokenService.getToken();
                if (!token) {
                  setError('Authentication required to create a group');
                  return;
                }

                try {
                  setIsCreating(true);
                  // course mapping: GroupCreateDialog returns course name; backend expects courseId. For now send no courseId.
                  const groupData = {
                    name: values.name,
                    description: values.description,
                    courseId: undefined,
                    createdBy: user.id,
                    privacy: values.privacy.toUpperCase(),
                  };

                  await groupAPI.createGroup(token, groupData as any);
                  toast({ title: 'Group created', description: 'Your group was created successfully.' });
                  await fetchGroups();
                } catch (err: any) {
                  console.error('Create group failed', err);
                  toast({ title: 'Create failed', description: err?.message || String(err) });
                } finally {
                  setIsCreating(false);
                }
              }} />
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
                  value={selectedPrivacy}
                  onChange={(e) => setSelectedPrivacy(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                >
                  <option value="ALL">All Groups</option>
                  <option value="PUBLIC">Public</option>
                  <option value="PRIVATE">Private</option>
                </select>
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
              <Card key={group.groupId} className="academic-card hover-lift">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <CardTitle className="text-lg">{group.groupName}</CardTitle>
                        {group.privacyType === 'PRIVATE' ? (
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Globe className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      {group.courseName && (
                        <p className="text-sm text-muted-foreground mb-2">{group.courseName}</p>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {group.description || 'This study group has no description yet.'}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <Badge variant={group.privacyType === 'PUBLIC' ? 'default' : 'secondary'}>
                        {group.privacyType}
                      </Badge>
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