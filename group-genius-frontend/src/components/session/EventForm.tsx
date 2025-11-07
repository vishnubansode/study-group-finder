import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { sessionAPI } from '@/lib/api/sessionApi';

interface Props {
  mode: 'create' | 'edit';
  initial?: any;
  onSaved?: (data: any) => void;
  onDeleted?: () => void;
  onCancel?: () => void;
}

export default function EventForm({ mode, initial, onSaved, onDeleted, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [start, setStart] = useState(() => initial?.startTime ? toInputDateTime(initial.startTime) : '');
  const [end, setEnd] = useState(() => initial?.endTime ? toInputDateTime(initial.endTime) : '');
  const [meetingLink, setMeetingLink] = useState(initial?.meetingLink || '');
  const [loading, setLoading] = useState(false);

  function toInputDateTime(dt: string) {
    // backend sends ISO; convert to yyyy-MM-ddTHH:mm for datetime-local
    const d = new Date(dt);
    const iso = new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString();
    return iso.slice(0,16);
  }

  const handleCreate = async () => {
    setLoading(true);
    try {
      const payload = {
        title,
        description,
        startTime: start,
        endTime: end || null,
        meetingLink: meetingLink || null,
      };
      // For create, initial must include groupId and createdById
      const created = await sessionAPI.createSession(initial.groupId, initial.createdById, payload);
      onSaved?.(created);
    } catch (err) {
      console.error(err);
      alert((err as any)?.message || 'Failed to create session');
    } finally { setLoading(false); }
  };

  const handleUpdate = async () => {
    if (!initial?.id) return;
    setLoading(true);
    try {
      const payload = {
        title,
        description,
        startTime: start,
        endTime: end || null,
        meetingLink: meetingLink || null,
      };
      const updated = await sessionAPI.updateSession(initial.id, payload);
      onSaved?.(updated);
    } catch (err) {
      console.error(err);
      alert((err as any)?.message || 'Failed to update session');
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!initial?.id) return;
    if (!confirm('Delete this session?')) return;
    setLoading(true);
    try {
      await sessionAPI.deleteSession(initial.id);
      onDeleted?.();
    } catch (err) {
      console.error(err);
      alert((err as any)?.message || 'Failed to delete session');
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <label className="text-sm font-medium">Title</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Start</label>
          <Input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">End</label>
          <Input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Meeting Link</label>
        <Input value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} />
      </div>

      <div className="flex items-center gap-2">
        {mode === 'create' ? (
          <Button onClick={handleCreate} disabled={loading}>{loading ? 'Creating...' : 'Create'}</Button>
        ) : (
          <>
            <Button onClick={handleUpdate} disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>Delete</Button>
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
          </>
        )}
      </div>
    </div>
  );
}
