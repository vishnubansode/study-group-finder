import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Mail, Phone, Clock, MessageSquare, Send, HelpCircle, BookOpen, MessageCircle, CheckCircle, Twitter, Facebook, Linkedin } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', queryType: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<boolean>(false);

  const handleInputChange = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('email', formData.email);
      fd.append('queryType', formData.queryType);
      fd.append('subject', formData.subject);
      fd.append('message', formData.message);

      const res = await fetch('http://localhost:8080/api/contact', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Failed to send message');

      setFormData({ name: '', email: '', queryType: '', subject: '', message: '' });
      setStatusMessage('Message sent successfully. We will reply soon.');
      setStatusError(false);
    } catch (err) {
      console.error('Contact send error', err);
      setStatusMessage('Failed to send message. Please try again later.');
      setStatusError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white mb-4">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
            Contact Support
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto text-base md:text-lg leading-relaxed">
            We're here to help you succeed. Send us a detailed message and our expert support team will respond within 24 hours with personalized assistance.
          </p>
          <div className="mt-6 flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Online Support</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>24h Response</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Expert Help</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start">
          <aside className="lg:col-span-5 xl:col-span-4">
            <Card className="p-6 shadow-lg border-0 rounded-xl bg-gradient-to-br from-white via-blue-50/50 to-indigo-50/50 backdrop-blur-sm">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="text-xl flex items-center space-x-3 text-gray-800">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <span className="font-semibold">Get in Touch</span>
                </CardTitle>
                <p className="text-sm text-gray-600 mt-2">Multiple ways to reach our support team</p>
              </CardHeader>
              <CardContent className="p-0 space-y-6">
                <div className="flex items-start space-x-4 p-4 rounded-lg bg-white/60 border border-blue-100">
                  <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-800">Email Support</div>
                    <a href="mailto:support@studygroupfinder.com" className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium">support@studygroupfinder.com</a>
                    <p className="text-xs text-gray-500 mt-1">Best for detailed inquiries</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 rounded-lg bg-white/60 border border-green-100">
                  <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-800">Phone Support</div>
                    <div className="text-sm text-green-600 font-medium">+91 98765 43210</div>
                    <p className="text-xs text-gray-500 mt-1">For urgent assistance</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 rounded-lg bg-white/60 border border-amber-100">
                  <div className="p-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-800">Support Hours</div>
                    <div className="text-sm text-amber-600 font-medium">Mon–Fri, 9:00 AM – 6:00 PM IST</div>
                    <p className="text-xs text-gray-500 mt-1">Response within 2-4 hours</p>
                  </div>
                </div>

                <Separator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

                <div className="space-y-4">
                  <div className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-indigo-500" />
                    Quick Self-Help
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <a href="/help/login" className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 transition-all group border border-purple-100">
                      <div className="p-2 rounded-md bg-purple-500 text-white group-hover:scale-110 transition-transform">
                        <HelpCircle className="w-3 h-3" />
                      </div>
                      <span className="text-sm text-purple-700 font-medium">Login & Account Help</span>
                    </a>
                    <a href="/help/courses" className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 transition-all group border border-blue-100">
                      <div className="p-2 rounded-md bg-blue-500 text-white group-hover:scale-110 transition-transform">
                        <BookOpen className="w-3 h-3" />
                      </div>
                      <span className="text-sm text-blue-700 font-medium">Courses & Groups Guide</span>
                    </a>
                    <a href="/help/feedback" className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-teal-50 hover:from-green-100 hover:to-teal-100 transition-all group border border-green-100">
                      <div className="p-2 rounded-md bg-green-500 text-white group-hover:scale-110 transition-transform">
                        <MessageCircle className="w-3 h-3" />
                      </div>
                      <span className="text-sm text-green-700 font-medium">Send Feedback</span>
                    </a>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                  <div className="flex items-center space-x-2 text-green-700 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold">Response Guarantee</span>
                  </div>
                  <p className="text-xs text-green-600">Average response time: 2 hours during business hours</p>
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                    Connect With Us
                  </div>
                  <div className="flex items-center gap-3">
                    <a href="#" aria-label="Twitter" className="group relative inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-r from-[#1DA1F2] to-[#0d8bd9] text-white hover:scale-110 hover:shadow-lg transition-all duration-200">
                      <Twitter className="w-5 h-5" />
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Twitter</div>
                    </a>
                    <a href="#" aria-label="Facebook" className="group relative inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-r from-[#1877F2] to-[#166fe5] text-white hover:scale-110 hover:shadow-lg transition-all duration-200">
                      <Facebook className="w-5 h-5" />
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Facebook</div>
                    </a>
                    <a href="#" aria-label="LinkedIn" className="group relative inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-r from-[#0A66C2] to-[#0952a0] text-white hover:scale-110 hover:shadow-lg transition-all duration-200">
                      <Linkedin className="w-5 h-5" />
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">LinkedIn</div>
                    </a>
                    <div className="ml-4 flex-1">
                      <a href="/help" className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline font-medium">Visit Help Center →</a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          <div className="lg:col-span-7 xl:col-span-8">
            <Card className="p-8 shadow-xl border-0 rounded-xl bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 backdrop-blur-sm">
              <CardHeader className="p-0 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                        <Send className="w-6 h-6" />
                      </div>
                      Send a Message
                    </CardTitle>
                    <p className="text-gray-600 mt-2">Fill out the form below and we'll get back to you promptly</p>
                  </div>
                  <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Live</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Full Name
                      </Label>
                      <Input 
                        id="name" 
                        required 
                        className="h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-lg transition-all bg-white/80" 
                        value={formData.name} 
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter your full name"
                      />
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        <span>How we should address you in our reply</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Email Address
                      </Label>
                      <Input 
                        id="email" 
                        type="email" 
                        required 
                        className="h-12 border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-lg transition-all bg-white/80" 
                        value={formData.email} 
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="your.email@example.com"
                      />
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>We'll only use this to reply to you</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="queryType" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Query Type
                    </Label>
                    <Select onValueChange={(v) => handleInputChange('queryType', v)}>
                      <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-purple-500 rounded-lg bg-white/80">
                        <SelectValue placeholder="What can we help you with?" />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg">
                        <SelectItem value="technical" className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="p-1 rounded bg-red-100">
                              <HelpCircle className="w-4 h-4 text-red-600" />
                            </div>
                            <div>
                              <div className="font-medium">Technical Issue</div>
                              <div className="text-xs text-gray-500">Bugs, errors, or system problems</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="group" className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="p-1 rounded bg-blue-100">
                              <MessageCircle className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium">Group Issue</div>
                              <div className="text-xs text-gray-500">Study groups, members, or collaboration</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="feedback" className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="p-1 rounded bg-green-100">
                              <MessageSquare className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <div className="font-medium">Feedback</div>
                              <div className="text-xs text-gray-500">Suggestions, compliments, or general feedback</div>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      Subject
                    </Label>
                    <Input 
                      id="subject" 
                      required 
                      className="h-12 border-2 border-gray-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 rounded-lg transition-all bg-white/80" 
                      value={formData.subject} 
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      placeholder="Brief summary of your inquiry"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      Message
                    </Label>
                    <Textarea 
                      id="message" 
                      required 
                      rows={6} 
                      className="border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 rounded-lg transition-all bg-white/80 min-h-[180px] resize-none" 
                      value={formData.message} 
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Please provide as much detail as possible to help us assist you better..."
                    />
                    <div className="text-xs text-gray-500 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        The more details you provide, the faster we can help
                      </span>
                      <span className="text-gray-400">{formData.message.length}/1000</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span>Response in 2-4 hours</span>
                      </div>
                      <div className="hidden sm:flex items-center gap-2">
                        <span>•</span>
                        <span>Need immediate help?</span>
                        <a href="/help/chat" className="text-blue-600 hover:text-blue-800 hover:underline font-medium">Start live chat</a>
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting} 
                      className="h-12 px-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Sending...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Send className="w-5 h-5" />
                          <span>Send Message</span>
                        </div>
                      )}
                    </Button>
                  </div>

                  {statusMessage && (
                    <div className={`p-4 rounded-lg border-l-4 ${
                      statusError 
                        ? 'bg-red-50 border-red-500 text-red-700' 
                        : 'bg-green-50 border-green-500 text-green-700'
                    }`}>
                      <div className="flex items-center gap-2">
                        {statusError ? (
                          <div className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center">!</div>
                        ) : (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                        <span className="font-medium">{statusMessage}</span>
                      </div>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
