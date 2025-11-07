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
  Key,
  Crown,
  User,
  Trash,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import GroupCard from '@/components/group/GroupCard';
import { tokenService } from '@/services/api';
import { groupAPI } from '@/lib/api/groupApi';
import GroupCreateDialog, { GroupCreateValues } from '@/components/group/GroupCreateDialog';
import { Group, GroupCreateRequest, GroupMember } from '@/types/group';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export default function Groups() {
  const { user } = useAuth();
  const { toast } = useToast();
  // Mobile: collapse filters behind a button on very small screens
  const [filtersOpen, setFiltersOpen] = useState(false);
  
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
  const [selectedPendingIds, setSelectedPendingIds] = useState<number[]>([]);
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
  // Generic confirmation modal state
  const [confirmModal, setConfirmModal] = useState<any>({ open: false });

  // Members dialog - removed unused states for now since backend doesn't have member list endpoint ready
  // const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  // const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  // const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  // const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  useEffect(() => {
    // initial load using the default applied filters — fetch public groups even if not logged in
    fetchGroups();
  }, [user]);

  const fetchGroups = async (overrides?: { privacy?: string | undefined; name?: string | undefined; size?: string | undefined; minMembers?: number; maxMembers?: number; dateBefore?: string; dateAfter?: string }) => {
    // allow fetching public groups when not authenticated; token is optional
    const token = tokenService.getToken();

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
        userId: user?.id, // Pass userId to get membership status for each group
        filterByMembership: false, // Don't filter - show all groups
      });
      
      // Handle paginated response
      let groupsData = response.content || response;
      groupsData = Array.isArray(groupsData) ? groupsData : [];

      // Fetch member counts for these groups and attach memberCount (only if token present)
      const countsMap = new Map<number, number>();
      if (token) {
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
      } else {
        // unauthenticated view: set memberCount to 0 (or undefined) to avoid extra network calls
        groupsData.forEach((g: any) => { g.memberCount = g.memberCount ?? 0; countsMap.set(g.groupId, g.memberCount ?? 0); });
      }

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

  const handleChangeMemberRole = async (userId: number, newRole: string) => {
    if (!user || !managingGroupId) return;
    if (!isAdminForManagingGroup) {
      toast({ title: 'Not allowed', description: 'Only group admins can change roles.' });
      return;
    }

    const token = tokenService.getToken();
    if (!token) return;

    try {
      await groupAPI.changeMemberRole(token, managingGroupId, user.id, userId, newRole);
      toast({ title: 'Role updated', description: `User role changed to ${newRole}.` });
      // refresh members
      const updatedMembers = await groupAPI.getGroupMembers(token, managingGroupId);
      setGroupMembers(updatedMembers);
    } catch (error) {
      console.error('Failed to change member role:', error);
      toast({ title: 'Failed to change role', description: error instanceof Error ? error.message : 'Please try again.' });
    }
  };

  const handleTogglePendingSelect = (userId: number) => {
    setSelectedPendingIds((prev) => {
      const set = new Set(prev);
      if (set.has(userId)) set.delete(userId);
      else set.add(userId);
      return Array.from(set);
    });
  };

  const handleBulkApproveSelected = async () => {
    if (!user || !managingGroupId) return;
    if (!isAdminForManagingGroup) {
      toast({ title: 'Not allowed', description: 'Only group admins can approve members.' });
      return;
    }
    if (selectedPendingIds.length === 0) return;

    const token = tokenService.getToken();
    if (!token) return;

    try {
      await Promise.all(selectedPendingIds.map((uid) => groupAPI.approveMember(token, managingGroupId, user.id, uid)));
      toast({ title: 'Approved', description: `Approved ${selectedPendingIds.length} request(s).` });
      setSelectedPendingIds([]);
      const updatedMembers = await groupAPI.getGroupMembers(token, managingGroupId);
      setGroupMembers(updatedMembers);
    } catch (error) {
      console.error('Bulk approve failed', error);
      toast({ title: 'Failed', description: 'Failed to approve selected members. Try again.' });
    }
  };

  const handleBulkRemoveSelected = async () => {
    if (!user || !managingGroupId) return;
    if (!isAdminForManagingGroup) {
      toast({ title: 'Not allowed', description: 'Only group admins can remove members.' });
      return;
    }
    if (selectedPendingIds.length === 0) return;

    const token = tokenService.getToken();
    if (!token) return;

    try {
      await Promise.all(selectedPendingIds.map((uid) => groupAPI.removeMember(token, managingGroupId, user.id, uid)));
      toast({ title: 'Removed', description: `Removed ${selectedPendingIds.length} member(s).` });
      setSelectedPendingIds([]);
      const updatedMembers = await groupAPI.getGroupMembers(token, managingGroupId);
      setGroupMembers(updatedMembers);
    } catch (error) {
      console.error('Bulk remove failed', error);
      toast({ title: 'Failed', description: 'Failed to remove selected members. Try again.' });
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 pb-24 lg:pb-8 overflow-x-hidden">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
            <div>
              <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
                <div className="p-2.5 sm:p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">Study Groups</h1>
              </div>
              <p className="text-base sm:text-xl text-blue-100 max-w-3xl leading-relaxed">
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Mobile Filters Toggle */}
        <div className="md:hidden mb-4">
          <Button variant="outline" className="w-full justify-between" onClick={() => setFiltersOpen(v => !v)}>
            <span className="flex items-center gap-2"><Filter className="w-4 h-4" /> Filters</span>
            <span className="text-xs text-muted-foreground">{filtersOpen ? 'Hide' : 'Show'}</span>
          </Button>
        </div>
        {/* Modern Search & Filter Section */}
        <div className={`bg-white/50 backdrop-blur-sm border border-border rounded-xl shadow-sm mb-6 sm:mb-8 overflow-hidden ${filtersOpen ? 'block' : 'hidden'} md:block`}>
          {/* Search Bar */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 sm:p-6 border-b">
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
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              
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
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
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
                      <div className={pendingMemberFilterType === 'BETWEEN' ? 'flex flex-col sm:flex-row gap-2 w-full sm:w-auto' : 'w-full sm:w-auto'}>
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
                            className="h-9 w-full sm:w-24"
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
                              className="h-9 w-full sm:w-24"
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
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
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
                      <div className={pendingDateFilterType === 'BETWEEN' ? 'flex flex-col sm:flex-row gap-2 w-full sm:w-auto' : 'w-full sm:w-auto'}>
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">
                            {pendingDateFilterType === 'BETWEEN' ? 'From' : 'Date'}
                          </label>
                          <Input
                            type="date"
                            value={pendingDateValue1}
                            onChange={(e) => setPendingDateValue1(e.target.value)}
                            className="h-9 w-full sm:w-44"
                          />
                        </div>
                        {pendingDateFilterType === 'BETWEEN' && (
                          <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">To</label>
                            <Input
                              type="date"
                              value={pendingDateValue2}
                              onChange={(e) => setPendingDateValue2(e.target.value)}
                              className="h-9 w-full sm:w-44"
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
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all"
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
                <div className="mt-3">
                  <Button onClick={() => fetchGroups()}>Retry</Button>
                </div>
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
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-foreground">My Groups</h2>
                  <Badge variant="secondary">{myGroups.length}</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {myGroups.map((group) => (
                    <Card key={group.groupId} className="group h-full flex flex-col overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 bg-white">
                      {/* Colored Header Bar */}
                      <div className={`relative h-2 ${group.privacyType === 'PRIVATE' ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-emerald-400 to-teal-500'}`}>
                        <div className="absolute -bottom-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-50" />
                      </div>

                      <CardHeader className="pb-3 pt-5 px-6">
                        {/* Title Row */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <CardTitle className="text-lg sm:text-xl font-bold leading-tight line-clamp-2 flex-1">
                            {group.groupName}
                          </CardTitle>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant="outline" className="border-purple-300 text-purple-700 bg-purple-50">
                              <Crown className="w-3 h-3 mr-1" />Owner
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`${
                                group.privacyType === 'PRIVATE' 
                                  ? 'border-amber-300 text-amber-700 bg-amber-50' 
                                  : 'border-emerald-300 text-emerald-700 bg-emerald-50'
                              }`}
                            >
                              {group.privacyType === 'PRIVATE' ? (
                                <><Lock className="w-3 h-3 mr-1" />Private</>
                              ) : (
                                <><Globe className="w-3 h-3 mr-1" />Public</>
                              )}
                            </Badge>
                          </div>
                        </div>

                        {/* Course & Date Info */}
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          {group.courseName && (
                            <div className="flex items-center gap-1.5 text-muted-foreground bg-slate-100 px-3 py-1.5 rounded-md">
                              <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
                              <span className="font-medium truncate">{group.courseName}</span>
                            </div>
                          )}
                          {group.createdAt && (
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <Clock className="w-3.5 h-3.5" />
                              {new Date(group.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="flex flex-col flex-1 px-6 pb-6">
                        {/* Description */}
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                          {group.description || 'This study group has no description yet.'}
                        </p>

                        {/* Divider */}
                        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-3" />

                        {/* Members Info Card */}
                        <div className="bg-slate-50 rounded-lg p-3 mb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-primary/10 rounded-full">
                                <Users className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground font-medium">Members</p>
                                <p className="text-sm font-bold text-foreground">
                                  {group.memberCount ?? 0}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-auto space-y-2">
                          <Button 
                            size="lg"
                            onClick={() => handleManageGroup(group)}
                            disabled={isLoadingMembers && managingGroupId === group.groupId}
                            className="w-full font-semibold text-base shadow-md hover:shadow-lg transition-all"
                          >
                            {isLoadingMembers && managingGroupId === group.groupId ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <Users className="w-4 h-4 mr-2" />
                            )}
                            Manage Members
                          </Button>
                          {group.createdBy !== user?.id && (
                            <Button 
                              size="lg"
                              variant="destructive"
                              onClick={() => openLeaveDialog(group.groupId, group.groupName)}
                              className="w-full font-semibold text-base"
                            >
                              Exit Group
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
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-foreground">Available Groups</h2>
                  <Badge variant="secondary">{availableGroups.length}</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
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
                      <Card key={group.groupId} className="group h-full flex flex-col overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 bg-white">
                        {/* Colored Header Bar */}
                        <div className={`relative h-2 ${isPrivate ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-emerald-400 to-teal-500'}`}>
                          <div className="absolute -bottom-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-50" />
                        </div>

                        <CardHeader className="pb-3 pt-5 px-6">
                          {/* Title and Status Row */}
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <CardTitle className="text-lg sm:text-xl font-bold leading-tight line-clamp-2 flex-1">
                              {group.groupName}
                            </CardTitle>
                            <div className="flex flex-col gap-2 shrink-0">
                              <Badge 
                                variant="outline" 
                                className={`${
                                  isPrivate 
                                    ? 'border-amber-300 text-amber-700 bg-amber-50' 
                                    : 'border-emerald-300 text-emerald-700 bg-emerald-50'
                                }`}
                              >
                                {isPrivate ? (
                                  <><Lock className="w-3 h-3 mr-1" />Private</>
                                ) : (
                                  <><Globe className="w-3 h-3 mr-1" />Public</>
                                )}
                              </Badge>
                              {isJoined && (
                                <Button 
                                  size="sm" 
                                  variant="destructive" 
                                  onClick={() => openLeaveDialog(group.groupId, group.groupName)}
                                  className="text-xs px-2 py-1 h-auto"
                                >
                                  Exit
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Course & Date Info */}
                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            {group.courseName && (
                              <div className="flex items-center gap-1.5 text-muted-foreground bg-slate-100 px-3 py-1.5 rounded-md">
                                <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
                                <span className="font-medium truncate">{group.courseName}</span>
                              </div>
                            )}
                            {group.createdAt && (
                              <span className="flex items-center gap-1.5 text-muted-foreground">
                                <Clock className="w-3.5 h-3.5" />
                                {new Date(group.createdAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </CardHeader>

                        <CardContent className="flex flex-col flex-1 px-6 pb-6">
                          {/* Description */}
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                            {group.description || 'This study group has no description yet.'}
                          </p>

                          {/* Divider */}
                          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-3" />

                          {/* Members Info Card */}
                          <div className="bg-slate-50 rounded-lg p-3 mb-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="p-2 bg-primary/10 rounded-full">
                                  <Users className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground font-medium">Members</p>
                                  <p className="text-sm font-bold text-foreground">
                                    {group.memberCount ?? 0}
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleManageGroup(group)}
                                className="text-xs"
                              >
                                View
                              </Button>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="mt-auto space-y-2">
                            <Button 
                              size="lg"
                              variant={isJoined ? 'secondary' : isPending ? 'secondary' : 'default'}
                              onClick={() => handleJoinGroup(group)}
                              disabled={buttonDisabled}
                              className="w-full font-semibold text-base shadow-md hover:shadow-lg transition-all"
                            >
                              {isRequesting ? (
                                <><Loader2 className="w-4 h-4 animate-spin mr-2" />Processing...</>
                              ) : isJoined ? (
                                <><UserCheck className="w-4 h-4 mr-2" />Joined</>
                              ) : isPending ? (
                                <><UserPlus className="w-4 h-4 mr-2" />Request Pending</>
                              ) : isPrivate ? (
                                <><UserPlus className="w-4 h-4 mr-2" />Request to Join</>
                              ) : (
                                <><UserCheck className="w-4 h-4 mr-2" />Join Group</>
                              )}
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
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl sm:text-2xl">Manage Group Members</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              View and manage members of your group. Approve pending requests or remove existing members.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {groupMembers.length > 0 ? (
              <div className="space-y-4">
                {/* Approved Members */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">Members</h3>
                  <div className="space-y-2">
                    {groupMembers
                      .filter((m) => m.status === 'APPROVED')
                      .sort((a, b) => {
                        // Put current user first, then admins, then members
                        if (a.userId === user?.id) return -1;
                        if (b.userId === user?.id) return 1;
                        if (a.role !== b.role) return a.role === 'ADMIN' ? -1 : 1;
                        return 0;
                      })
                      .map((member) => (
                        <div key={member.groupMemberId} className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border rounded-lg ${member.role === 'ADMIN' ? 'border-l-4 border-l-blue-600' : 'border-l-4 border-l-purple-600'}`}>
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            <div className="w-10 h-10 sm:w-8 sm:h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                              <Users className="w-5 h-5 sm:w-4 sm:h-4 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm sm:text-base truncate">{member.userName || `User ${member.userId}`}{member.userId === user?.id ? ' (you)' : ''}</p>
                              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground mt-1">
                                {/* Role pill */}
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-sm text-white font-medium text-xs ${member.role === 'ADMIN' ? 'bg-[#1E40AF]' : 'bg-[#6B21A8]'}`}>
                                  {member.role === 'ADMIN' ? <Crown className="w-3 h-3 sm:w-4 sm:h-4" /> : <User className="w-3 h-3 sm:w-4 sm:h-4" />}
                                  <span>{member.role === 'ADMIN' ? 'Admin' : 'Member'}</span>
                                </span>
                                {member.joinedAt && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span className="hidden sm:inline">{new Date(member.joinedAt).toLocaleDateString()}</span>
                                    <span className="sm:hidden">{new Date(member.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                              {isAdminForManagingGroup ? (
                            <div className="flex items-center gap-2 sm:space-x-2 flex-wrap sm:flex-nowrap">
                              {/* Inline promote/demote buttons for convenience (admins only, not for self) */}
                              {member.userId !== user?.id && (
                                <div className="flex items-center gap-2">
                                  {member.role !== 'ADMIN' ? (
                                    <button
                                      className="px-2 py-1 text-xs rounded bg-blue-600 text-white"
                                      onClick={() => setConfirmModal({ open: true, type: 'promote', payload: { userId: member.userId, userName: member.userName }, title: 'Promote member', message: `Promote ${member.userName || 'this user'} to Admin?` })}
                                    >
                                      Promote
                                    </button>
                                  ) : (
                                    <button
                                      className="px-2 py-1 text-xs rounded bg-gray-200 text-foreground"
                                      onClick={() => setConfirmModal({ open: true, type: 'demote', payload: { userId: member.userId, userName: member.userName }, title: 'Demote member', message: `Demote ${member.userName || 'this user'} to Member?` })}
                                    >
                                      Demote
                                    </button>
                                  )}
                                </div>
                              )}
                              {/* Trash icon button */}
                              {/* Only show delete if the member is not an admin and not the current user */}
                              {member.userId !== user?.id && (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <button
                                      onClick={() => setConfirmModal({ open: true, type: 'removeMember', payload: { memberId: member.groupMemberId, userId: member.userId, userName: member.userName }, title: 'Remove member', message: `Remove ${member.userName || 'this member'} from the group?` })}
                                      className="p-2 rounded hover:bg-red-50"
                                      aria-label={`Delete ${member.userName || member.userId}`}
                                    >
                                      <Trash className="w-4 h-4 text-destructive" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>Delete member</TooltipContent>
                                </Tooltip>
                              )}

                              {/* If this row is the current user and they are not an admin, allow them to leave the group */}
                              {member.userId === user?.id && !isAdminForManagingGroup && (
                                <button
                                  onClick={() => handleLeaveGroup(member.groupId)}
                                  className="ml-2 px-2 py-1 text-sm rounded border border-gray-200 text-destructive hover:bg-red-50"
                                >
                                  Leave
                                </button>
                              )}

                              {/* More menu removed: inline Promote/Demote and Delete buttons are used instead */}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">Only group admins can manage members</div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>

                {/* Pending Requests */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold">Pending Requests</h3>
                    {isAdminForManagingGroup && (
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={handleBulkApproveSelected} disabled={selectedPendingIds.length === 0}>Approve Selected</Button>
                        <Button size="sm" variant="destructive" onClick={handleBulkRemoveSelected} disabled={selectedPendingIds.length === 0}>Remove Selected</Button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {groupMembers
                      .filter((m) => m.status === 'PENDING')
                      .map((member) => (
                        <div key={`pending-${member.groupMemberId}`} className={`flex items-center justify-between p-3 border rounded-lg border-l-4 border-l-purple-600`}>
                          <div className="flex items-center space-x-3">
                            {isAdminForManagingGroup && (
                              <input
                                type="checkbox"
                                checked={selectedPendingIds.includes(member.userId)}
                                onChange={() => handleTogglePendingSelect(member.userId)}
                                className="w-4 h-4"
                                aria-label={`Select ${member.userName || member.userId} for approval`}
                              />
                            )}
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{member.userName || `User ${member.userId}`}</p>
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full shadow-sm text-[#374151] bg-[#E5E7EB] font-medium text-sm">You</span>
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
                            <div className="flex items-center gap-2">
                              <Button size="sm" onClick={() => handleApproveMember(member.groupMemberId, member.userId)}>
                                <UserCheck className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Tooltip>
                                <TooltipTrigger>
                                  <button
                                    onClick={() => handleRemoveMember(member.groupMemberId, member.userId)}
                                    className="p-2 rounded hover:bg-red-50"
                                    aria-label={`Delete ${member.userName || member.userId}`}
                                  >
                                    <Trash className="w-4 h-4 text-destructive" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>Delete member</TooltipContent>
                              </Tooltip>
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">Only group admins can review requests</div>
                          )}
                        </div>
                      ))}
                    {groupMembers.filter((m) => m.status === 'PENDING').length === 0 && (
                      <div className="text-sm text-muted-foreground">No pending requests</div>
                    )}
                  </div>
                </div>
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
        <DialogContent className="max-w-[95vw] sm:max-w-md p-4 sm:p-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-600" />
              Enter Group Password
            </DialogTitle>
            <DialogDescription className="text-sm">
              This group requires a password. Enter the password to join immediately.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Group Password</Label>
              <div className="relative">
                <Input
                  type={passwordVisible ? 'text' : 'password'}
                  value={joinPassword}
                  onChange={(e) => { setJoinPassword(e.target.value); setPasswordStatus('idle'); setPasswordStatusMessage(''); }}
                  placeholder="Enter password"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setPasswordVisible((v) => !v)}
                  aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                >
                  {passwordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {passwordStatus !== 'idle' && (
              <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${passwordStatus === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                {passwordStatus === 'error' ? <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> : <UserCheck className="w-4 h-4 mt-0.5 shrink-0" />}
                <span>{passwordStatusMessage}</span>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => { setPasswordDialogOpen(false); setPasswordForGroupId(null); setJoinPassword(''); }} className="w-full sm:w-auto">Cancel</Button>
            <Button onClick={() => submitPasswordJoin()} disabled={!joinPassword.trim()} className="w-full sm:w-auto sm:ml-2">
              <Key className="w-4 h-4 mr-2" />
              Submit Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Join choice dialog for private groups: request or enter password */}
      <Dialog open={joinChoiceDialogOpen} onOpenChange={(open) => { setJoinChoiceDialogOpen(open); if (!open) { setJoinChoiceGroupId(null); } }}>
        <DialogContent className="max-w-[95vw] sm:max-w-md p-4 sm:p-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-600" />
              Private Group
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              This is a private group. You can either request to join (owner approval required) or enter the group password (if you have it) to join immediately.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-2 mt-4">
            <Button variant="outline" onClick={() => { if (joinChoiceGroupId) sendRequestJoin(joinChoiceGroupId); }} className="w-full sm:w-auto">
              <UserPlus className="w-4 h-4 mr-2" />
              Request to Join
            </Button>
            <Button onClick={() => { setJoinChoiceDialogOpen(false); setPasswordForGroupId(joinChoiceGroupId); setJoinPassword(''); setPasswordDialogOpen(true); }} className="w-full sm:w-auto">
              <Key className="w-4 h-4 mr-2" />
              Enter Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leave confirmation dialog */}
      <Dialog open={leaveConfirmOpen} onOpenChange={(open) => { if (!open) { closeLeaveDialog(); } setLeaveConfirmOpen(open); }}>
        <DialogContent className="max-w-[95vw] sm:max-w-md p-4 sm:p-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Leave Group
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Are you sure you want to leave {leaveTargetGroupName ? `"${leaveTargetGroupName}"` : 'this group'}? You can rejoin later if needed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-2 mt-4">
            <Button variant="outline" onClick={() => closeLeaveDialog()} className="w-full sm:w-auto">Cancel</Button>
            <Button variant="destructive" onClick={() => confirmLeave()} className="w-full sm:w-auto">
              <Trash className="w-4 h-4 mr-2" />
              Leave Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generic confirmation dialog */}
      <Dialog open={confirmModal.open === true} onOpenChange={(open) => { if (!open) setConfirmModal({ open: false }); }}>
        <DialogContent className="max-w-[95vw] sm:max-w-md p-4 sm:p-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-lg sm:text-xl">{confirmModal.title || 'Confirm'}</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">{confirmModal.message || 'Are you sure?'}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmModal({ open: false })}>Cancel</Button>
            <Button variant="destructive" onClick={async () => {
              const type = confirmModal.type;
              const payload = confirmModal.payload || {};
              setConfirmModal({ open: false });
              try {
                if (type === 'promote') {
                  await handleChangeMemberRole(payload.userId, 'ADMIN');
                } else if (type === 'demote') {
                  await handleChangeMemberRole(payload.userId, 'MEMBER');
                } else if (type === 'removeMember') {
                  await handleRemoveMember(payload.memberId, payload.userId);
                } else if (type === 'deleteGroup') {
                  if (managingGroupId) await handleDeleteGroup(managingGroupId);
                }
              } catch (err) {
                // handlers already show toasts; swallow here
              }
            }}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}