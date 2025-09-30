import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Hash, 
  Users, 
  Search,
  MoreVertical,
  Plus,
  Smile,
  Paperclip,
  Phone,
  Video,
  Info
} from 'lucide-react';

const chatChannels = [
  { id: 1, name: 'general', type: 'text', unread: 0, members: 15 },
  { id: 2, name: 'assignments', type: 'text', unread: 3, members: 12 },
  { id: 3, name: 'study-sessions', type: 'text', unread: 7, members: 8 },
  { id: 4, name: 'resources', type: 'text', unread: 0, members: 15 },
];

const messages = [
  {
    id: 1,
    user: 'Sarah Chen',
    avatar: 'SC',
    message: 'Hey everyone! Just uploaded the study guide for Chapter 5. Check it out in #resources',
    timestamp: '10:30 AM',
    type: 'text'
  },
  {
    id: 2,
    user: 'Mike Johnson',
    avatar: 'MJ',
    message: 'Thanks Sarah! This is super helpful. Anyone want to form a study group for tomorrow?',
    timestamp: '10:32 AM',
    type: 'text'
  },
  {
    id: 3,
    user: 'Alex Johnson',
    avatar: 'AJ',
    message: 'I\'m in! What time works for everyone?',
    timestamp: '10:35 AM',
    type: 'text'
  },
  {
    id: 4,
    user: 'Emma Davis',
    avatar: 'ED',
    message: '2 PM at the library would be perfect for me',
    timestamp: '10:37 AM',
    type: 'text'
  },
  {
    id: 5,
    user: 'Sarah Chen',
    avatar: 'SC',
    message: 'Great! I\'ll create a calendar event and share it',
    timestamp: '10:40 AM',
    type: 'text'
  },
  {
    id: 6,
    user: 'Mike Johnson',
    avatar: 'MJ',
    message: 'Perfect! Looking forward to it 📚',
    timestamp: '10:42 AM',
    type: 'text'
  }
];

const onlineMembers = [
  { name: 'Sarah Chen', avatar: 'SC', status: 'online' },
  { name: 'Mike Johnson', avatar: 'MJ', status: 'online' },
  { name: 'Emma Davis', avatar: 'ED', status: 'away' },
  { name: 'Alex Johnson', avatar: 'AJ', status: 'online' },
  { name: 'John Smith', avatar: 'JS', status: 'offline' },
];

export default function Chat() {
  const [activeChannel, setActiveChannel] = useState(chatChannels[0]);
  const [newMessage, setNewMessage] = useState('');
  const [showMembersList, setShowMembersList] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Handle sending message
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-accent';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-muted-foreground';
      default: return 'bg-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Channels Sidebar */}
      <div className="hidden lg:block w-64 bg-card border-r border-border">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">CS 101 Study Group</h2>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input placeholder="Search channels..." className="pl-10" />
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Text Channels
                </h3>
                <Button variant="ghost" size="icon" className="w-4 h-4">
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              <div className="space-y-1">
                {chatChannels.map((channel) => (
                  <Button
                    key={channel.id}
                    variant={activeChannel.id === channel.id ? "secondary" : "ghost"}
                    className="w-full justify-start px-2 py-1 h-auto"
                    onClick={() => setActiveChannel(channel)}
                  >
                    <Hash className="w-4 h-4 mr-2" />
                    <span className="flex-1 text-left">{channel.name}</span>
                    {channel.unread > 0 && (
                      <Badge variant="destructive" className="text-xs h-5 px-1.5">
                        {channel.unread}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Online — {onlineMembers.filter(m => m.status === 'online').length}
              </h3>
              <div className="space-y-1">
                {onlineMembers.filter(m => m.status === 'online').map((member) => (
                  <div key={member.name} className="flex items-center space-x-2 px-2 py-1 rounded hover:bg-muted transition-colors">
                    <div className="relative">
                      <div className="w-8 h-8 bg-gradient-secondary rounded-full flex items-center justify-center text-xs font-medium">
                        {member.avatar}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${getStatusColor(member.status)}`} />
                    </div>
                    <span className="text-sm text-foreground">{member.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Hash className="w-5 h-5 text-muted-foreground" />
              <div>
                <h1 className="font-semibold text-foreground">{activeChannel.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {activeChannel.members} members
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon">
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowMembersList(!showMembersList)}
              >
                <Users className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Info className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex">
          <div className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="flex items-start space-x-3 hover:bg-muted/50 px-3 py-2 rounded-lg transition-colors">
                    <div className="w-10 h-10 bg-gradient-secondary rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {message.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-foreground">{message.user}</span>
                        <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                      </div>
                      <p className="text-sm text-foreground break-words">{message.message}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t border-border p-4">
              <div className="flex items-end space-x-3">
                <div className="flex-1 relative">
                  <Input
                    placeholder={`Message #${activeChannel.name}`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pr-20"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                    <Button variant="ghost" size="icon" className="w-8 h-8">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-8 h-8">
                      <Smile className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="btn-academic"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Members List (when expanded) */}
          {showMembersList && (
            <div className="w-60 bg-card border-l border-border">
              <div className="p-4 border-b border-border">
                <h3 className="font-medium text-foreground">Members</h3>
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {onlineMembers.map((member) => (
                    <div key={member.name} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted transition-colors">
                      <div className="relative">
                        <div className="w-8 h-8 bg-gradient-secondary rounded-full flex items-center justify-center text-sm font-medium">
                          {member.avatar}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${getStatusColor(member.status)}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{member.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{member.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}