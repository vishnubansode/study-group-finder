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
  Eye,
  EyeOff,
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
  const [pendingSelectedSize, setPendingSelectedSize] = useState<string>('ALL');
  const [pendingActiveStatus, setPendingActiveStatus] = useState<'ANY' | 'TODAY' | 'WEEK' | 'MONTH' | 'OLDER'>('ANY');

  // New filter controls: member count and date filters
  const [pendingMemberFilterType, setPendingMemberFilterType] = useState<string>('ANY'); // ANY | BELOW | ABOVE | BETWEEN
  const [pendingMemberValue1, setPendingMemberValue1] = useState<string>('');
  const [pendingMemberValue2, setPendingMemberValue2] = useState<string>('');

  const [pendingDateFilterType, setPendingDateFilterType] = useState<string>('ANY'); // ANY | BEFORE | AFTER | BETWEEN
  const [pendingDateValue1, setPendingDateValue1] = useState<string>('');
  const [pendingDateValue2, setPendingDateValue2] = useState<string>('');

  // Applied filters - used for actual filtering and fetching. These only update when "Apply Filters" is pressed.
  const [appliedSearchQuery, setAppliedSearchQuery] = useState('');
  const [appliedSelectedPrivacy, setAppliedSelectedPrivacy] = useState<string>('ALL');
  const [appliedSelectedCourse, setAppliedSelectedCourse] = useState('All Courses');
  const [appliedActiveStatus, setAppliedActiveStatus] = useState<'ANY' | 'TODAY' | 'WEEK' | 'MONTH' | 'OLDER'>('ANY');
  const [appliedSelectedSize, setAppliedSelectedSize] = useState<string>('ALL');
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Join/Request functionality state
  const [joiningGroupId, setJoiningGroupId] = useState<number | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordForGroupId, setPasswordForGroupId] = useState<number | null>(null);
  const [joinPassword, setJoinPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [passwordStatusMessage, setPasswordStatusMessage] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [joinChoiceDialogOpen, setJoinChoiceDialogOpen] = useState(false);
  const [joinChoiceGroupId, setJoinChoiceGroupId] = useState<number | null>(null);
  const [managingGroupId, setManagingGroupId] = useState<number | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  const [isAdminForManagingGroup, setIsAdminForManagingGroup] = useState(false);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [leaveTargetGroupId, setLeaveTargetGroupId] = useState<number | null>(null);
  const [leaveTargetGroupName, setLeaveTargetGroupName] = useState<string | null>(null);

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

  const fetchGroups = async (overrides?: { privacy?: string | undefined; name?: string | undefined; size?: string | undefined; minMembers?: number; maxMembers?: number; dateBefore?: string; dateAfter?: string }) => {
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
      let groupsData = response.content || response;
      groupsData = Array.isArray(groupsData) ? groupsData : [];

      // Fetch member counts for these groups and attach memberCount
      const countsMap = new Map<number, number>();
      const countPromises = groupsData.map((g: any) =>
        groupAPI.getGroupMembers(token, g.groupId).then((members) => {
          const c = Array.isArray(members) ? members.length : 0;
          countsMap.set(g.groupId, c);
          g.memberCount = c;
        }).catch(() => {
          countsMap.set(g.groupId, 0);
          g.memberCount = 0;
        })
      );
      await Promise.all(countPromises);

      // Member count filter: use overrides.minMembers / maxMembers when provided
      const minMembers = overrides?.minMembers;
      const maxMembers = overrides?.maxMembers;
      if (minMembers !== undefined || maxMembers !== undefined) {
        groupsData = groupsData.filter((g: any) => {
          const c = countsMap.get(g.groupId) ?? 0;
          if (minMembers !== undefined && c < minMembers) return false;
          if (maxMembers !== undefined && c > maxMembers) return false;
          return true;
        });
      } else {
        // Backwards-compatible size shortcut (old preset ranges)
        const sizeFilter = overrides?.size ?? appliedSelectedSize;
        if (sizeFilter && sizeFilter !== 'ALL') {
          const matchesSize = (count: number) => {
            if (sizeFilter === '1-5') return count >= 1 && count <= 5;
            if (sizeFilter === '6-10') return count >= 6 && count <= 10;
            if (sizeFilter === '11-20') return count >= 11 && count <= 20;
            if (sizeFilter === '21+') return count >= 21;
            return true;
          };

          groupsData = groupsData.filter((g: any) => matchesSize(countsMap.get(g.groupId) ?? 0));
        }
      }

      // Date filters: dateBefore / dateAfter operate on group's lastMemberJoinedAt or createdAt
      const dateBefore = overrides?.dateBefore ? new Date(overrides.dateBefore) : undefined;
      const dateAfter = overrides?.dateAfter ? new Date(overrides.dateAfter) : undefined;
      if (dateBefore || dateAfter) {
        groupsData = groupsData.filter((g: any) => {
          const last = (g as any).lastMemberJoinedAt
            ? new Date((g as any).lastMemberJoinedAt)
            : g.createdAt
            ? new Date(g.createdAt)
            : null;
          if (!last) return false;
          if (dateBefore && last > dateBefore) return false;
          if (dateAfter && last < dateAfter) return false;
          return true;
        });
      }

      setGroups(groupsData);
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
        // lastMemberJoinedAt is not present on Group type in some API versions;
        // use a type assertion and fall back to createdAt if not available.
        const last = (group as any).lastMemberJoinedAt
          ? new Date((group as any).lastMemberJoinedAt)
          : group.createdAt
          ? new Date(group.createdAt)
          : null;
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
      // If private, show a small choice dialog: request to join or enter password
      const hasPassword = (group as any).hasPassword ?? (group as any).passwordProtected ?? false;
      if (group.privacyType === 'PRIVATE') {
        setJoinChoiceGroupId(group.groupId);
        setJoinChoiceDialogOpen(true);
        return;
      }

      // public group: directly join
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

  const sendRequestJoin = async (groupId: number | null) => {
    if (!user || !groupId) return;
    const token = tokenService.getToken();
    if (!token) return;

    try {
      setJoiningGroupId(groupId);
      setJoinChoiceDialogOpen(false);
      await groupAPI.joinGroup(token, groupId, user.id);
      toast({ title: 'Request sent', description: 'Your request to join the group has been submitted.' });
      await fetchGroups();
    } catch (error) {
      console.error('Failed to send join request:', error);
      toast({ title: 'Failed to request join', description: error instanceof Error ? error.message : 'Please try again.' });
    } finally {
      setJoiningGroupId(null);
      setJoinChoiceGroupId(null);
    }
  };

  const submitPasswordJoin = async () => {
    if (!user || !passwordForGroupId) return;
    const token = tokenService.getToken();
    if (!token) return;

    // Reset status
    setPasswordStatus('idle');
    setPasswordStatusMessage('');

    try {
      setJoiningGroupId(passwordForGroupId);
      // Attempt join with provided password
      await groupAPI.joinGroup(token, passwordForGroupId, user.id, joinPassword);
      // success -> visual feedback then close
      setPasswordStatus('success');
      setPasswordStatusMessage('Password correct — joined successfully.');
      toast({ title: 'Joined', description: 'You have successfully joined the group.' });
      await fetchGroups();
      // close the dialog shortly after showing success
      setTimeout(() => {
        setPasswordDialogOpen(false);
        setPasswordForGroupId(null);
        setJoinPassword('');
        setPasswordStatus('idle');
        setPasswordStatusMessage('');
      }, 900);
    } catch (error) {
      console.error('Failed to join with password:', error);
      const msg = error instanceof Error ? error.message : 'Please try again.';
      if (msg && msg.toLowerCase().includes('invalid password')) {
        // invalid password -> show inline red message, keep dialog open
        setPasswordStatus('error');
        setPasswordStatusMessage('Invalid password. Please try again or request to join.');
        toast({ title: 'Invalid password', description: 'Password is incorrect. Please try again or request to join.' });
      } else {
        // other errors -> show toast and close
        toast({ title: 'Failed to join group', description: msg });
        setPasswordDialogOpen(false);
        setPasswordForGroupId(null);
        setJoinPassword('');
        setPasswordStatus('idle');
        setPasswordStatusMessage('');
      }
    } finally {
      setJoiningGroupId(null);
      // Note: do NOT clear joinPassword here so users can retry when password is invalid
    }
  };

  const evaluatePasswordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score += 1;
    if (/[A-Z]/.test(pw)) score += 1;
    if (/[0-9]/.test(pw)) score += 1;
    if (/[^A-Za-z0-9]/.test(pw)) score += 1;
    setPasswordStrength(score);
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


  const handleLeaveGroup = async (groupId: number) => {
    if (!user) return;
    const token = tokenService.getToken();
    if (!token) return;

    try {
      await groupAPI.leaveGroup(token, groupId, user.id);
      toast({ title: 'Left group', description: 'You have successfully left the group.' });
      await fetchGroups();
    } catch (err) {
      console.error('Failed to leave group', err);
      toast({ title: 'Failed to leave', description: err instanceof Error ? err.message : 'Please try again.' });
    }
  };

  const openLeaveDialog = (groupId: number, groupName?: string) => {
    setLeaveTargetGroupId(groupId);
    setLeaveTargetGroupName(groupName ?? null);
    setLeaveConfirmOpen(true);
  };

  const closeLeaveDialog = () => {
    setLeaveConfirmOpen(false);
    setLeaveTargetGroupId(null);
    setLeaveTargetGroupName(null);
  };

  const confirmLeave = async () => {
    if (!leaveTargetGroupId) return;
    // close dialog first for snappy UX
    closeLeaveDialog();
    await handleLeaveGroup(leaveTargetGroupId);
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
                    password: values.privacy === 'private' ? values.password : undefined,
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
        {/* Modern Search & Filter Section */}
        <div className="bg-white/50 backdrop-blur-sm border border-border rounded-xl shadow-sm mb-8 overflow-hidden">
          {/* Search Bar */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 border-b">
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search study groups, courses, or topics..."
                value={pendingSearchQuery}
                onChange={(e) => setPendingSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base border-0 bg-white/80 backdrop-blur-sm shadow-sm focus:shadow-md transition-all"
              />
            </div>
          </div>

          {/* Filter Controls */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Basic Filters */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Filter className="w-4 h-4" />
                  Basic Filters
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Course</label>
                    <Select value={pendingSelectedCourse} onValueChange={setPendingSelectedCourse}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {courseOptions.map((course) => (
                          <SelectItem key={course} value={course}>
                            {course}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Privacy</label>
                    <Select value={pendingSelectedPrivacy} onValueChange={setPendingSelectedPrivacy}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Groups</SelectItem>
                        <SelectItem value="PUBLIC">
                          <div className="flex items-center gap-2">
                            <Globe className="w-3 h-3" />
                            Public
                          </div>
                        </SelectItem>
                        <SelectItem value="PRIVATE">
                          <div className="flex items-center gap-2">
                            <Lock className="w-3 h-3" />
                            Private
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Member Count Filter */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Users className="w-4 h-4" />
                    Group Size
                  </div>
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Filter Type</label>
                      <Select value={pendingMemberFilterType} onValueChange={setPendingMemberFilterType}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ANY">Any Size</SelectItem>
                          <SelectItem value="BELOW">Below</SelectItem>
                          <SelectItem value="ABOVE">Above</SelectItem>
                          <SelectItem value="BETWEEN">Between</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {pendingMemberFilterType !== 'ANY' && (
                      <div className={pendingMemberFilterType === 'BETWEEN' ? 'flex gap-2' : ''}>
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">
                            {pendingMemberFilterType === 'BETWEEN' ? 'Min' : 'Count'}
                          </label>
                          <Input
                            type="number"
                            min={0}
                            value={pendingMemberValue1}
                            onChange={(e) => setPendingMemberValue1(e.target.value)}
                            placeholder="0"
                            className="h-9 w-20"
                          />
                        </div>
                        {pendingMemberFilterType === 'BETWEEN' && (
                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Max</label>
                            <Input
                              type="number"
                              min={0}
                              value={pendingMemberValue2}
                              onChange={(e) => setPendingMemberValue2(e.target.value)}
                              placeholder="100"
                              className="h-9 w-20"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Date Filter */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <CalendarIcon className="w-4 h-4" />
                    Activity Date
                  </div>
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Filter Type</label>
                      <Select value={pendingDateFilterType} onValueChange={setPendingDateFilterType}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ANY">Any Date</SelectItem>
                          <SelectItem value="BEFORE">Before</SelectItem>
                          <SelectItem value="AFTER">After</SelectItem>
                          <SelectItem value="BETWEEN">Between</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {pendingDateFilterType !== 'ANY' && (
                      <div className={pendingDateFilterType === 'BETWEEN' ? 'flex gap-2' : ''}>
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">
                            {pendingDateFilterType === 'BETWEEN' ? 'From' : 'Date'}
                          </label>
                          <Input
                            type="date"
                            value={pendingDateValue1}
                            onChange={(e) => setPendingDateValue1(e.target.value)}
                            className="h-9 w-36"
                          />
                        </div>
                        {pendingDateFilterType === 'BETWEEN' && (
                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">To</label>
                            <Input
                              type="date"
                              value={pendingDateValue2}
                              onChange={(e) => setPendingDateValue2(e.target.value)}
                              className="h-9 w-36"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <div className="flex justify-center pt-6 border-t mt-6">
              <Button
                size="lg"
                onClick={async () => {
                  // Apply the pending UI filters to the applied filters and fetch
                  setAppliedSearchQuery(pendingSearchQuery);
                  setAppliedSelectedCourse(pendingSelectedCourse);
                  setAppliedSelectedPrivacy(pendingSelectedPrivacy);

                  // Build overrides for fetchGroups
                  const overrides: any = {
                    privacy: pendingSelectedPrivacy === 'ALL' ? undefined : pendingSelectedPrivacy,
                    name: pendingSearchQuery || undefined,
                  };

                  // Member overrides (normalize BETWEEN)
                  if (pendingMemberFilterType === 'BELOW' && pendingMemberValue1) {
                    overrides.maxMembers = Number(pendingMemberValue1);
                  } else if (pendingMemberFilterType === 'ABOVE' && pendingMemberValue1) {
                    overrides.minMembers = Number(pendingMemberValue1);
                  } else if (pendingMemberFilterType === 'BETWEEN' && pendingMemberValue1 && pendingMemberValue2) {
                    let a = Number(pendingMemberValue1);
                    let b = Number(pendingMemberValue2);
                    if (a > b) [a, b] = [b, a];
                    overrides.minMembers = a;
                    overrides.maxMembers = b;
                  }

                  // Date overrides
                  if (pendingDateFilterType === 'BEFORE' && pendingDateValue1) {
                    overrides.dateBefore = pendingDateValue1;
                  } else if (pendingDateFilterType === 'AFTER' && pendingDateValue1) {
                    overrides.dateAfter = pendingDateValue1;
                  } else if (pendingDateFilterType === 'BETWEEN' && pendingDateValue1 && pendingDateValue2) {
                    // treat BETWEEN as dateAfter = start, dateBefore = end; normalize order without mutating React state
                    const start = pendingDateValue1;
                    const end = pendingDateValue2;
                    let normalizedStart = start;
                    let normalizedEnd = end;
                    const d1 = new Date(start);
                    const d2 = new Date(end);
                    if (d1 > d2) {
                      normalizedStart = end;
                      normalizedEnd = start;
                    }
                    overrides.dateAfter = normalizedStart;
                    overrides.dateBefore = normalizedEnd;
                  }

                  await fetchGroups(overrides);
                }}
                className="px-8 py-3 shadow-lg hover:shadow-xl transition-all"
              >
                <Search className="w-4 h-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </div>

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
                          {/* owner-only edit removed per request */}
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

                          <div className="relative inline-block">
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
                            <span className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full bg-primary text-white text-[10px] font-medium">
                              {group.memberCount ?? 0}
                            </span>
                          </div>
                          {group.createdBy !== user?.id && (
                            <Button size="sm" variant="destructive" onClick={() => openLeaveDialog(group.groupId, group.groupName)} className="ml-2">
                              Exit
                            </Button>
                          )}
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
                            {/* Show Exit at top-right for joined available groups */}
                            {isJoined && (
                              <div className="ml-4">
                                <Button size="sm" variant="destructive" onClick={() => openLeaveDialog(group.groupId, group.groupName)} aria-label="Exit group">
                                  Exit
                                </Button>
                              </div>
                            )}
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

                            <div className="flex items-center gap-2">
                              <div className="relative inline-block">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleManageGroup(group)}
                                >
                                  Members
                                </Button>
                                <span className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full bg-primary text-white text-[10px] font-medium">
                                  {group.memberCount ?? 0}
                                </span>
                              </div>
                              <Button
                                size="sm"
                                variant={isPrivate ? 'outline' : 'default'}
                                onClick={() => handleJoinGroup(group)}
                                disabled={buttonDisabled}
                              >
                                {buttonContent}
                              </Button>
                              {/* bottom Exit removed for joined available groups (moved to header) */}
                            </div>
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
            <div className="relative">
              <Input
                type={passwordVisible ? 'text' : 'password'}
                value={joinPassword}
                onChange={(e) => { setJoinPassword(e.target.value); setPasswordStatus('idle'); setPasswordStatusMessage(''); }}
              />
              <button
                type="button"
                className="absolute right-2 top-2 text-gray-500"
                onClick={() => setPasswordVisible((v) => !v)}
                aria-label={passwordVisible ? 'Hide password' : 'Show password'}
              >
                {passwordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {passwordStatus !== 'idle' && (
              <div className={`text-sm mt-1 ${passwordStatus === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                {passwordStatusMessage}
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-end">
            <Button variant="outline" onClick={() => { setPasswordDialogOpen(false); setPasswordForGroupId(null); setJoinPassword(''); }}>Cancel</Button>
            <Button className="ml-2" onClick={() => submitPasswordJoin()}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Join choice dialog for private groups: request or enter password */}
      <Dialog open={joinChoiceDialogOpen} onOpenChange={(open) => { setJoinChoiceDialogOpen(open); if (!open) { setJoinChoiceGroupId(null); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Private Group</DialogTitle>
            <DialogDescription>
              This is a private group. You can either request to join (owner approval required) or enter the group password (if you have it) to join immediately.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { if (joinChoiceGroupId) sendRequestJoin(joinChoiceGroupId); }}>Request to Join</Button>
            <Button onClick={() => { setJoinChoiceDialogOpen(false); setPasswordForGroupId(joinChoiceGroupId); setJoinPassword(''); setPasswordDialogOpen(true); }}>Enter Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leave confirmation dialog */}
      <Dialog open={leaveConfirmOpen} onOpenChange={(open) => { if (!open) { closeLeaveDialog(); } setLeaveConfirmOpen(open); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Leave Group</DialogTitle>
            <DialogDescription>
              Are you sure you want to leave {leaveTargetGroupName ? `"${leaveTargetGroupName}"` : 'this group'}? You can rejoin later if needed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => closeLeaveDialog()}>Cancel</Button>
            <Button variant="destructive" onClick={() => confirmLeave()}>Leave</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}