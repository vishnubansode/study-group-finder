import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);
  const { toast } = useToast();

  const token = searchParams.get('token');

  useEffect(() => {
    // Check if token exists
    if (!token) {
      toast({
        title: "Invalid Reset Link",
        description: "This password reset link is invalid or missing the token.",
        variant: "destructive",
      });
      setIsValidToken(false);
    }
  }, [token, toast]);

  const validatePassword = (password: string) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push("At least 8 characters long");
    }
    if (!/[A-Za-z]/.test(password)) {
      errors.push("At least one letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("At least one number");
    }
    
    return errors;
  };

  const passwordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '', isValid: false };
    
    const hasMinLength = password.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    const isValid = hasMinLength && hasLetter && hasNumber;
    
    if (!hasMinLength) {
      return { strength: 1, label: 'Too short', color: 'bg-red-500', isValid: false };
    }
    if (!hasLetter || !hasNumber) {
      return { strength: 2, label: 'Weak', color: 'bg-yellow-500', isValid: false };
    }
    
    return { strength: 3, label: 'Strong', color: 'bg-green-500', isValid: true };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!password || !confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in both password fields",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure both passwords are identical",
        variant: "destructive",
      });
      return;
    }

    // Password strength validation
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      toast({
        title: "Password Too Weak",
        description: `Password must have: ${passwordErrors.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    if (!token) {
      toast({
        title: "Invalid Token",
        description: "Password reset token is missing or invalid",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔵 Resetting password with token:', token.substring(0, 8) + '...');
      
      const response = await fetch('http://localhost:8080/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token: token,
          password: password 
        }),
      });

      const data = await response.json();
      console.log('🔵 Reset password response:', data);

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 400 && data.error?.includes('expired')) {
          toast({
            title: "Link Expired",
            description: "This password reset link has expired. Please request a new one.",
            variant: "destructive",
          });
        } else if (response.status === 400 && data.error?.includes('used')) {
          toast({
            title: "Link Already Used",
            description: "This password reset link has already been used. Please request a new one.",
            variant: "destructive",
          });
        } else if (response.status === 400 && data.error?.includes('Invalid')) {
          toast({
            title: "Invalid Token",
            description: "This password reset link is invalid. Please request a new one.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: data.error || "Failed to reset password. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }

      // Success
      setIsSuccess(true);
      console.log('✅ Password reset successfully');
      
      toast({
        title: "Password Reset Successful! 🎉",
        description: "Your password has been updated. You can now log in with your new password.",
      });

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error: any) {
      console.error('❌ Reset password error:', error);
      
      let errorMessage = "Failed to reset password. Please try again.";
      
      if (!navigator.onLine) {
        errorMessage = "No internet connection. Please check your network and try again.";
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = "Cannot connect to server. Please make sure the backend is running.";
      }
      
      toast({
        title: "Connection Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Invalid token state
  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 backdrop-blur-sm bg-background/95">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">
                Invalid Reset Link
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                This password reset link is invalid or has expired
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Please request a new password reset link from the login page.
                </p>
                
                <div className="space-y-2">
                  <Link to="/forgot-password">
                    <Button className="w-full">
                      Request New Reset Link
                    </Button>
                  </Link>
                  
                  <Link to="/login">
                    <Button variant="ghost" className="w-full">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 backdrop-blur-sm bg-background/95">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">
                Password Reset Successful! 🎉
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Your password has been updated successfully
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    You can now log in with your new password
                  </p>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Redirecting to login page in 3 seconds...
                </p>
              </div>

              <Link to="/login">
                <Button className="w-full btn-academic">
                  Go to Login Page
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Form state
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 backdrop-blur-sm bg-background/95">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Reset Your Password
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your new password below
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full pr-10"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {password && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                            i < passwordStrength(password).strength
                              ? passwordStrength(password).color
                              : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${passwordStrength(password).isValid ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {passwordStrength(password).label}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full pr-10"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Password must:</p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                  <li className={password.length >= 8 ? 'text-green-600 font-medium' : ''}>
                    ✓ At least 8 characters long
                  </li>
                  <li className={/[A-Za-z]/.test(password) ? 'text-green-600 font-medium' : ''}>
                    ✓ Contains at least one letter
                  </li>
                  <li className={/[0-9]/.test(password) ? 'text-green-600 font-medium' : ''}>
                    ✓ Contains at least one number
                  </li>
                </ul>
              </div>

              <Button 
                type="submit" 
                className="w-full btn-academic"
                disabled={isLoading || !password || !confirmPassword}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Updating Password...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Update Password
                  </>
                )}
              </Button>

              <div className="text-center">
                <Link 
                  to="/login"
                  className={`inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}