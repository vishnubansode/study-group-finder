import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import EventForm from './EventForm';

interface Props {
  session: any;
  onSaved?: (updated: any) => void;
  onDeleted?: () => void;
}

export default function SessionEditDialog({ session, onSaved, onDeleted }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
          <Edit className="w-4 h-4 mr-1" />
          Edit
        </Button>
      </div>

      <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Edit Session</DialogTitle>
        </DialogHeader>
        <EventForm
          mode="edit"
          initial={session}
          onSaved={(u) => { setOpen(false); onSaved?.(u); }}
          onDeleted={() => { setOpen(false); onDeleted?.(); }}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
