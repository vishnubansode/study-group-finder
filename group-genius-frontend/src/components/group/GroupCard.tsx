import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, Globe, Lock, Key, Calendar } from 'lucide-react';

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
    <Card className="group h-full flex flex-col overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 bg-white">
      {/* Colored Header Bar with Privacy Status */}
      <div className={`relative h-2 ${privacy === 'private' ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-emerald-400 to-teal-500'}`}>
        <div className="absolute -bottom-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-50" />
      </div>

      <CardHeader className="pb-3 pt-5 px-6">
        {/* Title and Privacy Badge Row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <CardTitle className="text-lg sm:text-xl font-bold leading-tight line-clamp-2 flex-1">
            {name}
          </CardTitle>
          <Badge 
            variant="outline" 
            className={`shrink-0 ${
              privacy === 'private' 
                ? 'border-amber-300 text-amber-700 bg-amber-50' 
                : 'border-emerald-300 text-emerald-700 bg-emerald-50'
            }`}
          >
            {privacy === 'private' ? (
              <><Lock className="w-3 h-3 mr-1" />Private</>
            ) : (
              <><Globe className="w-3 h-3 mr-1" />Public</>
            )}
          </Badge>
        </div>

        {/* Course Info */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-slate-100 px-3 py-1.5 rounded-md">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span className="font-medium truncate">{course}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 px-6 pb-6">
        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">
          {description}
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
                  {members ?? 0}{maxMembers ? ` / ${maxMembers}` : ''}
                </p>
              </div>
            </div>
            {maxMembers && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Capacity</p>
                <p className="text-sm font-bold text-primary">
                  {Math.round(((members ?? 0) / maxMembers) * 100)}%
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto">
          {privacy === 'public' ? (
            <Button 
              size="lg"
              className="w-full font-semibold text-base shadow-md hover:shadow-lg transition-all group-hover:scale-[1.02]" 
              onClick={handleJoinClick} 
              disabled={joinDisabled}
            >
              Join Group
            </Button>
          ) : (
            <div className="space-y-2">
              <Button 
                size="lg"
                onClick={handleJoinClick} 
                disabled={joinDisabled}
                className="w-full font-semibold text-base shadow-md hover:shadow-lg transition-all"
              >
                <Key className="w-4 h-4 mr-2" />
                Join with Password
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={handleRequestClick} 
                disabled={joinDisabled}
                className="w-full font-semibold text-base border-2 hover:bg-slate-50"
              >
                Request to Join
              </Button>
            </div>
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


