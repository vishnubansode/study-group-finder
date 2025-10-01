import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BookOpen, Upload, ChevronLeft, ChevronRight, Check, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const courses = [
  'Data Structures & Algorithms',
  'Calculus I & II', 
  'Artificial Intelligence',
  'Database Management Systems',
  'Computer Networks',
  'Software Engineering',
  'Linear Algebra',
  'Physics I & II',
  'Chemistry',
  'Statistics & Probability'
];

export default function Register() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatar: null as File | null,
    secondarySchool: '',
    graduationYear: '',
    university: '',
    major: '',
    currentYear: '',
    selectedCourses: [] as string[]
  });

  const navigate = useNavigate();
  const { register, login } = useAuth();
  const { toast } = useToast();
  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCourseToggle = (course: string) => {
    setFormData(prev => {
      const isSelected = prev.selectedCourses.includes(course);
      if (isSelected) {
        return {
          ...prev,
          selectedCourses: prev.selectedCourses.filter(c => c !== course)
        };
      } else {
        return {
          ...prev,
          selectedCourses: [...prev.selectedCourses, course]
        };
      }
    });
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Passwords Don't Match",
          description: "Please make sure your passwords match",
          variant: "destructive",
        });
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.secondarySchool || !formData.graduationYear || !formData.university || !formData.major || !formData.currentYear) {
        toast({
          title: "Missing Information",
          description: "Please fill in all academic details",
          variant: "destructive",
        });
        return;
      }
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  console.log('🔵 Step 1: Form submission started');
  
  if (formData.selectedCourses.length === 0) {
    console.log('❌ Step 1: No courses selected');
    toast({
      title: "Course Selection Required",
      description: "Please select at least one course",
      variant: "destructive",
    });
    return;
  }

  setIsLoading(true);

  try {
    const userData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      secondarySchool: formData.secondarySchool,
      graduationYear: formData.graduationYear,
      university: formData.university,
      major: formData.major,
      currentYear: formData.currentYear,
      selectedCourses: formData.selectedCourses
    };

    console.log('🔵 Step 2: Calling register function with data:', userData);

    // Step 1: Register the user
    await register(userData, formData.avatar);
    console.log('✅ Step 2: Register function completed successfully');
    
    console.log('🔵 Step 3: Calling login function with:', formData.email);
    // Step 2: Auto-login after successful registration
    await login(formData.email, formData.password);
    console.log('✅ Step 3: Login function completed successfully');
    
    console.log('🔵 Step 4: Showing success toast');
    toast({
      title: "Registration Successful",
      description: "Your account has been created successfully",
    });
    
    console.log('🔵 Step 5: Navigating to dashboard');
    // Navigate to dashboard
    navigate('/dashboard');
    console.log('✅ Step 5: Navigation completed');
    
  } catch (error: any) {
    console.error('❌ Error occurred:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    toast({
      title: "Registration Failed",
      description: error.message || "An error occurred during registration",
      variant: "destructive",
    });
  } finally {
    console.log('🔵 Step 6: Setting loading to false');
    setIsLoading(false);
  }
};

  // ADD THE MISSING RENDER FUNCTIONS BELOW:

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            {formData.avatar ? (
              <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
                <AvatarImage src={URL.createObjectURL(formData.avatar)} />
                <AvatarFallback className="text-lg font-semibold bg-primary/20">
                  {formData.firstName[0]}{formData.lastName[0]}
                </AvatarFallback>
              </Avatar>
            ) : (
              <User className="w-10 h-10 text-white" />
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={() => document.getElementById('avatar')?.click()}
            disabled={isLoading}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Photo
          </Button>
        </div>
        <input
          id="avatar"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleInputChange('avatar', file);
          }}
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sm font-medium text-foreground">First Name *</Label>
          <Input
            id="firstName"
            placeholder="John"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            required
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm font-medium text-foreground">Last Name *</Label>
          <Input
            id="lastName"
            placeholder="Doe"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-foreground">Email Address *</Label>
        <Input
          id="email"
          type="email"
          placeholder="john.doe@university.edu"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
          required
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-foreground">Password *</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            required
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">Confirm Password *</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            required
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">Academic Background</h3>
        <p className="text-sm text-muted-foreground">Tell us about your educational journey</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="secondarySchool" className="text-sm font-medium text-foreground">Secondary School *</Label>
        <Input
          id="secondarySchool"
          placeholder="e.g. Springfield High School"
          value={formData.secondarySchool}
          onChange={(e) => handleInputChange('secondarySchool', e.target.value)}
          className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="graduationYear" className="text-sm font-medium text-foreground">Graduation Year *</Label>
        <Input
          id="graduationYear"
          type="number"
          placeholder="2020"
          value={formData.graduationYear}
          onChange={(e) => handleInputChange('graduationYear', e.target.value)}
          className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="university" className="text-sm font-medium text-foreground">University/College *</Label>
        <Input
          id="university"
          placeholder="e.g. Massachusetts Institute of Technology"
          value={formData.university}
          onChange={(e) => handleInputChange('university', e.target.value)}
          className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
          required
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="major" className="text-sm font-medium text-foreground">Major/Field of Study *</Label>
          <Input
            id="major"
            placeholder="Computer Science"
            value={formData.major}
            onChange={(e) => handleInputChange('major', e.target.value)}
            className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            required
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currentYear" className="text-sm font-medium text-foreground">Academic Year *</Label>
          <Input
            id="currentYear"
            placeholder="2nd Year"
            value={formData.currentYear}
            onChange={(e) => handleInputChange('currentYear', e.target.value)}
            className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            required
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">Course Selection</h3>
        <p className="text-sm text-muted-foreground">
          Choose subjects you're currently studying or want to find study groups for
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
        {courses.map((course) => (
          <label
            key={course}
            htmlFor={`course-${course.replace(/\s+/g, '-')}`}
            className={`group flex items-center space-x-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
              formData.selectedCourses.includes(course)
                ? 'bg-primary/5 border-primary/30 shadow-sm'
                : 'hover:bg-muted/50 border-border hover:border-primary/20'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Checkbox
              id={`course-${course.replace(/\s+/g, '-')}`}
              checked={formData.selectedCourses.includes(course)}
              onCheckedChange={() => !isLoading && handleCourseToggle(course)}
              className="transition-all duration-200"
              disabled={isLoading}
            />
            <div className="flex-1">
              <p className="font-medium text-foreground group-hover:text-primary transition-colors duration-200">
                {course}
              </p>
            </div>
            {formData.selectedCourses.includes(course) && (
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-scale-in">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </label>
        ))}
      </div>

      <div className="text-center">
        <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full">
          <span className="text-sm font-medium text-primary">
            {formData.selectedCourses.length} course{formData.selectedCourses.length !== 1 ? 's' : ''} selected
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className="shadow-2xl border-0 backdrop-blur-sm bg-background/95">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Join GroupGenius
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Step {currentStep} of {totalSteps}: {
                currentStep === 1 ? 'Personal Information' :
                currentStep === 2 ? 'Academic Background' : 'Course Selection'
              }
            </CardDescription>
            
            <div className="mt-6 space-y-3">
              <Progress value={progress} className="h-3 bg-muted" />
              <div className="flex justify-between text-sm font-medium">
                <span className={`transition-colors duration-200 ${currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                  Personal
                </span>
                <span className={`transition-colors duration-200 ${currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                  Academic
                </span>
                <span className={`transition-colors duration-200 ${currentStep >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                  Courses
                </span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="min-h-[400px]">
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-border/50">
                {currentStep > 1 ? (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleBack}
                    className="h-12 px-6 border-2 hover:bg-muted/50 transition-all duration-200"
                    disabled={isLoading}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                ) : (
                  <div></div>
                )}

                {currentStep < totalSteps ? (
                  <Button 
                    type="button" 
                    onClick={handleNext}
                    className="h-12 px-8 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={isLoading}
                  >
                    Next Step
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    type="submit"
                    className="h-12 px-8 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                )}
              </div>
            </form>

            <div className="text-center mt-6 pt-6 border-t border-border/50">
              <span className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-primary hover:text-primary/80 font-medium transition-colors duration-200 hover:underline"
                >
                  Sign in here
                </Link>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}