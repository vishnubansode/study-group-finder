import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
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
  Loader2,
  KeyRound,
  Upload
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const API_BASE_URL = 'http://localhost:8080/api';

// Default study stats
const defaultStudyStats = {
  totalHours: 156,
  groupsJoined: 8,
  groupsLed: 3,
  peersHelped: 24,
  averageRating: 4.8,
  studyStreak: 12
};

// Dummy courses data
const dummyCourses = [
  { id: 1, courseCode: 'CS101', courseName: 'Introduction to Computer Science' },
  { id: 2, courseCode: 'MATH201', courseName: 'Calculus I' },
  { id: 3, courseCode: 'PHYS101', courseName: 'General Physics' },
  { id: 4, courseCode: 'ENG102', courseName: 'Composition II' },
  { id: 5, courseCode: 'CS301', courseName: 'Data Structures' }
];

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const { user, isLoading: authLoading, updateUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Form data state - initialized with user data from backend
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    university: '',
    major: '',
    currentYear: '',
    secondarySchool: '',
    graduationYear: '',
  });

  // Update form data when user data loads from backend
  useEffect(() => {
    if (user) {
      console.log('🔄 Setting form data from user:', user);
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        bio: user.bio || 'Computer Science major passionate about artificial intelligence and machine learning. Love collaborating with fellow students on challenging projects.',
        university: user.university || '',
        major: user.major || '',
        currentYear: user.currentYear || '',
        secondarySchool: user.secondarySchool || '',
        graduationYear: user.graduationYear || '',
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        university: formData.university,
        major: formData.major,
        currentYear: formData.currentYear,
        secondarySchool: formData.secondarySchool,
        graduationYear: formData.graduationYear,
        bio: formData.bio
      };

      console.log('🔵 Sending update data:', updateData);
      console.log('🔵 User ID:', user?.id);

      const response = await fetch(`${API_BASE_URL}/users/${user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      console.log('🔵 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        throw new Error(`Failed to update profile: ${response.status} ${errorText}`);
      }

      const updatedUser = await response.json();
      console.log('✅ Updated user received:', updatedUser);
      
      // Update the user in auth context
      if (updateUser) {
        updateUser(updatedUser);
      }

      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your changes have been saved successfully",
      });
      
    } catch (error: any) {
      console.error('❌ Profile update error:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    setImageLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formData = new FormData();
      formData.append('avatar', file);

      console.log('🔵 Uploading profile image...');

      const response = await fetch(`${API_BASE_URL}/users/${user?.id}/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const updatedUser = await response.json();
      console.log('✅ Image upload response:', updatedUser);
      
      // Update the user in auth context
      if (updateUser) {
        updateUser(updatedUser);
      }

      toast({
        title: "Profile Photo Updated",
        description: "Your profile photo has been updated successfully",
      });
      
    } catch (error: any) {
      console.error('❌ Image upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload profile photo",
        variant: "destructive",
      });
    } finally {
      setImageLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        bio: user.bio || 'Computer Science major passionate about artificial intelligence and machine learning. Love collaborating with fellow students on challenging projects.',
        university: user.university || '',
        major: user.major || '',
        currentYear: user.currentYear || '',
        secondarySchool: user.secondarySchool || '',
        graduationYear: user.graduationYear || '',
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
          <Button onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                  {user.profileImageUrl ? (
                    <img 
                      src={`http://localhost:8080/api/files/${user.profileImageUrl?.split('/').pop()}`}
                      alt="Profile" 
                      className="w-24 h-24 rounded-full object-cover border-4 border-white"
                      onError={(e) => {
                        console.error('❌ Image failed to load:', user.profileImageUrl);
                        // Show fallback if image fails to load
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : null}
                  {!user.profileImageUrl && (
                    <span>{user.firstName?.[0]}{user.lastName?.[0]}</span>
                  )}
                </div>
                {isEditing && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="absolute -bottom-2 -right-2 bg-white shadow-md hover:bg-gray-50"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                    disabled={imageLoading}
                  >
                    {imageLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Upload className="w-3 h-3" />
                    )}
                  </Button>
                )}
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      console.log('🔵 Selected file:', file.name);
                      handleImageUpload(file);
                    }
                  }}
                  disabled={imageLoading}
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{user.firstName} {user.lastName}</h1>
                <p className="text-muted-foreground mb-1">
                  {user.major && `${user.major} • `}{user.currentYear}
                </p>
                <p className="text-muted-foreground">{user.university || 'University not set'}</p>
                {user.secondarySchool && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {user.secondarySchool} • Graduated {user.graduationYear}
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
                    className="bg-blue-600 hover:bg-blue-700 text-white" 
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
                <div className="flex gap-3">
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white" 
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/change-password')}
                  >
                    <KeyRound className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </div>
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
            <Card className="border shadow-sm">
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
                        placeholder="Enter your university"
                      />
                    ) : (
                      <p className="text-foreground font-medium mt-1">{user.university || 'Not set'}</p>
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
                        placeholder="Enter your major"
                      />
                    ) : (
                      <p className="text-foreground font-medium mt-1">{user.major || 'Not set'}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="currentYear">Academic Year</Label>
                    {isEditing ? (
                      <Input
                        id="currentYear"
                        value={formData.currentYear}
                        onChange={(e) => handleInputChange('currentYear', e.target.value)}
                        disabled={isLoading}
                        placeholder="e.g., 1st, 2nd, 3rd, 4th"
                      />
                    ) : (
                      <p className="text-foreground font-medium mt-1">{user.currentYear || 'Not set'}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="secondarySchool">Secondary School</Label>
                    {isEditing ? (
                      <Input
                        id="secondarySchool"
                        value={formData.secondarySchool}
                        onChange={(e) => handleInputChange('secondarySchool', e.target.value)}
                        disabled={isLoading}
                        placeholder="Enter your school name"
                      />
                    ) : (
                      <p className="text-foreground font-medium mt-1">{user.secondarySchool || 'Not set'}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="graduationYear">Graduation Year</Label>
                    {isEditing ? (
                      <Input
                        id="graduationYear"
                        value={formData.graduationYear}
                        onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                        disabled={isLoading}
                        placeholder="e.g., 2023"
                      />
                    ) : (
                      <p className="text-foreground font-medium mt-1">{user.graduationYear || 'Not set'}</p>
                    )}
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
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className="text-muted-foreground mt-1">{formData.bio}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Current Courses - Using Dummy Data */}
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle>Current Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {dummyCourses.map((course) => (
                    <Badge key={course.id} variant="secondary" className="px-3 py-1">
                      <BookOpen className="w-3 h-3 mr-1" />
                      {course.courseCode} - {course.courseName}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle>Skills & Expertise</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {['Python', 'Java', 'React', 'Node.js', 'SQL', 'Machine Learning', 'Data Structures', 'Algorithms'].map((skill) => (
                    <Badge key={skill} className="px-3 py-1 bg-blue-100 text-blue-800 border-blue-200">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Study Statistics */}
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle>Study Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-muted-foreground">Study Hours</span>
                  </div>
                  <span className="font-bold text-blue-600">{defaultStudyStats.totalHours}h</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-muted-foreground">Groups Joined</span>
                  </div>
                  <span className="font-bold text-green-600">{defaultStudyStats.groupsJoined}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-muted-foreground">Groups Led</span>
                  </div>
                  <span className="font-bold text-purple-600">{defaultStudyStats.groupsLed}</span>
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
                      <TrendingUp className="w-4 h-4 text-orange-600" />
                      <span className="text-sm text-muted-foreground">Study Streak</span>
                    </div>
                    <span className="font-bold text-orange-600">{defaultStudyStats.studyStreak} days</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" size="sm">
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