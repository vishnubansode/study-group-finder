import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BookOpen, Upload, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatar: null as File | null
  });

  const navigate = useNavigate();
  const { register, login } = useAuth();
  const { toast } = useToast();

  const passwordStrength = (password: string) => {
    if (password.length < 8) return { strength: 1, label: 'Too short' };
    
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    if (hasLetter && hasNumber) return { strength: 3, label: 'Strong' };
    return { strength: 2, label: 'Weak' };
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
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

    if (formData.password.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    if (!/[a-zA-Z]/.test(formData.password)) {
      toast({
        title: "Password Invalid",
        description: "Password must contain at least one letter",
        variant: "destructive",
      });
      return;
    }

    if (!/\d/.test(formData.password)) {
      toast({
        title: "Password Invalid",
        description: "Password must contain at least one number",
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
        password: formData.password
      };

      console.log('🔵 Registering user with basic data:', userData);

      // Register the user
      await register(userData, formData.avatar);
      console.log('✅ Registration completed successfully');
      
      console.log('🔵 Auto-logging in user');
      // Auto-login after successful registration
      const user = await login(formData.email, formData.password);
      console.log('✅ Login completed successfully');
      
      toast({
        title: "Registration Successful",
        description: "Welcome to GroupGenius! Your account has been created.",
      });
      
      // Navigate to dashboard with user ID
      navigate(`/dashboard/${user.id}`);
      
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      
      toast({
        title: "Registration Failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
              Create your account to get started
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
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

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="h-11 pr-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {formData.password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Password Strength:</span>
                      <span className={`text-xs font-medium ${
                        passwordStrength(formData.password).strength === 3 ? 'text-green-600' :
                        passwordStrength(formData.password).strength === 2 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {passwordStrength(formData.password).label}
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      {[1, 2, 3].map((level) => (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            level <= passwordStrength(formData.password).strength
                              ? passwordStrength(formData.password).strength === 3
                                ? 'bg-green-500'
                                : passwordStrength(formData.password).strength === 2
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">Confirm Password *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="h-11 pr-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {formData.password && (
                <div className="bg-muted/50 rounded-lg p-3 space-y-1.5">
                  <p className="text-xs font-medium text-foreground mb-2">Password Requirements:</p>
                  <div className={`flex items-center gap-2 text-xs transition-colors ${
                    formData.password.length >= 8 ? 'text-green-600' : 'text-muted-foreground'
                  }`}>
                    <span className="font-medium">{formData.password.length >= 8 ? '✓' : '○'}</span>
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs transition-colors ${
                    /[a-zA-Z]/.test(formData.password) ? 'text-green-600' : 'text-muted-foreground'
                  }`}>
                    <span className="font-medium">{/[a-zA-Z]/.test(formData.password) ? '✓' : '○'}</span>
                    <span>Contains at least one letter</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs transition-colors ${
                    /\d/.test(formData.password) ? 'text-green-600' : 'text-muted-foreground'
                  }`}>
                    <span className="font-medium">{/\d/.test(formData.password) ? '✓' : '○'}</span>
                    <span>Contains at least one number</span>
                  </div>
                </div>
              )}

              <div className="pt-6">
                <Button 
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
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