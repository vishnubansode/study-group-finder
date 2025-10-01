import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Mail, 
  BookOpen, 
  GraduationCap,
  Calendar,
  Award,
  Target,
  Edit3,
  Save,
  Users,
  MessageCircle,
  Star,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

// Default study stats (you can replace this with real data later)
const defaultStudyStats = {
  totalHours: 156,
  groupsJoined: 8,
  groupsLed: 3,
  peersHelped: 24,
  averageRating: 4.8,
  studyStreak: 12
};

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // Form data state - initialized with user data from backend
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: 'Computer Science major passionate about artificial intelligence and machine learning. Love collaborating with fellow students on challenging projects.',
    university: '',
    major: '',
    year: '',
    gpa: '3.8',
  });

  // Update form data when user data loads from backend
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        bio: 'Computer Science major passionate about artificial intelligence and machine learning. Love collaborating with fellow students on challenging projects.',
        university: user.university || '',
        major: user.major || '',
        year: user.currentYear || '',
        gpa: '3.8', // You might want to add this field to your backend
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      // TODO: Implement profile update API call
      // For now, we'll just simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your changes have been saved successfully",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        bio: 'Computer Science major passionate about artificial intelligence and machine learning. Love collaborating with fellow students on challenging projects.',
        university: user.university || '',
        major: user.major || '',
        year: user.currentYear || '',
        gpa: '3.8',
      });
    }
    setIsEditing(false);
  };

  // Show loading state while user data is being fetched
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Loading profile...</span>
        </div>
      </div>
    );
  }

  // Show error state if no user data
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Profile Not Found</h2>
          <p className="text-muted-foreground mb-4">Please log in to view your profile</p>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // Use real data from backend
  const profileDisplayData = {
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    university: user.university,
    major: user.major,
    year: user.currentYear,
    courses: user.selectedCourses || [],
    skills: ['Python', 'Java', 'React', 'Node.js', 'SQL', 'Machine Learning'], // You might want to add this to backend
    profileImageUrl: user.profileImageUrl,
    secondarySchool: user.secondarySchool,
    graduationYear: user.graduationYear,
  };

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-8">
      {/* Profile Header */}
      <div className="bg-gradient-secondary px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-gradient-academic rounded-full flex items-center justify-center text-2xl font-bold text-white">
                {profileDisplayData.profileImageUrl ? (
                  <img 
                    src={`http://localhost:8081${profileDisplayData.profileImageUrl}`} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  profileDisplayData.name.split(' ').map(n => n[0]).join('')
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{profileDisplayData.name}</h1>
                <p className="text-muted-foreground mb-1">{profileDisplayData.major} • {profileDisplayData.year}</p>
                <p className="text-muted-foreground">{profileDisplayData.university}</p>
                {profileDisplayData.secondarySchool && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {profileDisplayData.secondarySchool} • Graduated {profileDisplayData.graduationYear}
                  </p>
                )}
              </div>
            </div>
            
            <div className="lg:ml-auto">
              {isEditing ? (
                <div className="flex space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="btn-academic" 
                    onClick={handleSave}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              ) : (
                <Button 
                  className="btn-academic" 
                  onClick={() => setIsEditing(true)}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="academic-card">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    {isEditing ? (
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        disabled={isLoading}
                      />
                    ) : (
                      <p className="text-foreground font-medium mt-1">{user.firstName}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    {isEditing ? (
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        disabled={isLoading}
                      />
                    ) : (
                      <p className="text-foreground font-medium mt-1">{user.lastName}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={isLoading}
                      />
                    ) : (
                      <p className="text-foreground font-medium mt-1">{user.email}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="university">University</Label>
                    {isEditing ? (
                      <Input
                        id="university"
                        value={formData.university}
                        onChange={(e) => handleInputChange('university', e.target.value)}
                        disabled={isLoading}
                      />
                    ) : (
                      <p className="text-foreground font-medium mt-1">{user.university}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="major">Major</Label>
                    {isEditing ? (
                      <Input
                        id="major"
                        value={formData.major}
                        onChange={(e) => handleInputChange('major', e.target.value)}
                        disabled={isLoading}
                      />
                    ) : (
                      <p className="text-foreground font-medium mt-1">{user.major}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="year">Academic Year</Label>
                    {isEditing ? (
                      <Input
                        id="year"
                        value={formData.year}
                        onChange={(e) => handleInputChange('year', e.target.value)}
                        disabled={isLoading}
                      />
                    ) : (
                      <p className="text-foreground font-medium mt-1">{user.currentYear}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="secondarySchool">Secondary School</Label>
                    <p className="text-foreground font-medium mt-1">{user.secondarySchool}</p>
                  </div>
                  <div>
                    <Label htmlFor="graduationYear">Graduation Year</Label>
                    <p className="text-foreground font-medium mt-1">{user.graduationYear}</p>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={3}
                      disabled={isLoading}
                    />
                  ) : (
                    <p className="text-muted-foreground mt-1">{formData.bio}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Current Courses */}
            <Card className="academic-card">
              <CardHeader>
                <CardTitle>Current Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profileDisplayData.courses.length > 0 ? (
                    profileDisplayData.courses.map((course) => (
                      <Badge key={course} variant="secondary" className="px-3 py-1">
                        <BookOpen className="w-3 h-3 mr-1" />
                        {course}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No courses selected yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card className="academic-card">
              <CardHeader>
                <CardTitle>Skills & Expertise</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profileDisplayData.skills.map((skill) => (
                    <Badge key={skill} className="px-3 py-1 bg-primary text-primary-foreground">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievements - You can add this to your backend later */}
            <Card className="academic-card">
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Achievements coming soon!</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Study Statistics */}
            <Card className="academic-card">
              <CardHeader>
                <CardTitle>Study Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Study Hours</span>
                  </div>
                  <span className="font-bold text-primary">{defaultStudyStats.totalHours}h</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-secondary" />
                    <span className="text-sm text-muted-foreground">Groups Joined</span>
                  </div>
                  <span className="font-bold text-secondary">{defaultStudyStats.groupsJoined}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="w-4 h-4 text-accent" />
                    <span className="text-sm text-muted-foreground">Groups Led</span>
                  </div>
                  <span className="font-bold text-accent">{defaultStudyStats.groupsLed}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Peers Helped</span>
                  </div>
                  <span className="font-bold text-primary">{defaultStudyStats.peersHelped}</span>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Rating</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-bold">{defaultStudyStats.averageRating}</span>
                    </div>
                  </div>
                  <Progress value={defaultStudyStats.averageRating * 20} className="h-2" />
                </div>
                
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-accent" />
                      <span className="text-sm text-muted-foreground">Study Streak</span>
                    </div>
                    <span className="font-bold text-accent">{defaultStudyStats.studyStreak} days</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="academic-card">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full btn-academic" size="sm">
                  <Users className="w-4 h-4 mr-2" />
                  Find Study Partners
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  View Messages
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Session
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}