import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Plus, ArrowLeft } from "lucide-react";
import ChatContainer from "@/components/Chat/ChatContainer";
import { groupAPI } from '@/lib/api/groupApi';
import { chatAPI } from '@/lib/api/chatApi';
import { tokenService } from '@/services/api';
import { useAuth } from "@/contexts/AuthContext";

export default function Chat() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [initialMessages, setInitialMessages] = useState<any[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [search, setSearch] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const loadGroups = async () => {
      setIsLoadingGroups(true);
      try {
        const token = tokenService.getToken();

        if (!token || !user?.id) {
          setGroups([]);
          return;
        }

        const res = await groupAPI.searchGroups(token, { userId: user.id });
        const normalized = Array.isArray(res)
          ? res.map((g: any) => ({
              id: g.groupId ?? g.id,
              name: g.groupName ?? g.name,
              lastMessagePreview: g.lastMessagePreview ?? g.last_message_preview ?? '',
              unreadCount: g.unreadCount ?? g.unread_count ?? 0,
              membershipStatus: g.membershipStatus ?? g.membership_status ?? null,
              createdBy: g.createdBy ?? g.ownerId ?? g.owner_id ?? null,
              raw: g,
            }))
          : [];

        const joinedOnly = normalized.filter((g: any) => {
          const isOwner = g.createdBy && user?.id && g.createdBy === user.id;
          const isApproved = g.membershipStatus === 'APPROVED';
          return isOwner || isApproved;
        });

        setGroups(joinedOnly);
      } catch (err) {
        console.error('Failed to load groups', err);
        setGroups([]);
      } finally {
        setIsLoadingGroups(false);
      }
    };

    loadGroups();
  }, [user?.id]);

  // Restore last selected group after groups load
  useEffect(() => {
    if (!groups.length) return;
    const last = localStorage.getItem('sgf:lastChatGroupId');
    const lastId = last ? Number(last) : null;
    if (lastId && groups.some(g => g.id === lastId) && !selectedGroupId) {
      void openGroupById(lastId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups]);

  const openGroupById = useCallback(async (groupId: number) => {
    try {
      setIsLoadingHistory(true);
      const token = tokenService.getToken();
      const history = token ? await chatAPI.getHistory(token, groupId) : [];
      setInitialMessages(history || []);
      setSelectedGroupId(groupId);
      localStorage.setItem('sgf:lastChatGroupId', String(groupId));
    } catch (err) {
      console.error('Failed to load chat history', err);
      setInitialMessages([]);
      setSelectedGroupId(groupId);
      localStorage.setItem('sgf:lastChatGroupId', String(groupId));
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  const visibleGroups = groups.filter(g => (g.name || '').toLowerCase().includes(search.toLowerCase()));
  const selectedGroup = groups.find(g => g.id === selectedGroupId) || null;
  // Full-page flow: show either the groups list OR the chat view

  return (
    <div className="w-full px-4 md:px-6 py-4">
      {/* When no group selected, show the full-page groups list */}
      {!selectedGroupId && ( 
        <Card className="h-[85vh] flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Users className="w-4 h-4" /> Groups</CardTitle>
              <Button size="sm" asChild>
                <Link to="/groups"><Plus className="w-4 h-4" /></Link>
              </Button>
            </div>
            <CardDescription className="text-xs">Your joined study groups</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <div className="flex flex-col h-full">
              <div className="p-3 border-b flex items-center gap-2">
                <input
                  placeholder="Search groups"
                  className="flex-1 px-3 py-2 border rounded-md"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="p-3 flex-1 overflow-y-auto">
                {isLoadingGroups ? (
                  <div className="p-4 text-sm text-muted-foreground">Loading groups...</div>
                ) : visibleGroups.length ? (
                  <ul className="space-y-2">
                    {visibleGroups.map((g) => (
                      <li key={g.id}>
                        <button
                          onClick={() => openGroupById(g.id)}
                          className={`w-full text-left p-3 rounded hover:bg-accent/5 flex items-center gap-3 ${selectedGroupId === g.id ? 'bg-accent/10' : ''}`}
                        >
                          <Avatar className="w-10 h-10"><AvatarFallback>{g.name?.[0]}</AvatarFallback></Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold truncate">{g.name}</div>
                            <div className="text-xs text-muted-foreground truncate">{g.lastMessagePreview || 'No messages yet'}</div>
                          </div>
                          {g.unreadCount > 0 && (
                            <div className="text-xs bg-red-600 text-white rounded-full px-2">{g.unreadCount}</div>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-sm text-muted-foreground">
                    {user?.id
                      ? 'You have no groups yet. Create or join a group to start chatting.'
                      : 'Sign in to see your joined groups here.'}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* When a group is selected, show the full-page chat view */}
      {selectedGroupId && (
        <Card className="h-[85vh] flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedGroupId(null)}
                  aria-label="Back to groups"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <Avatar className="w-10 h-10"><AvatarFallback>{selectedGroup?.name?.[0] ?? 'G'}</AvatarFallback></Avatar>
                <div>
                  <div className="font-semibold">{selectedGroup ? selectedGroup.name : 'Select a group'}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{isConnected ? 'Connected' : 'Connecting...'}</span>
                    <span className={`inline-block w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/groups">Explore Groups</Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="h-full">
              {isLoadingHistory ? (
                <div className="h-full flex items-center justify-center">Loading messages...</div>
              ) : (
                <ChatContainer
                  groupId={selectedGroupId}
                  username={user?.firstName || user?.email || 'Guest'}
                  userId={user?.id}
                  initialMessages={initialMessages}
                  onConnectionChange={setIsConnected}
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
