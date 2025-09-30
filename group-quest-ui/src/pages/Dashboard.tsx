import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  BookOpen, 
  MessageCircle, 
  Calendar,
  TrendingUp,
  Clock,
  Target,
  Award,
  Plus,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const recentGroups = [
  { id: 1, name: 'CS 101 Study Group', course: 'Computer Science', members: 12, activity: 'Active now' },
  { id: 2, name: 'Math Calculus Help', course: 'Mathematics', members: 8, activity: '2 hours ago' },
  { id: 3, name: 'History Project Team', course: 'History', members: 5, activity: '1 day ago' },
];

const upcomingEvents = [
  { id: 1, title: 'CS 101 Group Study', time: '2:00 PM Today', type: 'study' },
  { id: 2, title: 'Math Assignment Due', time: 'Tomorrow', type: 'deadline' },
  { id: 3, title: 'History Project Meeting', time: 'Friday 3:00 PM', type: 'meeting' },
];

const suggestedPeers = [
  { id: 1, name: 'Sarah Chen', course: 'Computer Science', match: '95%' },
  { id: 2, name: 'Mike Johnson', course: 'Mathematics', match: '87%' },
  { id: 3, name: 'Emma Davis', course: 'Physics', match: '82%' },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="hero-section px-6 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="heading-hero mb-6">
            Welcome back to GroupGenius
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with study groups, collaborate on projects, and achieve academic excellence together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="btn-hero">
              <Plus className="w-5 h-5 mr-2" />
              Create Study Group
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-4">
              <Users className="w-5 h-5 mr-2" />
              Find Groups
            </Button>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 pb-24 lg:pb-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="academic-card hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Groups
              </CardTitle>
              <Users className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">3</div>
              <p className="text-xs text-accent flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +1 this week
              </p>
            </CardContent>
          </Card>

          <Card className="academic-card hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Study Hours
              </CardTitle>
              <Clock className="w-4 h-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">24.5</div>
              <p className="text-xs text-accent flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +3.2h this week
              </p>
            </CardContent>
          </Card>

          <Card className="academic-card hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Courses
              </CardTitle>
              <BookOpen className="w-4 h-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">5</div>
              <p className="text-xs text-muted-foreground mt-1">
                2 active this semester
              </p>
            </CardContent>
          </Card>

          <Card className="academic-card hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Achievement Score
              </CardTitle>
              <Award className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">87%</div>
              <Progress value={87} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Groups */}
          <div className="lg:col-span-2">
            <Card className="academic-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="heading-section">Recent Groups</CardTitle>
                <Link to="/groups">
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentGroups.map((group) => (
                  <div key={group.id} className="flex items-center space-x-4 p-4 rounded-lg hover:bg-muted transition-colors">
                    <div className="w-12 h-12 bg-gradient-academic rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{group.name}</h3>
                      <p className="text-sm text-muted-foreground">{group.course}</p>
                      <p className="text-xs text-muted-foreground">{group.members} members • {group.activity}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Content */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <Card className="academic-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors">
                    <div className={`w-3 h-3 rounded-full ${
                      event.type === 'study' ? 'bg-primary' :
                      event.type === 'deadline' ? 'bg-destructive' : 'bg-accent'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.time}</p>
                    </div>
                  </div>
                ))}
                <Link to="/calendar">
                  <Button variant="ghost" size="sm" className="w-full mt-3">
                    <Calendar className="w-4 h-4 mr-2" />
                    View Calendar
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Suggested Peers */}
            <Card className="academic-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Suggested Study Partners</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestedPeers.map((peer) => (
                  <div key={peer.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-secondary rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-foreground">
                          {peer.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{peer.name}</p>
                        <p className="text-xs text-muted-foreground">{peer.course}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-accent font-medium">{peer.match}</span>
                      <Button variant="ghost" size="sm">
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}