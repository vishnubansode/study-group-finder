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
import { Group, GroupCreateRequest, GroupMember } from '@/types/group';

export default function Groups() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Pending (UI) filter inputs - update immediately as the user interacts
  const [pendingSearchQuery, setPendingSearchQuery] = useState('');
  const [pendingSelectedPrivacy, setPendingSelectedPrivacy] = useState<string>('ALL');
  // Course selector: predefined options (primary/secondary faculty codes)
  const [pendingSelectedCourse, setPendingSelectedCourse] = useState('All Courses');
  const [pendingActiveStatus, setPendingActiveStatus] = useState<'ANY' | 'TODAY' | 'WEEK' | 'MONTH' | 'OLDER'>('ANY');

  // Applied filters - used for actual filtering and fetching. These only update when "Apply Filters" is pressed.
  const [appliedSearchQuery, setAppliedSearchQuery] = useState('');
  const [appliedSelectedPrivacy, setAppliedSelectedPrivacy] = useState<string>('ALL');
  const [appliedSelectedCourse, setAppliedSelectedCourse] = useState('All Courses');
  const [appliedActiveStatus, setAppliedActiveStatus] = useState<'ANY' | 'TODAY' | 'WEEK' | 'MONTH' | 'OLDER'>('ANY');
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Join/Request functionality state
  const [joiningGroupId, setJoiningGroupId] = useState<number | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordForGroupId, setPasswordForGroupId] = useState<number | null>(null);
  const [joinPassword, setJoinPassword] = useState('');
  const [managingGroupId, setManagingGroupId] = useState<number | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  const [isAdminForManagingGroup, setIsAdminForManagingGroup] = useState(false);

  const handleMembersDialogOpenChange = (open: boolean) => {
    setIsMembersDialogOpen(open);
    if (!open) {
      setManagingGroupId(null);
      setIsAdminForManagingGroup(false);
      setGroupMembers([]);
    }
  };
  
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
    // initial load using the default applied filters
    if (user) {
      fetchGroups();
    }
  }, [user]);

  const fetchGroups = async (overrides?: { privacy?: string | undefined; name?: string | undefined }) => {
    if (!user) return;

    const token = tokenService.getToken();
    if (!token) {
      setError('Authentication token not found. Please sign in again.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      // allow caller to override applied filters when fetching to avoid waiting for setState
      const privacyParam = overrides?.privacy ?? (appliedSelectedPrivacy === 'ALL' ? undefined : appliedSelectedPrivacy);
      const nameParam = overrides?.name ?? (appliedSearchQuery || undefined);

      const response = await groupAPI.searchGroups(token, {
        privacy: privacyParam,
        name: nameParam,
        page: 0,
        size: 50,
        userId: user.id,
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

  // Build course options dynamically from group.courseName so dropdown reflects real data
  const courseOptions = useMemo(() => {
    const uniqueCourses = new Set<string>();
    groups.forEach((g) => {
      if (g.courseName) uniqueCourses.add(g.courseName);
    });
    return ['All Courses', ...Array.from(uniqueCourses).sort()];
  }, [groups]);

  const { myGroups, availableGroups } = useMemo(() => {
    const query = appliedSearchQuery.trim().toLowerCase();

    const filtered = groups.filter((group) => {
      const matchesSearch =
        query.length === 0 ||
        group.groupName.toLowerCase().includes(query) ||
        group.description.toLowerCase().includes(query);

      const matchesCourse =
        appliedSelectedCourse === 'All Courses' || (group.courseName || '') === appliedSelectedCourse;

      const matchesPrivacy =
        appliedSelectedPrivacy === 'ALL' || group.privacyType === appliedSelectedPrivacy;

      // Active status filter
      let matchesActive = true;
      if (appliedActiveStatus !== 'ANY') {
        const last = group.lastMemberJoinedAt ? new Date(group.lastMemberJoinedAt) : null;
        const now = new Date();
        if (!last) {
          matchesActive = appliedActiveStatus === 'OLDER';
        } else {
          const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
          if (appliedActiveStatus === 'TODAY') matchesActive = diffDays === 0;
          else if (appliedActiveStatus === 'WEEK') matchesActive = diffDays <= 7;
          else if (appliedActiveStatus === 'MONTH') matchesActive = diffDays <= 30;
          else if (appliedActiveStatus === 'OLDER') matchesActive = diffDays > 30;
        }
      }

      return matchesSearch && matchesCourse && matchesPrivacy && matchesActive;
    });

    const myGroups = filtered.filter(group => group.createdBy === user?.id);
    const availableGroups = filtered.filter(group => group.createdBy !== user?.id);

    return { myGroups, availableGroups };
  }, [groups, appliedSearchQuery, appliedSelectedCourse, appliedSelectedPrivacy, appliedActiveStatus, user?.id]);

  // Join/Request handlers
  const handleJoinGroup = async (group: Group) => {
    if (!user) {
      toast({ title: 'Authentication required', description: 'Please log in to join groups.' });
      return;
    }

    const token = tokenService.getToken();
    if (!token) {
      toast({ title: 'Authentication required', description: 'Please log in again.' });
      return;
    }

    try {
      // If private and has password, prompt for it instead of firing request immediately
      if (group.privacyType === 'PRIVATE' && group.hasPassword) {
        setPasswordForGroupId(group.groupId);
        setJoinPassword('');
        setPasswordDialogOpen(true);
        return;
      }

      setJoiningGroupId(group.groupId);
      await groupAPI.joinGroup(token, group.groupId, user.id);
      
      if (group.privacyType === 'PUBLIC') {
        toast({ 
          title: 'Joined group', 
          description: `You have successfully joined ${group.groupName}.` 
        });
      } else {
        toast({ 
          title: 'Request sent', 
          description: `Your request to join ${group.groupName} has been sent to the group owner.` 
        });
      }
      
      // Refresh groups to update UI
      await fetchGroups();
    } catch (error) {
      console.error('Failed to join/request group:', error);
      toast({ 
        title: 'Failed to join group', 
        description: error instanceof Error ? error.message : 'Please try again.' 
      });
    } finally {
      setJoiningGroupId(null);
    }
  };

  const submitPasswordJoin = async () => {
    if (!user || !passwordForGroupId) return;
    const token = tokenService.getToken();
    if (!token) return;

    try {
      setJoiningGroupId(passwordForGroupId);
      setPasswordDialogOpen(false);
      await groupAPI.joinGroup(token, passwordForGroupId, user.id, joinPassword);
      toast({ title: 'Join processed', description: 'Your join request was processed.' });
      await fetchGroups();
    } catch (error) {
      console.error('Failed to join with password:', error);
      toast({ title: 'Failed to join group', description: error instanceof Error ? error.message : 'Please try again.' });
    } finally {
      setJoiningGroupId(null);
      setPasswordForGroupId(null);
      setJoinPassword('');
    }
  };

  const handleManageGroup = async (group: Group) => {
    if (!user) return;

    const token = tokenService.getToken();
    if (!token) {
      toast({ title: 'Authentication required', description: 'Please log in again.' });
      return;
    }

    try {
      setManagingGroupId(group.groupId);
      setIsLoadingMembers(true);
      
      const members = await groupAPI.getGroupMembers(token, group.groupId);
      setGroupMembers(members);
      // Determine if current user is an admin for this group
      const admin = members.some((m) => m.userId === user.id && m.role === 'ADMIN');
      setIsAdminForManagingGroup(admin);
      setIsMembersDialogOpen(true);
    } catch (error) {
      console.error('Failed to load group members:', error);
      toast({ 
        title: 'Failed to load members', 
        description: 'Unable to load group members. Please try again.' 
      });
      setManagingGroupId(null);
      setIsAdminForManagingGroup(false);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const handleApproveMember = async (memberId: number, userId: number) => {
    if (!user || !managingGroupId) return;
    if (!isAdminForManagingGroup) {
      toast({ title: 'Not allowed', description: 'Only group admins can approve members.' });
      return;
    }

    const token = tokenService.getToken();
    if (!token) return;

    try {
      await groupAPI.approveMember(token, managingGroupId, user.id, userId);
      toast({ title: 'Member approved', description: 'The member has been approved to join the group.' });
      
      // Refresh members list
      const updatedMembers = await groupAPI.getGroupMembers(token, managingGroupId);
      setGroupMembers(updatedMembers);
    } catch (error) {
      console.error('Failed to approve member:', error);
      toast({ 
        title: 'Failed to approve member', 
        description: error instanceof Error ? error.message : 'Please try again.' 
      });
    }
  };

  const handleRemoveMember = async (memberId: number, userId: number) => {
    if (!user || !managingGroupId) return;
    if (!isAdminForManagingGroup) {
      toast({ title: 'Not allowed', description: 'Only group admins can remove members.' });
      return;
    }

    const token = tokenService.getToken();
    if (!token) return;

    try {
      await groupAPI.removeMember(token, managingGroupId, user.id, userId);
      toast({ title: 'Member removed', description: 'The member has been removed from the group.' });
      
      // Refresh members list
      const updatedMembers = await groupAPI.getGroupMembers(token, managingGroupId);
      setGroupMembers(updatedMembers);
    } catch (error) {
      console.error('Failed to remove member:', error);
      toast({ 
        title: 'Failed to remove member', 
        description: error instanceof Error ? error.message : 'Please try again.' 
      });
    }
  };

  const handleDeleteGroup = async (groupId: number) => {
    if (!user) return;

    const token = tokenService.getToken();
    if (!token) {
      toast({ title: 'Error', description: 'Authentication required' });
      return;
    }

    // Confirm deletion
    if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }

    try {
      await groupAPI.deleteGroup(token, groupId, user.id);
      toast({ title: 'Success', description: 'Group deleted successfully' });
      
      // Close dialog and refresh groups
      setIsMembersDialogOpen(false);
      setManagingGroupId(null);
      await fetchGroups();
    } catch (error: any) {
      console.error('Failed to delete group:', error);
      toast({ title: 'Error', description: error.message || 'Failed to delete group' });
    }
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
                    courseId: values.courseId ?? undefined,
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
                    value={pendingSearchQuery}
                    onChange={(e) => setPendingSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={pendingSelectedCourse}
                  onChange={(e) => setPendingSelectedCourse(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                >
                  {courseOptions.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
                <select
                  value={pendingSelectedPrivacy}
                  onChange={(e) => setPendingSelectedPrivacy(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                >
                  <option value="ALL">All Groups</option>
                  <option value="PUBLIC">Public</option>
                  <option value="PRIVATE">Private</option>
                </select>
                <select
                  value={pendingActiveStatus}
                  onChange={(e) => setPendingActiveStatus(e.target.value as any)}
                  className="px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                >
                  <option value="ANY">Any Activity</option>
                  <option value="TODAY">Active Today</option>
                  <option value="WEEK">Active This Week</option>
                  <option value="MONTH">Active This Month</option>
                  <option value="OLDER">Older</option>
                </select>

                <Button
                  variant="default"
                  onClick={async () => {
                    // Apply the pending UI filters to the applied filters and fetch
                    setAppliedSearchQuery(pendingSearchQuery);
                    setAppliedSelectedCourse(pendingSelectedCourse);
                    setAppliedSelectedPrivacy(pendingSelectedPrivacy);
                    setAppliedActiveStatus(pendingActiveStatus);

                    // Call fetchGroups with overrides so we don't wait for state to flush
                    await fetchGroups({ privacy: pendingSelectedPrivacy === 'ALL' ? undefined : pendingSelectedPrivacy, name: pendingSearchQuery || undefined });
                  }}
                  className="px-4 py-2"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {myGroups.length + availableGroups.length} of {groups.length} study groups
            {myGroups.length > 0 && (
              <span className="ml-2">({myGroups.length} created by you)</span>
            )}
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
        ) : myGroups.length > 0 || availableGroups.length > 0 ? (
          <div className="space-y-8 pb-24 lg:pb-8">
            {/* My Groups Section */}
            {myGroups.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-xl font-semibold text-foreground">My Groups</h2>
                  <Badge variant="secondary">{myGroups.length}</Badge>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {myGroups.map((group) => (
                    <Card key={group.groupId} className="academic-card hover-lift border-primary/20">
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
                              <Badge variant="outline" className="text-xs">Owner</Badge>
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
                            {group.createdAt && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(group.createdAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>

                          <Button 
                            size="sm" 
                            variant="default" 
                            onClick={() => handleManageGroup(group)}
                            disabled={isLoadingMembers && managingGroupId === group.groupId}
                          >
                            {isLoadingMembers && managingGroupId === group.groupId ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              'Manage'
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Available Groups Section */}
            {availableGroups.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-xl font-semibold text-foreground">Available Groups</h2>
                  <Badge variant="secondary">{availableGroups.length}</Badge>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {availableGroups.map((group) => {
                    const membershipStatus = group.membershipStatus ?? 'NOT_MEMBER';
                    const isJoined = membershipStatus === 'APPROVED';
                    const isPending = membershipStatus === 'PENDING';
                    const isRequesting = joiningGroupId === group.groupId;
                    const isPrivate = group.privacyType === 'PRIVATE';

                    const buttonDisabled = isRequesting || isJoined || isPending;

                    let buttonContent = <></>;
                    if (isRequesting) {
                      buttonContent = <Loader2 className="w-4 h-4 animate-spin" />;
                    } else if (isJoined) {
                      buttonContent = (
                        <>
                          <UserCheck className="w-4 h-4 mr-1" />
                          Joined
                        </>
                      );
                    } else if (isPending) {
                      buttonContent = (
                        <>
                          <UserPlus className="w-4 h-4 mr-1" />
                          Requested
                        </>
                      );
                    } else if (isPrivate) {
                      buttonContent = (
                        <>
                          <UserPlus className="w-4 h-4 mr-1" />
                          Request
                        </>
                      );
                    } else {
                      buttonContent = (
                        <>
                          <UserCheck className="w-4 h-4 mr-1" />
                          Join
                        </>
                      );
                    }

                    return (
                      <Card key={group.groupId} className="academic-card hover-lift">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <CardTitle className="text-lg">{group.groupName}</CardTitle>
                                {isPrivate ? (
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
                              <Badge variant={isPrivate ? 'secondary' : 'default'}>
                                {group.privacyType}
                              </Badge>
                              {group.createdAt && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(group.createdAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>

                            <Button
                              size="sm"
                              variant={isPrivate ? 'outline' : 'default'}
                              onClick={() => handleJoinGroup(group)}
                              disabled={buttonDisabled}
                            >
                              {buttonContent}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
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

      {/* Members Management Dialog */}
  <Dialog open={isMembersDialogOpen} onOpenChange={handleMembersDialogOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Group Members</DialogTitle>
            <DialogDescription>
              View and manage members of your group. Approve pending requests or remove existing members.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {groupMembers.length > 0 ? (
              <div className="space-y-3">
                {groupMembers
                  .sort((a, b) => {
                    // Sort by status (pending first) then by role (admin first)
                    if (a.status !== b.status) {
                      return a.status === 'PENDING' ? -1 : 1;
                    }
                    if (a.role !== b.role) {
                      return a.role === 'ADMIN' ? -1 : 1;
                    }
                    return 0;
                  })
                  .map((member) => (
                    <div key={member.groupMemberId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{member.userName || `User ${member.userId}`}</p>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Badge variant={member.role === 'ADMIN' ? 'default' : 'secondary'} className="text-xs">
                              {member.role}
                            </Badge>
                            <Badge 
                              variant={member.status === 'APPROVED' ? 'default' : 'destructive'} 
                              className="text-xs"
                            >
                              {member.status}
                            </Badge>
                            {member.joinedAt && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(member.joinedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {isAdminForManagingGroup ? (
                        <div className="flex items-center space-x-2">
                          {member.status === 'PENDING' && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleApproveMember(member.groupMemberId, member.userId)}
                            >
                              <UserCheck className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                          )}
                          {member.role !== 'ADMIN' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRemoveMember(member.groupMemberId, member.userId)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">Only group admins can manage members</div>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No members found</p>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between">
            {isAdminForManagingGroup ? (
              <Button 
                variant="destructive" 
                onClick={() => managingGroupId && handleDeleteGroup(managingGroupId)}
                className="mr-auto"
              >
                <AlertCircle className="w-4 h-4 mr-1" />
                Delete Group
              </Button>
            ) : (
              <div className="text-sm text-muted-foreground mr-auto">Only group admins can delete this group</div>
            )}
            <Button variant="outline" onClick={() => { setIsMembersDialogOpen(false); setIsAdminForManagingGroup(false); }}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Join with password dialog for private groups */}
      <Dialog open={passwordDialogOpen} onOpenChange={(open) => { setPasswordDialogOpen(open); if (!open) { setPasswordForGroupId(null); setJoinPassword(''); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Group Password</DialogTitle>
            <DialogDescription>
              This group requires a password. Enter the password to join immediately, or your request will be sent for approval.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Label>Group Password</Label>
            <Input type="password" value={joinPassword} onChange={(e) => setJoinPassword(e.target.value)} />
          </div>

          <DialogFooter className="flex justify-end">
            <Button variant="outline" onClick={() => { setPasswordDialogOpen(false); setPasswordForGroupId(null); setJoinPassword(''); }}>Cancel</Button>
            <Button className="ml-2" onClick={() => submitPasswordJoin()}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}