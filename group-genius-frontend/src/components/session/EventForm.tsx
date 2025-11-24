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
  
  // Parse initial date and times from the session data
  const parseInitialDateTime = () => {
    if (!initial?.raw?.date && !initial?.date) return { date: '', startTime: '', endTime: '' };
    const dateStr = initial.raw?.date || initial.date || '';
    const startTimeStr = initial.raw?.startTime || initial.startTime || '';
    const endTimeStr = initial.raw?.endTime || initial.endTime || '';
    return { date: dateStr, startTime: startTimeStr, endTime: endTimeStr };
  };
  
  const initialDateTime = parseInitialDateTime();
  const [date, setDate] = useState(initialDateTime.date);
  const [startTime, setStartTime] = useState(initialDateTime.startTime);
  const [endTime, setEndTime] = useState(initialDateTime.endTime);
  const [meetingLink, setMeetingLink] = useState(initial?.meetingLink || '');

  const [durationDays, setDurationDays] = useState<number>(() => {
    const rawDur = initial?.raw?.durationDays ?? initial?.durationDays;
    return typeof rawDur === 'number' ? rawDur : 1;
  });
  const [loading, setLoading] = useState(false);

  // Compute earliest allowed start (now +1h rounded up to next 30-minute slot)
  const computeEarliestStart = () => {
    const now = new Date();
    const earliest = new Date(now.getTime() + 60 * 60 * 1000);
    const mins = earliest.getMinutes();
    const rem = mins % 30;
    if (rem !== 0) earliest.setMinutes(mins + (30 - rem));
    earliest.setSeconds(0, 0);
    return earliest;
  };

  const toDateString = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const toTimeString = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const earliestStart = computeEarliestStart();
  const minDateString = toDateString(earliestStart);
  const minTimeString = toTimeString(earliestStart);

  const handleCreate = async () => {
    setLoading(true);
    try {
      if (!date || !startTime || !endTime) {
        alert('Please provide date, start time, and end time.');
        setLoading(false);
        return;
      }

      // Validate earliest allowed start
      const chosenDateTime = new Date(`${date}T${startTime}`);
      const endDateTime = new Date(`${date}T${endTime}`);
      const minAllowed = computeEarliestStart();
      
      if (chosenDateTime.getTime() < minAllowed.getTime()) {
        alert('Start time must be at least 1 hour from now (rounded to the next 30-minute slot). Please choose a later time.');
        setLoading(false);
        return;
      }
      
      if (endDateTime <= chosenDateTime) {
        alert('End time must be later than start time.');
        setLoading(false);
        return;
      }

      const payload = {
        title,
        description,
        date, // YYYY-MM-DD
        startTime, // HH:mm
        endTime, // HH:mm
        durationDays: Number(durationDays) || 1,
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
      if (!date || !startTime || !endTime) {
        alert('Please provide date, start time, and end time.');
        setLoading(false);
        return;
      }

      // Validate earliest allowed start for updates as well
      const chosenDateTime = new Date(`${date}T${startTime}`);
      const endDateTime = new Date(`${date}T${endTime}`);
      const minAllowed = computeEarliestStart();
      
      if (chosenDateTime.getTime() < minAllowed.getTime()) {
        alert('Start time must be at least 1 hour from now (rounded to the next 30-minute slot). Please choose a later time.');
        setLoading(false);
        return;
      }
      
      if (endDateTime <= chosenDateTime) {
        alert('End time must be later than start time.');
        setLoading(false);
        return;
      }

      const payload = {
        title,
        description,
        date, // YYYY-MM-DD
        startTime, // HH:mm
        endTime, // HH:mm
        durationDays: Number(durationDays) || 1,
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
          <label className="text-sm font-medium">Date</label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={minDateString} />
        </div>
        <div>
          <label className="text-sm font-medium">Duration (days)</label>
          <Input type="number" min={1} value={String(durationDays)} onChange={(e) => setDurationDays(Number(e.target.value) || 1)} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Start Time</label>
          <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">End Time</label>
          <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
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
