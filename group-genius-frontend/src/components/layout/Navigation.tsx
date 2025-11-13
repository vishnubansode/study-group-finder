import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  MessageCircle, 
  Calendar, 
  User, 
  Menu, 
  X,
  Bell,
  Mail
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationViewer } from '@/components/common/NotificationViewer';
import { notificationAPI } from '@/lib/api/notificationApi';
import { resolveMediaUrl } from '@/lib/media';

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Courses', href: '/courses', icon: BookOpen },
  { name: 'Groups', href: '/groups', icon: Users },
  { name: 'Chat', href: '/chat', icon: MessageCircle },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Contact', href: '/contact', icon: Mail },
];

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationViewerOpen, setIsNotificationViewerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const { user, logout } = useAuth();

  // Load unread notification count
  useEffect(() => {
    if (user?.id) {
      loadUnreadCount();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const loadUnreadCount = async () => {
    if (!user?.id) return;
    try {
      const notifications = await notificationAPI.getUserNotifications(user.id);
      setUnreadCount(notifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notification count:', error);
    }
  };

  const handleNotificationClick = () => {
    setIsNotificationViewerOpen(!isNotificationViewerOpen);
    if (!isNotificationViewerOpen) {
      loadUnreadCount();
    }
  };

  const displayName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '';
  const initials = user ? `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`.toUpperCase() : '';
  // Build image src: prefer `avatar` then `profileImageUrl`. If value is a full URL, use it as-is.
  const rawImageValue = user?.avatar || user?.profileImageUrl || undefined;
  const imageSrc = resolveMediaUrl(rawImageValue) ?? undefined;

  // Create dynamic menu items with user-specific dashboard URL
  const getDynamicMenuItems = () => {
    if (!user) return [navigationItems[0], navigationItems[navigationItems.length - 1]]; // Home and Contact for guests
    return navigationItems.map(item => {
      if (item.name === 'Dashboard') {
        return { ...item, href: `/dashboard/${user.id}` };
      }
      return item;
    });
  };

  const menuItems = getDynamicMenuItems();

  const isActive = (href: string) => {
    if (href.startsWith('/dashboard')) {
      return location.pathname.startsWith('/dashboard');
    }
    return location.pathname === href;
  };

  if (!user) {
    return (
      <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-card/95 supports-[backdrop-filter]:bg-card/80 backdrop-blur border-b border-border">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-academic rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">GroupGenius</span>
        </Link>
        <div className="flex items-center gap-3">
          {/* Show Sign In for guests (Contact moved to the lower/menu area) */}
          <Button variant="ghost" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
          <Button asChild>
            <Link to="/register">Create Account</Link>
          </Button>
        </div>
      </nav>
      {/* Spacer to offset fixed header height */}
      <div className="h-14 lg:h-16" aria-hidden />
      </>
    );
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex fixed top-0 left-0 right-0 z-50 items-center justify-between px-6 py-4 bg-card/95 supports-[backdrop-filter]:bg-card/80 backdrop-blur border-b border-border">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-academic rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">GroupGenius</span>
          </Link>
          
          <div className="flex items-center space-x-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={handleNotificationClick}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center px-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </div>
            )}
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {imageSrc ? (
                <img src={imageSrc} alt="Profile" className="w-8 h-8 rounded-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                  {initials}
                </div>
              )}
              <span className="text-sm font-medium">{displayName}</span>
            </div>
            <Button variant="outline" onClick={logout}>Sign Out</Button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card/95 supports-[backdrop-filter]:bg-card/80 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-academic rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">GroupGenius</span>
          </Link>
          
    <div className="flex-1 flex items-center justify-end space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={handleNotificationClick}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center px-1">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="px-4 py-2 border-t border-border bg-muted/50">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
            <div className="mt-4 pt-4 border-t border-border">
              <Button variant="outline" className="w-full" onClick={() => {
                setIsMobileMenuOpen(false);
                logout();
              }}>
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer to offset fixed header height */}
      <div className="h-14 lg:h-16" aria-hidden />

      {/* Bottom Navigation for Mobile (hidden when hideBottomNav=true) */}
      {/* Bottom navigation removed — mobile menu (burger) is used instead */}

      {/* Notification Viewer */}
      <NotificationViewer
        isOpen={isNotificationViewerOpen}
        onClose={() => {
          setIsNotificationViewerOpen(false);
          loadUnreadCount();
        }}
      />
    </>
  );
}