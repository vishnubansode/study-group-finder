import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  BookOpen, 
  MessageCircle, 
  Calendar,
  Star,
  TrendingUp,
  ArrowRight,
  GraduationCap,
  Target,
  Zap,
  Mail
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="hero-section px-6 py-20">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              <span>Transform Your Study Experience</span>
            </div>
            <h1 className="heading-hero mb-6 max-w-4xl mx-auto">
              Connect, Collaborate, and Excel Together
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
              Join GroupGenius, the ultimate platform for students to form study groups, share knowledge, 
              and achieve academic success through meaningful collaboration.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link to="/login">
              <Button className="btn-hero text-lg px-12 py-6">
                <GraduationCap className="w-6 h-6 mr-3" />
                Get Started
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="lg" className="text-lg px-12 py-6 border-2">
                <Users className="w-6 h-6 mr-3" />
                Sign Up Free
              </Button>
            </Link>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-academic rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Smart Group Matching</h3>
              <p className="text-muted-foreground">
                Find study partners who share your courses, learning style, and academic goals.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-secondary to-secondary/80 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Real-time Collaboration</h3>
              <p className="text-muted-foreground">
                Chat, share resources, and work together seamlessly with integrated communication tools.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/80 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Track Progress</h3>
              <p className="text-muted-foreground">
                Monitor your study sessions, group contributions, and academic achievements.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-card py-16 px-6 border-y border-border">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">10K+</div>
              <div className="text-muted-foreground">Active Students</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold text-secondary mb-2">2.5K+</div>
              <div className="text-muted-foreground">Study Groups</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold text-accent mb-2">500K+</div>
              <div className="text-muted-foreground">Study Hours</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">95%</div>
              <div className="text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              GroupGenius provides all the tools and features you need to enhance your learning experience and build lasting academic relationships.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="academic-card hover-lift">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-academic rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">Course Integration</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Seamlessly connect with classmates from your enrolled courses. Create subject-specific study groups and access course-related resources.
                </p>
                <div className="flex items-center text-primary font-medium">
                  <span>Explore Courses</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="academic-card hover-lift">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-secondary to-secondary/80 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">Smart Scheduling</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Coordinate study sessions with intelligent scheduling that considers everyone's availability and preferences.
                </p>
                <div className="flex items-center text-secondary font-medium">
                  <span>View Calendar</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="academic-card hover-lift">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent/80 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">Group Communication</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Stay connected with dedicated chat channels, file sharing, and real-time collaboration tools for each study group.
                </p>
                <div className="flex items-center text-accent font-medium">
                  <span>Start Chatting</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="academic-card hover-lift">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">Achievement Tracking</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Track your progress, earn recognition for helping others, and build a reputation as a valuable study partner.
                </p>
                <div className="flex items-center text-primary font-medium">
                  <span>View Profile</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-academic py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Study Experience?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join thousands of students who are already collaborating, learning, and succeeding together on GroupGenius.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-12 py-6">
                <GraduationCap className="w-6 h-6 mr-3" />
                Start Your Journey
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" className="bg-white/10 text-white hover:bg-white/20 text-lg px-12 py-6">
                <Mail className="w-6 h-6 mr-3" />
                Contact
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
