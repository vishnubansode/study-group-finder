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
    durationDays: 1,
    meetingLink: '',
  });

  // Compute earliest allowed start: now + 1 hour, rounded up to the next 30-minute slot.
  const computeEarliestStart = () => {
    const now = new Date();
    const earliest = new Date(now.getTime() + 60 * 60 * 1000); // +1 hour
    // Round up to next 30-minute increment
    const mins = earliest.getMinutes();
    const rem = mins % 30;
    if (rem !== 0) {
      earliest.setMinutes(mins + (30 - rem));
    }
    earliest.setSeconds(0, 0);
    return earliest;
  };

  const toDatetimeLocal = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // min value for datetime-local input
  const earliestStart = computeEarliestStart();
  const earliestStartString = toDatetimeLocal(earliestStart);

  useEffect(() => {
    if (!open || !user) return;
    (async () => {
      setLoadingGroups(true);
      try {
        const token = localStorage.getItem('token');
        // fetch groups where user is a member (use searchGroups with userId and filterByMembership=true)
        const res = await groupAPI.searchGroups(token, { userId: user.id, size: 100, filterByMembership: true });
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
    typeof values.groupId === 'number' && values.title.trim().length > 0 && values.start.trim().length > 0 && Number(values.durationDays) >= 1;

  const handleSubmit = async () => {
    if (!isValid || !user || !values.groupId) return;
    try {
      // Validate earliest allowed start
      const chosen = values.start ? new Date(values.start) : null;
      const minAllowed = computeEarliestStart();
      if (!chosen || chosen.getTime() < minAllowed.getTime()) {
        alert('Start time must be at least 1 hour from now (rounded to the next 30-minute slot). Please choose a later time.');
        return;
      }
      // Backend expects LocalDateTime-like strings; datetime-local produces e.g. 2024-11-07T14:00
      const formatWithOffset = (localDatetime: string) => {
        // localDatetime expected 'YYYY-MM-DDTHH:mm'
        if (!localDatetime) return localDatetime;
        // ensure seconds
        const base = localDatetime.length === 16 ? `${localDatetime}:00` : localDatetime;
        const offsetMinutes = -new Date().getTimezoneOffset(); // minutes east of UTC
        const sign = offsetMinutes >= 0 ? '+' : '-';
        const abs = Math.abs(offsetMinutes);
        const hh = String(Math.floor(abs / 60)).padStart(2, '0');
        const mm = String(abs % 60).padStart(2, '0');
        return `${base}${sign}${hh}:${mm}`; // e.g. 2025-11-13T05:00:00-05:00
      };

      const payload = {
        groupId: values.groupId,
        title: values.title,
        description: values.description,
        // send local datetime with explicit timezone offset to avoid server/client ambiguity
        startTime: values.start ? formatWithOffset(values.start) : values.start,
        // include local wall-clock form so server can choose to preserve local date/time if desired
        startTimeLocal: values.start || null,
        durationDays: Number(values.durationDays) || 1,
        createdById: user.id,
        meetingLink: values.meetingLink || null,
      };

      const created = await sessionAPI.createSession(values.groupId, user.id, payload);
      console.log('Session created', created);
      onCreated?.(created);
      setOpen(false);
      setValues({ groupId: undefined, title: '', description: '', start: '', durationDays: 1, meetingLink: '' });
    } catch (err: any) {
      console.error('Failed to create session', err);
      alert(err?.message || 'Failed to create session');
    }
  };

  // When dialog opens, default start to earliest allowed slot if empty
  useEffect(() => {
    if (!open) return;
    const es = computeEarliestStart();
    setValues((v) => ({ ...v, start: v.start || toDatetimeLocal(es) }));
  }, [open]);

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
              <Input
                type="datetime-local"
                value={values.start}
                onChange={(e) => setValues((v) => ({ ...v, start: e.target.value }))}
                min={toDatetimeLocal(computeEarliestStart())}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Duration (days)</label>
              <Input type="number" min={1} value={String(values.durationDays)} onChange={(e) => setValues((v) => ({ ...v, durationDays: Number(e.target.value) }))} />
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
