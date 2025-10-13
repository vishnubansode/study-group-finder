import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Globe, Lock, Clock } from 'lucide-react';

export interface UIGroupItem {
  id: number | string;
  name: string;
  course: string;
  description?: string;
  members?: number;
  maxMembers?: number;
  privacy: 'public' | 'private';
  activity?: string;
  lastActivity?: string;
  tags?: string[];
}

function getActivityColor(activity?: string) {
  if (!activity) return 'text-muted-foreground';
  const normalized = activity.toLowerCase();
  if (normalized.includes('very')) return 'text-accent';
  if (normalized.includes('high') || normalized.includes('active')) return 'text-primary';
  if (normalized.includes('moderate')) return 'text-secondary';
  return 'text-muted-foreground';
}

interface GroupListProps {
  groups: UIGroupItem[];
}

export default function GroupList({ groups }: GroupListProps) {
  if (!groups.length) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No study groups available yet</h3>
        <p className="text-muted-foreground">Once groups are created, they will appear here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {groups.map((group) => (
        <Card key={group.id} className="academic-card hover-lift">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  {group.privacy === 'private' ? (
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Globe className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{group.course}</p>
                {group.activity && (
                  <div className="flex items-center space-x-2 mb-3">
                    <span className={`text-sm font-medium ${getActivityColor(group.activity)}`}>
                      {group.activity}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {group.description || 'This study group has no description yet.'}
            </p>

            <div className="flex flex-wrap gap-2">
              {group.tags?.length ? (
                group.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">No tags provided</span>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>
                    {group.members ?? 0}
                    {group.maxMembers ? ` / ${group.maxMembers}` : ''}
                  </span>
                </div>
                {group.lastActivity && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{group.lastActivity}</span>
                  </div>
                )}
              </div>

              <Button size="sm" variant="outline" disabled>
                Join
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


