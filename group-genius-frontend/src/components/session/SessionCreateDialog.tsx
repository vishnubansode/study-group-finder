import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { groupAPI } from '@/lib/api/groupApi';
import { sessionAPI } from '@/lib/api/sessionApi';

interface Props {
  onCreated?: (created: any) => void;
}

export function SessionCreateDialog({ onCreated }: Props) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [groups, setGroups] = useState<Array<any>>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  const [values, setValues] = useState({
    groupId: undefined as number | undefined,
    title: '',
    description: '',
    start: '', // datetime-local
    end: '',
    meetingLink: '',
  });

  useEffect(() => {
    if (!open || !user) return;
    (async () => {
      setLoadingGroups(true);
      try {
        const token = localStorage.getItem('token');
        // fetch groups where user is a member (use searchGroups with userId)
        const res = await groupAPI.searchGroups(token, { userId: user.id, size: 100 });
        setGroups(Array.isArray(res) ? res : []);
        if (Array.isArray(res) && res.length > 0) {
          setValues((v) => (v.groupId ? v : { ...v, groupId: res[0].groupId || res[0].id }));
        }
      } catch (e) {
        console.error('Failed to load groups for session create', e);
        setGroups([]);
      } finally {
        setLoadingGroups(false);
      }
    })();
  }, [open, user]);

  const isValid =
    typeof values.groupId === 'number' && values.title.trim().length > 0 && values.start.trim().length > 0;

  const handleSubmit = async () => {
    if (!isValid || !user || !values.groupId) return;
    try {
      // Backend expects LocalDateTime-like strings; datetime-local produces e.g. 2024-11-07T14:00
      const payload = {
        groupId: values.groupId,
        title: values.title,
        description: values.description,
        startTime: values.start,
        endTime: values.end || null,
        createdById: user.id,
        meetingLink: values.meetingLink || null,
      };

      const created = await sessionAPI.createSession(values.groupId, user.id, payload);
      console.log('Session created', created);
      onCreated?.(created);
      setOpen(false);
      setValues({ groupId: undefined, title: '', description: '', start: '', end: '', meetingLink: '' });
    } catch (err: any) {
      console.error('Failed to create session', err);
      alert(err?.message || 'Failed to create session');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-hero">
          <Plus className="w-5 h-5 mr-2" />
          Create Session
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Create a New Session
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Group</label>
            <Select
              value={values.groupId ? String(values.groupId) : ''}
              onValueChange={(val) => setValues((v) => ({ ...v, groupId: val ? Number(val) : undefined }))}
              disabled={loadingGroups}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingGroups ? 'Loading groups...' : 'Select a group'} />
              </SelectTrigger>
              <SelectContent>
                {groups.length > 0 ? (
                  groups.map((g: any) => (
                    <SelectItem key={g.groupId ?? g.id} value={String(g.groupId ?? g.id)}>{g.name || g.groupName || g.title || g.name}</SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-groups" disabled>No groups found</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input placeholder="e.g., CS101 Exam Review" value={values.title} onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea placeholder="Optional description" value={values.description} onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start</label>
              <Input type="datetime-local" value={values.start} onChange={(e) => setValues((v) => ({ ...v, start: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End (optional)</label>
              <Input type="datetime-local" value={values.end} onChange={(e) => setValues((v) => ({ ...v, end: e.target.value }))} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Meeting Link (optional)</label>
            <Input placeholder="Zoom / Meet link" value={values.meetingLink} onChange={(e) => setValues((v) => ({ ...v, meetingLink: e.target.value }))} />
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto">Cancel</Button>
          <Button onClick={handleSubmit} disabled={!isValid} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Create Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SessionCreateDialog;
