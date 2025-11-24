import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Loader2, Users, Calendar, Clock } from 'lucide-react';
import { sessionInvitationAPI, SessionCreateWithInvitationsRequest } from '@/lib/api/sessionInvitationApi';
import { useAuth } from '@/contexts/AuthContext';

interface GroupMember {
  groupMemberId: number;
  userId: number;
  userName: string;
  role: string;
  status: string;
}

export default function SessionCreateWithInvitationsDialog({ 
  groupId, 
  onCreated 
}: { 
  groupId: number; 
  onCreated?: (session: any) => void;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [durationDays, setDurationDays] = useState<number>(1);
  const [meetingLink, setMeetingLink] = useState('');

  useEffect(() => {
    if (open) {
      loadGroupMembers();
    }
  }, [open, groupId]);

  const loadGroupMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/group-members/group/${groupId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        // Filter out current user and only show approved members
        const approved = data.filter((m: GroupMember) => 
          m.status === 'APPROVED' && m.userId !== user?.id
        );
        setMembers(approved);
      }
    } catch (error) {
      console.error('Failed to load group members:', error);
    }
  };

  const toggleMember = (userId: number) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAll = () => {
    setSelectedUserIds(members.map(m => m.userId));
  };

  const deselectAll = () => {
    setSelectedUserIds([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !title || !startDate || !startTime || !endTime || !durationDays || durationDays < 1) {
      alert('Please fill in all required fields and set duration (>= 1 day)');
      return;
    }

    if (loading) return;

    try {
      setLoading(true);

      // Validate times are on same day and end is after start
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(`${startDate}T${endTime}`);
      
      if (endDateTime <= startDateTime) {
        alert('End time must be later than the start time.');
        return;
      }

      const request: SessionCreateWithInvitationsRequest = {
        groupId,
        title,
        description,
        date: startDate, // YYYY-MM-DD
        startTime, // HH:mm
        endTime, // HH:mm
        durationDays: durationDays,
        meetingLink: meetingLink || undefined,
        invitedUserIds: selectedUserIds,
      };

      const created = await sessionInvitationAPI.createSessionWithInvitations(user.id, request);
      
      // Reset form
      setTitle('');
      setDescription('');
      setStartDate('');
      setStartTime('');
      setEndTime('');
      setDurationDays(1);
      setMeetingLink('');
      setSelectedUserIds([]);
      
      setOpen(false);
      onCreated?.(created);
    } catch (error: any) {
      console.error('Failed to create session:', error);
      alert(error.message || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Create Session with Invitations
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Study Session</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Week 5 Review Session"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will you be studying?"
              rows={3}
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time *</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="durationDays">Duration (days) *</Label>
              <Input
                id="durationDays"
                type="number"
                min={1}
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                required
              />
            </div>
          </div>

          {/* Meeting Link */}
          <div className="space-y-2">
            <Label htmlFor="meetingLink">Meeting Link (Optional)</Label>
            <Input
              id="meetingLink"
              type="url"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="https://zoom.us/j/..."
            />
          </div>

          {/* Member Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Invite Members</Label>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={selectAll}>
                  Select All
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={deselectAll}>
                  Clear
                </Button>
              </div>
            </div>

            {members.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No other members in this group
              </p>
            ) : (
              <div className="border rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
                {members.map((member) => (
                  <div key={member.userId} className="flex items-center gap-2">
                    <Checkbox
                      id={`member-${member.userId}`}
                      checked={selectedUserIds.includes(member.userId)}
                      onCheckedChange={() => toggleMember(member.userId)}
                    />
                    <Label
                      htmlFor={`member-${member.userId}`}
                      className="flex-1 cursor-pointer"
                    >
                      {member.userName}
                    </Label>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              {selectedUserIds.length} member(s) selected
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Session'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
