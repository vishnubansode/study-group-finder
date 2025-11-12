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
  const [meetingLink, setMeetingLink] = useState(initial?.meetingLink || '');

  const computeDurationDaysFromTimes = (s?: string, e?: string) => {
    if (!s || !e) return 1;
    try {
      const sd = new Date(s);
      const ed = new Date(e);
      const diff = ed.getTime() - sd.getTime();
      const days = Math.ceil(diff / (24 * 60 * 60 * 1000));
      return days >= 1 ? days : 1;
    } catch (ex) {
      return 1;
    }
  };
  const [durationDays, setDurationDays] = useState<number>(() => {
    const rawDur = initial?.raw?.durationDays ?? initial?.durationDays;
    if (typeof rawDur === 'number') return rawDur;
    return computeDurationDaysFromTimes(initial?.startTime, initial?.endTime);
  });
  const [loading, setLoading] = useState(false);

  function toInputDateTime(dt: string) {
    // Convert server datetime to yyyy-MM-ddTHH:mm for datetime-local input.
    // If server string includes timezone (Z or +/-HH:MM), parse as UTC and convert to local.
    // If server string has no timezone, treat it as local already.
    if (!dt) return '';
    // if server returns a timezone-less local string (no Z or offset), interpret it as local
    if (typeof dt === 'string' && !dt.includes('Z') && !dt.match(/\+\d{2}:?\d{2}|-\d{2}:?\d{2}/)) {
      const parts = dt.split(/[T ]/);
      if (parts.length >= 2) {
        const dateParts = parts[0].split('-').map(Number);
        const timeParts = parts[1].split(':').map(Number);
        const dtObj = new Date(dateParts[0], (dateParts[1] || 1) - 1, dateParts[2] || 1, timeParts[0] || 0, timeParts[1] || 0);
        return toDatetimeLocal(dtObj);
      }
    }
    const parsed = typeof dt === 'string' ? new Date(dt) : new Date(dt);
    return toDatetimeLocal(parsed);
  }

  // Compute earliest allowed start (now +1h rounded up to next 30-minute slot)
  const computeEarliestStart = () => {
    const now = new Date();
    const earliest = new Date(now.getTime() + 60 * 60 * 1000);
    const mins = earliest.getMinutes();
    const rem = mins % 30;
    if (rem !== 0) earliest.setMinutes(mins + (30 - rem));
    earliest.setSeconds(0,0);
    return earliest;
  };

  function toDatetimeLocal(d: Date) {
    const pad = (n: number) => String(n).padStart(2, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  const earliestStartString = toDatetimeLocal(computeEarliestStart());

  const formatWithOffset = (localDatetime: string) => {
    if (!localDatetime) return localDatetime;
    const base = localDatetime.length === 16 ? `${localDatetime}:00` : localDatetime;
    const offsetMinutes = -new Date().getTimezoneOffset();
    const sign = offsetMinutes >= 0 ? '+' : '-';
    const abs = Math.abs(offsetMinutes);
    const hh = String(Math.floor(abs / 60)).padStart(2, '0');
    const mm = String(abs % 60).padStart(2, '0');
    return `${base}${sign}${hh}:${mm}`;
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      // Validate earliest allowed start
      const chosen = start ? new Date(start) : null;
      const minAllowed = computeEarliestStart();
      if (!chosen || chosen.getTime() < minAllowed.getTime()) {
        alert('Start time must be at least 1 hour from now (rounded to the next 30-minute slot). Please choose a later time.');
        setLoading(false);
        return;
      }
      const payload = {
        title,
        description,
        // keep local wall-clock and append timezone offset so backend receives the intended instant
        startTime: start ? formatWithOffset(start) : start,
        // local wall-clock value without offset
        startTimeLocal: start || null,
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
      // Validate earliest allowed start for updates as well
      const chosen = start ? new Date(start) : null;
      const minAllowed = computeEarliestStart();
      if (!chosen || chosen.getTime() < minAllowed.getTime()) {
        alert('Start time must be at least 1 hour from now (rounded to the next 30-minute slot). Please choose a later time.');
        setLoading(false);
        return;
      }
      const payload = {
        title,
        description,
        startTime: start ? formatWithOffset(start) : start,
        startTimeLocal: start || null,
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
          <label className="text-sm font-medium">Start</label>
          <Input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} min={earliestStartString} />
        </div>
        <div>
          <label className="text-sm font-medium">Duration (days)</label>
          <Input type="number" min={1} value={String(durationDays)} onChange={(e) => setDurationDays(Number(e.target.value) || 1)} />
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
