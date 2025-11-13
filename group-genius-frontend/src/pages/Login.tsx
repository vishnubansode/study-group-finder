import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { BookOpen, Users, Target, Award, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const user = await login(email, password);
      
      toast({
        title: "Welcome back! 🎉",
        description: "Successfully logged in to GroupGenius",
      });
      
      // Handle remember me functionality
      if (rememberMe) {
        // You can implement remember me logic here
        // For example, store email in localStorage
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      // Navigate to dashboard with user ID
      navigate(`/dashboard/${user.id}`);
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = "Login failed. Please try again.";
      
      // Handle specific error cases
      if (error.message.includes('Invalid email or password')) {
        errorMessage = "Invalid email or password. Please check your credentials.";
      } else if (error.message.includes('User not found')) {
        errorMessage = "No account found with this email. Please register first.";
      } else if (error.message.includes('network') || !navigator.onLine) {
        errorMessage = "Network error. Please check your internet connection.";
      }
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Pre-fill email if remembered (optional enhancement)
  useState(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  });

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <Card className="academic-card">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-academic rounded-lg flex items-center justify-center">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">Welcome to GroupGenius</CardTitle>
              <CardDescription>
                Sign in to discover study groups and collaborate with peers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className={isLoading ? 'opacity-50' : ''}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className={`pr-10 ${isLoading ? 'opacity-50' : ''}`}
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
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      disabled={isLoading}
                    />
                    <Label 
                      htmlFor="remember" 
                      className={`text-sm ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      Remember me
                    </Label>
                  </div>
                  <Link 
                    to="/forgot-password" 
                    className={`text-sm text-primary hover:underline ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button 
                  type="submit" 
                  className="w-full btn-academic"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>

                <div className="text-center">
                  <span className="text-sm text-muted-foreground">
                    New here?{' '}
                    <Link 
                      to="/register" 
                      className={`text-primary hover:underline font-medium ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      Create an account
                    </Link>
                  </span>
                </div>

                {/* Demo credentials hint (optional) */}
                <div className="text-center pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground">
                    Demo: Use the credentials from your registration
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Side - Academic Illustration (Desktop Only) */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 items-center justify-center p-12">
        <div className="max-w-lg text-center">
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="academic-card p-6 hover-lift">
              <Users className="w-8 h-8 text-primary mb-3 mx-auto" />
              <h3 className="font-semibold text-foreground mb-2">Study Groups</h3>
              <p className="text-sm text-muted-foreground">Connect with peers in your courses</p>
            </div>
            <div className="academic-card p-6 hover-lift">
              <Target className="w-8 h-8 text-secondary mb-3 mx-auto" />
              <h3 className="font-semibold text-foreground mb-2">Smart Matching</h3>
              <p className="text-sm text-muted-foreground">Find compatible study partners</p>
            </div>
            <div className="academic-card p-6 hover-lift">
              <BookOpen className="w-8 h-8 text-accent mb-3 mx-auto" />
              <h3 className="font-semibold text-foreground mb-2">Course Focus</h3>
              <p className="text-sm text-muted-foreground">Organize by subjects and topics</p>
            </div>
            <div className="academic-card p-6 hover-lift">
              <Award className="w-8 h-8 text-primary mb-3 mx-auto" />
              <h3 className="font-semibold text-foreground mb-2">Achievement</h3>
              <p className="text-sm text-muted-foreground">Track progress together</p>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Join the Academic Community
          </h2>
          <p className="text-muted-foreground">
            Collaborate, learn, and achieve academic excellence with fellow students from around the world.
          </p>
        </div>
      </div>
    </div>
  );
}