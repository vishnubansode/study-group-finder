import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navigation } from "@/components/layout/Navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { MessagingWidget } from "@/components/common/MessagingWidget";
import { useState, useEffect } from "react";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ChangePassword from "./pages/ChangePassword";
import Dashboard from "./pages/Dashboard";
import Groups from "./pages/Groups";
import Courses from "./pages/Courses";
import Chat from "./pages/Chat";
import CalendarPage from "./pages/Calendar";
import Profile from "./pages/Profile";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

const AppShell = () => {
  const { user, isLoading } = useAuth();
  // position.y is interpreted as bottom offset when anchor='bottom-left'
  // Use a larger default bottom offset so the widget (and its typing area) sits above any bottom nav/taskbar
  const [widgetPosition, setWidgetPosition] = useState({ x: 20, y: 80 }); // x: left offset, y: bottom offset

  // Ensure widget is anchored to bottom-left on mount and stays at the same bottom offset on resize.
  useEffect(() => {
    const setBottomLeft = () => {
      setWidgetPosition({ x: 20, y: 80 });
    };

    setBottomLeft();
    window.addEventListener('resize', setBottomLeft);
    return () => window.removeEventListener('resize', setBottomLeft);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-muted-foreground">Loading your experience...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
  <Navigation />
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 ${user ? 'lg:ml-64' : ''}`}>
          <Routes>
            <Route path="/" element={user ? <Navigate to={`/dashboard/${user.id}`} replace /> : <Index />} />
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
            <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
            <Route path="/reset-password" element={<GuestRoute><ResetPassword /></GuestRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/:id" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
            <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} /> 
            <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          {user && (
            <MessagingWidget
              position={widgetPosition}
              onPositionChange={setWidgetPosition}
              anchor="bottom-left"
            />
          )}
        </main>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const GuestRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (user) return <Navigate to={`/dashboard/${user.id}`} replace />;
  return children;
};

export default App;
