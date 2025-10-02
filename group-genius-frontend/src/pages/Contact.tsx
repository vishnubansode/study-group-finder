import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Mail, 
  Phone, 
  Clock, 
  MessageSquare, 
  Upload,
  Send,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  MessageCircle,
  Users,
  BookOpen,
  Calendar,
  Bell,
  HelpCircle,
  Sparkles,
  Zap,
  Heart,
  Star,
  ArrowRight,
  CheckCircle,
  Globe,
  Headphones
} from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    queryType: '',
    subject: '',
    message: '',
    attachment: null as File | null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      attachment: file
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Form submitted:', formData);
    // Reset form
    setFormData({
      name: '',
      email: '',
      queryType: '',
      subject: '',
      message: '',
      attachment: null
    });
    setIsSubmitting(false);
  };

  const faqLinks = [
    { title: 'Login & Account Issues', icon: HelpCircle, href: '/help/login', color: 'bg-red-500' },
    { title: 'Course & Group Management', icon: BookOpen, href: '/help/courses', color: 'bg-blue-500' },
    { title: 'Chat & Shared Documents', icon: MessageSquare, href: '/help/chat', color: 'bg-green-500' },
    { title: 'Calendar & Notifications', icon: Calendar, href: '/help/calendar', color: 'bg-purple-500' },
    { title: 'Feedback & Suggestions', icon: MessageCircle, href: '/help/feedback', color: 'bg-orange-500' }
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#', color: 'hover:bg-blue-600' },
    { name: 'Twitter', icon: Twitter, href: '#', color: 'hover:bg-sky-500' },
    { name: 'LinkedIn', icon: Linkedin, href: '#', color: 'hover:bg-blue-700' },
    { name: 'Instagram', icon: Instagram, href: '#', color: 'hover:bg-pink-600' },
    { name: 'Telegram', icon: MessageCircle, href: '#', color: 'hover:bg-blue-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-6">
        {/* Hero Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary/10 to-secondary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4 backdrop-blur-sm border border-primary/20">
            <Sparkles className="w-3 h-3" />
            <span>We're Here to Help You Succeed</span>
            <Sparkles className="w-3 h-3" />
          </div>
          
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent mb-3 leading-tight">
            Get in Touch
          </h1>
          
          <p className="text-base text-muted-foreground max-w-xl mx-auto leading-relaxed mb-4">
            Our dedicated support team is ready to help you with any questions, technical issues, or feedback about your study group experience.
          </p>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <div className="flex items-center space-x-2 bg-card/50 backdrop-blur-sm px-3 py-1 rounded-full border border-border/50">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span className="text-xs font-medium">24/7 Support</span>
            </div>
            <div className="flex items-center space-x-2 bg-card/50 backdrop-blur-sm px-3 py-1 rounded-full border border-border/50">
              <Zap className="w-3 h-3 text-yellow-500" />
              <span className="text-xs font-medium">Quick Response</span>
            </div>
            <div className="flex items-center space-x-2 bg-card/50 backdrop-blur-sm px-3 py-1 rounded-full border border-border/50">
              <Heart className="w-3 h-3 text-red-500" />
              <span className="text-xs font-medium">Student-First</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-8">
          {/* Contact Information Cards */}
          <div className="lg:col-span-4 space-y-3">
            {/* Support Info Card */}
            <Card className="group hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border-primary/20">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2 text-base">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                      <Headphones className="w-4 h-4 text-white" />
                    </div>
                    <span>Support Team</span>
                  </CardTitle>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">
                    Online
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 p-2 rounded-lg bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors">
                    <div className="w-6 h-6 bg-primary/10 rounded-md flex items-center justify-center">
                      <Mail className="w-3 h-3 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-xs">Support Email</p>
                      <a href="mailto:support@studygroupfinder.com" className="text-primary hover:underline text-xs">
                        support@studygroupfinder.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-2 rounded-lg bg-secondary/5 border border-secondary/10 hover:bg-secondary/10 transition-colors">
                    <div className="w-6 h-6 bg-secondary/10 rounded-md flex items-center justify-center">
                      <Phone className="w-3 h-3 text-secondary" />
                    </div>
                    <div>
                      <p className="font-medium text-xs">Phone Support</p>
                      <a href="tel:+919876543210" className="text-secondary hover:underline text-xs">
                        +91 9876543210
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-2 rounded-lg bg-accent/5 border border-accent/10 hover:bg-accent/10 transition-colors">
                    <div className="w-6 h-6 bg-accent/10 rounded-md flex items-center justify-center">
                      <Clock className="w-3 h-3 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-xs">Support Hours</p>
                      <p className="text-muted-foreground text-xs">Mon–Fri, 9:00 AM – 6:00 PM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Media & Community */}
            <Card className="group hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border-secondary/20">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <div className="w-8 h-8 bg-gradient-to-br from-secondary to-secondary/80 rounded-lg flex items-center justify-center">
                    <Globe className="w-4 h-4 text-white" />
                  </div>
                  <span>Connect With Us</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-1">
                  {socialLinks.map((social, index) => {
                    const Icon = social.icon;
                    return (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className={`flex items-center space-x-1 transition-all duration-300 hover:scale-105 ${social.color}`}
                        asChild
                      >
                        <a href={social.href} className="flex items-center space-x-1">
                          <Icon className="w-3 h-3" />
                          <span className="text-xs">{social.name}</span>
                        </a>
                      </Button>
                    );
                  })}
                </div>
                
                <Separator />
                
                <div className="space-y-1">
                  <Button variant="ghost" className="w-full justify-between p-1 hover:bg-primary/5 group">
                    <div className="flex items-center space-x-2">
                      <Users className="w-3 h-3 text-primary" />
                      <span className="font-medium text-xs">Community Forum</span>
                    </div>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button variant="ghost" className="w-full justify-between p-1 hover:bg-secondary/5 group">
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="w-3 h-3 text-secondary" />
                      <span className="font-medium text-xs">Live Chat Support</span>
                    </div>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Help / FAQ Links */}
            <Card className="group hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border-accent/20">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent/80 rounded-lg flex items-center justify-center">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  <span>Quick Help</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {faqLinks.map((link, index) => {
                    const Icon = link.icon;
                    return (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start p-1 h-auto hover:scale-[1.01] transition-all duration-300 group"
                        asChild
                      >
                        <a href={link.href} className="flex items-center space-x-2 w-full">
                          <div className={`w-5 h-5 ${link.color} rounded-md flex items-center justify-center`}>
                            <Icon className="w-2.5 h-2.5 text-white" />
                          </div>
                          <span className="font-medium text-xs">{link.title}</span>
                          <ArrowRight className="w-2.5 h-2.5 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </a>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-8 lg:row-span-3">
            <Card className="group hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm border-primary/20 h-full flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary via-secondary to-accent rounded-xl flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Send us a Message</CardTitle>
                      <p className="text-sm text-muted-foreground">We'll get back to you within 24 hours</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse delay-300"></div>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse delay-700"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium flex items-center space-x-2">
                        <span>Full Name</span>
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="name"
                          placeholder="Enter your full name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          required
                          className="pl-10 h-10 border-2 focus:border-primary transition-all duration-300 hover:border-primary/50"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-primary text-xs font-bold">👤</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium flex items-center space-x-2">
                        <span>Email Address</span>
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          required
                          className="pl-10 h-10 border-2 focus:border-secondary transition-all duration-300 hover:border-secondary/50"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <div className="w-5 h-5 bg-secondary/10 rounded-full flex items-center justify-center">
                            <Mail className="w-3 h-3 text-secondary" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="queryType" className="text-sm font-medium flex items-center space-x-2">
                      <span>Query Type</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Select onValueChange={(value) => handleInputChange('queryType', value)}>
                      <SelectTrigger className="h-10 border-2 focus:border-accent transition-all duration-300 hover:border-accent/50">
                        <SelectValue placeholder="Select the type of your query" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span>Technical Issue</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="group">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>Group Issue</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="chat">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Chat Issue</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="scheduling">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span>Scheduling</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="feedback">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <span>Feedback</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-medium flex items-center space-x-2">
                      <span>Subject</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="subject"
                      placeholder="Brief description of your query"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      required
                      className="h-10 border-2 focus:border-primary transition-all duration-300 hover:border-primary/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-medium flex items-center space-x-2">
                      <span>Message</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Please provide detailed information about your query..."
                      rows={6}
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      required
                      className="border-2 focus:border-secondary transition-all duration-300 hover:border-secondary/50 resize-none flex-1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="attachment" className="text-sm font-medium">Attachment (optional)</Label>
                    <div className="relative">
                      <div className="flex items-center justify-center w-full">
                        <label htmlFor="attachment" className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group">
                          <div className="flex flex-col items-center justify-center pt-2 pb-2">
                            <Upload className="w-5 h-5 mb-1 text-muted-foreground group-hover:text-primary transition-colors" />
                            <p className="mb-1 text-xs text-muted-foreground">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">PNG, JPG, PDF up to 10MB</p>
                          </div>
                          <input
                            id="attachment"
                            type="file"
                            onChange={handleFileChange}
                            className="hidden"
                            accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
                          />
                        </label>
                      </div>
                      {formData.attachment && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <div>
                            <p className="text-xs font-medium text-green-800">
                              {formData.attachment.name}
                            </p>
                            <p className="text-xs text-green-600">
                              {(formData.attachment.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-1 mt-auto">
                    <Button 
                      type="submit" 
                      className="w-full h-10 text-sm font-semibold bg-gradient-to-r from-primary via-secondary to-accent hover:from-primary/90 hover:via-secondary/90 hover:to-accent/90 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Sending Message...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Send className="w-3 h-3" />
                          <span>Send Message</span>
                          <Sparkles className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enhanced Footer Section */}
        <div className="mt-6">
          <Card className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-primary/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Need Immediate Help?
                </h3>
                <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                  For urgent technical issues or account problems, our support team is ready to assist you.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <div className="text-center p-3 rounded-lg bg-card/50 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all duration-300 group">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-sm font-semibold mb-1">Call Support</h4>
                  <p className="text-muted-foreground text-xs mb-2">Speak directly with our support team</p>
                  <Button variant="outline" size="sm" className="w-full hover:bg-primary hover:text-white transition-all duration-300">
                    +91 9876543210
                  </Button>
                </div>
                
                <div className="text-center p-3 rounded-lg bg-card/50 backdrop-blur-sm border border-secondary/10 hover:border-secondary/30 transition-all duration-300 group">
                  <div className="w-10 h-10 bg-gradient-to-br from-secondary to-secondary/80 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-sm font-semibold mb-1">Live Chat</h4>
                  <p className="text-muted-foreground text-xs mb-2">Get instant help with our chat bot</p>
                  <Button variant="outline" size="sm" className="w-full hover:bg-secondary hover:text-white transition-all duration-300">
                    Start Chat
                  </Button>
                </div>
                
                <div className="text-center p-3 rounded-lg bg-card/50 backdrop-blur-sm border border-accent/10 hover:border-accent/30 transition-all duration-300 group">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent/80 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-sm font-semibold mb-1">Email Support</h4>
                  <p className="text-muted-foreground text-xs mb-2">Send detailed queries via email</p>
                  <Button variant="outline" size="sm" className="w-full hover:bg-accent hover:text-white transition-all duration-300">
                    Send Email
                  </Button>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="border-t border-border/50 pt-3">
                <div className="flex flex-wrap justify-center items-center gap-3 text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span className="text-xs">24/7 Support Available</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Zap className="w-3 h-3 text-yellow-500" />
                    <span className="text-xs">Average Response: 2 hours</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heart className="w-3 h-3 text-red-500" />
                    <span className="text-xs">Student-Focused Support</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-purple-500" />
                    <span className="text-xs">98% Satisfaction Rate</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contact;
