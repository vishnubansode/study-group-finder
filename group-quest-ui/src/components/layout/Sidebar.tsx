import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  MessageCircle, 
  ChevronDown, 
  ChevronRight,
  Hash,
  Circle,
  Plus
} from 'lucide-react';

const activeGroups = [
  { id: 1, name: 'CS 101 Study Group', members: 12, activity: 'high' },
  { id: 2, name: 'Math Calculus Help', members: 8, activity: 'medium' },
  { id: 3, name: 'History Project Team', members: 5, activity: 'low' },
];

const activeChats = [
  { id: 1, name: 'General Discussion', unread: 3 },
  { id: 2, name: 'Assignment Help', unread: 0 },
  { id: 3, name: 'Study Session Planning', unread: 7 },
];

export function Sidebar() {
  const [groupsExpanded, setGroupsExpanded] = useState(true);
  const [chatsExpanded, setChatsExpanded] = useState(true);
  const location = useLocation();

  const getActivityColor = (activity: string) => {
    switch (activity) {
      case 'high': return 'bg-accent';
      case 'medium': return 'bg-secondary';
      case 'low': return 'bg-muted-foreground';
      default: return 'bg-muted-foreground';
    }
  };

  return (
    <div className="hidden lg:flex w-64 bg-card border-r border-border h-screen fixed left-0 top-16 z-30">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="space-y-2">
            <Button className="w-full btn-academic" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
            <Button variant="outline" className="w-full" size="sm">
              <Users className="w-4 h-4 mr-2" />
              Find Groups
            </Button>
          </div>

          {/* Active Groups */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-between p-2 h-auto"
              onClick={() => setGroupsExpanded(!groupsExpanded)}
            >
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span className="font-medium">My Groups</span>
              </div>
              {groupsExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>

            {groupsExpanded && (
              <div className="space-y-1 ml-2">
                {activeGroups.map((group) => (
                  <Link
                    key={group.id}
                    to={`/groups/${group.id}`}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted transition-colors group"
                  >
                    <div className={`w-2 h-2 rounded-full ${getActivityColor(group.activity)}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {group.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {group.members} members
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}