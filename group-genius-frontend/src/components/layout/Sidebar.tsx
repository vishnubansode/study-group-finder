import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Plus, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function Sidebar() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="hidden lg:flex w-64 bg-card border-r border-border h-screen fixed left-0 top-16 z-30">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          <div className="space-y-2">
            <Button className="w-full btn-academic" size="sm" disabled>
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
            <Button variant="outline" className="w-full" size="sm" asChild>
              <Link to="/groups">
                <Users className="w-4 h-4 mr-2" />
                Browse Groups
              </Link>
            </Button>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">No groups yet</h3>
            <p className="text-sm text-muted-foreground">
              Once you join or create a study group, it&apos;ll be listed here for quick access.
            </p>
          </div>

          <div className="p-4 bg-gradient-accent rounded-lg text-white">
            <h3 className="text-sm font-semibold mb-2">Stay tuned</h3>
            <p className="text-xs opacity-90">
              Group chat and meeting shortcuts will be available as soon as data is connected to the backend.
            </p>
            <Button variant="secondary" size="sm" className="mt-3 bg-white text-accent hover:bg-white/90" disabled>
              <MessageCircle className="w-4 h-4 mr-2" />
              Open Chat
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}