import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, Globe, Lock, Key } from 'lucide-react';

export interface GroupCardProps {
  name: string;
  description: string;
  course: string;
  privacy: 'public' | 'private';
  members?: number;
  maxMembers?: number;
  onJoin?: (password?: string) => void; // UI only
  onRequest?: () => void; // UI only for private groups
  joinDisabled?: boolean;
}

export default function GroupCard({
  name,
  description,
  course,
  privacy,
  members,
  maxMembers,
  onJoin,
  onRequest,
  joinDisabled,
}: GroupCardProps) {
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [showRequestDialog, setShowRequestDialog] = useState(false);

  const handleJoinClick = () => {
    if (privacy === 'private') {
      setShowPasswordDialog(true);
    } else {
      onJoin?.();
    }
  };

  const handleRequestClick = () => {
    setShowRequestDialog(true);
  };

  const handlePasswordSubmit = () => {
    onJoin?.(password);
    setShowPasswordDialog(false);
    setPassword('');
  };

  const handleRequestSubmit = () => {
    onRequest?.();
    setShowRequestDialog(false);
  };
  return (
    <Card className="academic-card hover-lift">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{name}</CardTitle>
            {privacy === 'private' ? (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Lock className="w-3 h-3" /> Private
              </Badge>
            ) : (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Globe className="w-3 h-3" /> Public
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>
              {members ?? 0}
              {maxMembers ? ` / ${maxMembers}` : ''}
            </span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{course}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="flex justify-end gap-2">
          {privacy === 'public' ? (
            <Button size="sm" variant="outline" onClick={handleJoinClick} disabled={joinDisabled}>
              Join
            </Button>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={handleJoinClick} disabled={joinDisabled}>
                <Key className="w-4 h-4 mr-1" />
                Join with Password
              </Button>
              <Button size="sm" variant="secondary" onClick={handleRequestClick} disabled={joinDisabled}>
                Request to Join
              </Button>
            </>
          )}
        </div>
      </CardContent>

      {/* Password Dialog for Private Groups */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Join Private Group
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This is a private group. Please enter the group password to join.
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium">Group Password</label>
              <Input
                type="password"
                placeholder="Enter group password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePasswordSubmit} disabled={!password.trim()}>
              Join Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request to Join Dialog for Private Groups */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Request to Join Group
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This is a private group. Your request will be sent to the group administrator for approval.
            </p>
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium text-sm mb-2">Group: {name}</h4>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRequestSubmit}>
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}


