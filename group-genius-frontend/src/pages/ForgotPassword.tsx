import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔵 Sending forgot password request for:', email);
      
      const response = await fetch('http://localhost:8080/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();
      console.log('🔵 Forgot password response:', data);

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 404 || data.error?.includes('User not found')) {
          toast({
            title: "Email Not Found",
            description: "No account found with this email address. Please check your email or register for a new account.",
            variant: "destructive",
          });
        } else if (response.status >= 500) {
          toast({
            title: "Server Error",
            description: "Something went wrong on our end. Please try again later.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: data.error || "Failed to send password reset email. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }

      // Success - show success state
      setIsSuccess(true);
      console.log('✅ Password reset email sent successfully');
      
      toast({
        title: "Email Sent! 📧",
        description: "Check your email for password reset instructions",
      });

    } catch (error: any) {
      console.error('❌ Forgot password error:', error);
      
      let errorMessage = "Failed to send password reset email. Please try again.";
      
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
                Email Sent! 📧
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                We've sent password reset instructions to your email
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Email sent to:</strong> {email}
                  </p>
                </div>
                
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" />
                    Check your inbox and spam folder
                  </p>
                  <p>The reset link will expire in 1 hour</p>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail('');
                  }}
                  variant="outline" 
                  className="w-full"
                >
                  Send to Different Email
                </Button>
                
                <Link to="/login">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Button>
                </Link>
              </div>

              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
              </div>
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
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Forgot Password?
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your registered email address and we'll send you reset instructions
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full"
                  autoComplete="email"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Use the same email you used to register your account
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full btn-academic"
                disabled={isLoading || !email.trim()}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Sending Reset Link...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Reset Link
                  </>
                )}
              </Button>

              <div className="text-center space-y-3">
                <Link 
                  to="/login"
                  className={`inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Login
                </Link>
                
                <div className="text-xs text-muted-foreground">
                  Don't have an account?{' '}
                  <Link 
                    to="/register" 
                    className={`text-primary hover:underline font-medium ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    Sign up here
                  </Link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}