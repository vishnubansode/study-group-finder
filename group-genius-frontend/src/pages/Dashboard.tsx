import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, BookOpen, Award, Plus } from 'lucide-react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  // Security check: Verify that the URL parameter matches the authenticated user
  if (id && user && user.id.toString() !== id) {
    // Redirect to the correct dashboard URL for the authenticated user
    return <Navigate to={`/dashboard/${user.id}`} replace />;
  }
  
  // If no ID in URL but user is authenticated, redirect to dashboard with ID
  if (!id && user) {
    return <Navigate to={`/dashboard/${user.id}`} replace />;
  }
  
  return (
    <div className="min-h-screen bg-background">
      <div className="hero-section px-6 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="heading-hero mb-6">
            Welcome back to GroupGenius{user ? `, ${user.firstName}` : ''}
          </h1>
          <p className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
            Your personalised dashboard will light up as soon as the platform is connected to live study data.
          </p>
          {user && (
            <p className="text-sm text-muted-foreground mb-8">
              User ID: {user.id} | Email: {user.email}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="btn-hero" disabled>
              <Plus className="w-5 h-5 mr-2" />
              Create Study Group
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-4" asChild>
              <Link to="/groups">
                <Users className="w-5 h-5 mr-2" />
                Browse Groups
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 pb-24 lg:pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardStatCard icon={<Users className="w-4 h-4 text-primary" />} title="Active Groups" description="Connect to the backend to see your live group count." />
          <DashboardStatCard icon={<BookOpen className="w-4 h-4 text-secondary" />} title="Courses" description="Courses you follow will appear here automatically." />
          <DashboardStatCard icon={<Calendar className="w-4 h-4 text-accent" />} title="Upcoming Sessions" description="Events sync in once calendar integration is ready." />
          <DashboardStatCard icon={<Award className="w-4 h-4 text-primary" />} title="Achievements" description="Track your progress when analytics go live." />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="academic-card lg:col-span-2">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <CardTitle className="heading-section">Recent group activity</CardTitle>
              <Button variant="ghost" size="sm" disabled>
                Coming soon
              </Button>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              As soon as the app is wired to the Spring Boot services, your joined groups, messages and study sessions will appear here in real time.
            </CardContent>
          </Card>

          <Card className="academic-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">What to expect next</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>• Calendar events and deadlines will sync from the backend schedule service.</p>
              <p>• Suggested study partners will surface once matching logic is available.</p>
              <p>• Notifications and reminders will show once real-time updates are configured.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DashboardStatCard({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <Card className="academic-card hover-lift">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold text-foreground">--</p>
        <p className="text-xs text-muted-foreground mt-2">{description}</p>
      </CardContent>
    </Card>
  );
}