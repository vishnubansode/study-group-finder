import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { sessionInvitationAPI, SessionInvitation } from '@/lib/api/sessionInvitationApi';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

export default function SessionInvitationList() {
  const { user } = useAuth();
  const [pendingInvitations, setPendingInvitations] = useState<SessionInvitation[]>([]);
  const [declinedInvitations, setDeclinedInvitations] = useState<SessionInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    void loadInvitations();
  }, [user]);

  const loadInvitations = async () => {
    if (!user) {
      setPendingInvitations([]);
      setDeclinedInvitations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [pending, declined] = await Promise.all([
        sessionInvitationAPI.getPendingInvitations(user.id),
        sessionInvitationAPI.getDeclinedInvitations(user.id),
      ]);
      setPendingInvitations(pending);
      setDeclinedInvitations(declined);
    } catch (error) {
      console.error('Failed to load invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (invitationId: number) => {
    if (!user) return;

    try {
      setProcessingId(invitationId);
      const accepted = pendingInvitations.find(inv => inv.id === invitationId) || null;
      await sessionInvitationAPI.acceptInvitation(invitationId, user.id);
      setPendingInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      if (accepted) {
        try {
          window.dispatchEvent(new CustomEvent('session:participation-change', {
            detail: { sessionId: accepted.sessionId, action: 'accepted' }
          }));
        } catch {/* noop */}
      }
    } catch (error) {
      console.error('Failed to accept invitation:', error);
      alert('Failed to accept invitation');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (invitationId: number) => {
    if (!user) return;

    try {
      setProcessingId(invitationId);
      const declined = pendingInvitations.find(inv => inv.id === invitationId) || null;
      await sessionInvitationAPI.declineInvitation(invitationId, user.id);
      setPendingInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      if (declined) {
        setDeclinedInvitations(prev => [declined, ...prev.filter(inv => inv.id !== invitationId)]);
      }
    } catch (error) {
      console.error('Failed to decline invitation:', error);
      alert('Failed to decline invitation');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejoin = async (invitationId: number) => {
    if (!user) return;

    try {
      setProcessingId(invitationId);
      const rejoining = declinedInvitations.find(inv => inv.id === invitationId) || null;
      await sessionInvitationAPI.rejoinInvitation(invitationId, user.id);
      setDeclinedInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      if (rejoining) {
        try {
          window.dispatchEvent(new CustomEvent('session:participation-change', {
            detail: { sessionId: rejoining.sessionId, action: 'rejoined' }
          }));
        } catch {/* noop */}
      }
    } catch (error) {
      console.error('Failed to rejoin invitation:', error);
      alert('Failed to rejoin invitation');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Session Invitations</h2>
          <Badge variant="secondary">{pendingInvitations.length}</Badge>
        </div>

        {pendingInvitations.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No pending invitations</CardTitle>
              <CardDescription>Accepting an invite automatically adds the session to your calendar.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="space-y-3">
            {pendingInvitations.map((invitation) => (
              <Card key={invitation.id} className="border border-border/50 hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{invitation.sessionTitle}</CardTitle>
                      <CardDescription className="mt-1">
                        in <span className="font-medium">{invitation.groupName}</span>
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-primary/10">
                      Pending
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {invitation.sessionDescription && (
                    <p className="text-sm text-muted-foreground">{invitation.sessionDescription}</p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(invitation.sessionStartTime), 'MMM d, yyyy')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        {format(new Date(invitation.sessionStartTime), 'h:mm a')} -
                        {format(new Date(invitation.sessionEndTime), 'h:mm a')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Invited by {invitation.invitedByName}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleAccept(invitation.id)}
                      disabled={processingId === invitation.id}
                      className="flex-1"
                      size="sm"
                    >
                      {processingId === invitation.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Accept
                    </Button>

                    <Button
                      onClick={() => handleDecline(invitation.id)}
                      disabled={processingId === invitation.id}
                      variant="outline"
                      className="flex-1"
                      size="sm"
                    >
                      {processingId === invitation.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      Decline
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <span>Declined Invitations</span>
          </h3>
          <Badge variant="outline">{declinedInvitations.length}</Badge>
        </div>

        {declinedInvitations.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No declined invitations</CardTitle>
              <CardDescription>Declined sessions appear here so you can rejoin later.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="space-y-3">
            {declinedInvitations.map((invitation) => (
              <Card key={`declined-${invitation.id}`} className="border border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{invitation.sessionTitle}</CardTitle>
                      <CardDescription className="mt-1 text-sm">
                        Declined on {format(new Date(invitation.respondedAt ?? invitation.invitedAt), 'MMM d, yyyy p')}
                      </CardDescription>
                    </div>
                    <Badge variant="destructive" className="bg-destructive/10 text-destructive">
                      Declined
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(invitation.sessionStartTime), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        {format(new Date(invitation.sessionStartTime), 'h:mm a')} -
                        {format(new Date(invitation.sessionEndTime), 'h:mm a')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Invited by {invitation.invitedByName}</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleRejoin(invitation.id)}
                    disabled={processingId === invitation.id}
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    {processingId === invitation.id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Rejoin Session
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
