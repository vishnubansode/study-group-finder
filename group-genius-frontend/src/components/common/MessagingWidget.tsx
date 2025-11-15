import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { 
  X, 
  MessageCircle, 
  Minimize2, 
  Clock, 
  User, 
  Bot, 
  History,
  Search,
  Plus,
  ChevronLeft
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  messages: ChatMessage[];
}

interface MessagingWidgetProps {
  position?: { x: number; y: number };
  onPositionChange?: (position: { x: number; y: number }) => void;
  anchor?: 'bottom-left' | 'top-left';
  onOpenChange?: (isOpen: boolean) => void;
}

export const MessagingWidget: React.FC<MessagingWidgetProps> = ({
  position = { x: 20, y: 20 },
  onPositionChange,
  anchor = 'top-left',
  onOpenChange
}) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showSidebar, setShowSidebar] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const widgetRef = useRef<HTMLDivElement>(null);
  const floatingButtonRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const movedRef = useRef(false);
  const initialDragPos = useRef({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Pre-defined responses for common queries
  const responseMap: { [key: string]: string } = {
    // Group Management
    'how to join a group': `To join a study group:\n\n1. 📚 Go to "Groups" section\n2. 🔍 Browse available groups\n3. 💡 Click on a group card\n4. ✅ Press "Join Group"\n5. ⏳ Wait for approval if needed\n\nYou'll receive a confirmation notification!`,

    'join group': `Ready to join a group?\n\n• Visit Groups page\n• Find interesting groups\n• Click "Join Group"\n• Get approved by admin\n• Start collaborating!`,

    'how to create a group': `Creating a study group:\n\n1. 👥 Go to "Groups" section\n2. 🆕 Click "Create New Group"\n3. 📝 Fill group details\n4. ⚙️ Set preferences & rules\n5. 🚀 Publish your group\n\nOthers can now find and join!`,

    // Course System
    'how to enroll in a course': `Course Enrollment:\n\n1. 🎓 Go to "Courses" section\n2. 🔎 Search for courses\n3. 📋 View course details\n4. ✅ Press "Enroll" button\n5. 📝 Complete prerequisites\n\nFind peers after enrollment!`,

    'enroll in course': `Quick Enrollment:\n\n• Browse Courses section\n• Search for your course\n• Click "Enroll" button\n• Access course materials\n• Connect with peers!`,

    // Peer Finding
    'find peers': `Finding study peers:\n\n1. 🎓 Enroll in courses first\n2. 📚 Visit "Courses" section\n3. 👥 View "Course Peers" tab\n4. 🔍 Browse students\n5. 🤝 Send connection requests\n\nBuild your study network!`,

    'find study partners': `Find study partners:\n\n• Check course peers\n• Browse group members\n• Use search filters\n• Send invitations\n• Create study sessions`,

    // Account Help
    'reset password': `Password Reset:\n\nOption 1: Through Settings\n• Click profile → Settings → Security\n• Change Password\n\nOption 2: Forgot Password\n• Login page → Forgot Password\n• Check email for reset link`,

    'change password': `Change Password:\n\n1. Click profile picture\n2. Select "Settings"\n3. Go to "Security" tab\n4. Click "Change Password"\n5. Enter new password\n6. Save changes`,

    // Platform Help
    'how to use platform': `Getting Started:\n\n1. 👤 Complete your profile\n2. 🎓 Enroll in courses\n3. 👥 Join study groups\n4. 🤝 Connect with peers\n5. 📅 Schedule sessions\n\nExplore all sections!`,

    'navigation help': `Platform Navigation:\n\n📊 Dashboard - Overview\n🎓 Courses - Enrollment\n👥 Groups - Study groups\n📅 Calendar - Schedule\n💬 Chat - Messages\n👤 Profile - Settings\n\nUse search for quick access!`,

    'help': `I can help you with:\n\n📚 Group Management\n• Joining/Creating groups\n• Group settings\n\n🎓 Course System\n• Enrollment process\n• Course materials\n\n👥 Networking\n• Finding peers\n• Connecting students\n\n⚙️ Account Help\n• Password reset\n• Profile updates\n\nWhat do you need help with?`,

    // Default response
    'default': `I'm here to help you with GroupGenius! 🚀\n\nTry asking about:\n• Joining study groups\n• Course enrollment\n• Finding peers\n• Account settings\n• Platform navigation\n\nWhat would you like to know? 💭`
  };

  // Initialize with default session
  useEffect(() => {
    const savedSessions = localStorage.getItem('groupgenius_chat_sessions');
    if (savedSessions) {
      try {
        const sessions = JSON.parse(savedSessions).map((session: any) => ({
          ...session,
          timestamp: new Date(session.timestamp),
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setChatSessions(sessions);
        
        if (sessions.length > 0) {
          setCurrentSessionId(sessions[0].id);
          setMessages(sessions[0].messages);
        } else {
          createNewSession();
        }
      } catch (error) {
        console.error('Error loading sessions:', error);
        createNewSession();
      }
    } else {
      createNewSession();
    }
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    if (chatSessions.length > 0) {
      localStorage.setItem('groupgenius_chat_sessions', JSON.stringify(chatSessions));
    }
  }, [chatSessions]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen, isMinimized, currentSessionId]);

  // Create new chat session
  const createNewSession = () => {
    const sessionId = `session_${Date.now()}`;
    const newSession: ChatSession = {
      id: sessionId,
      title: 'New Chat',
      preview: 'Start a new conversation...',
      timestamp: new Date(),
      messages: []
    };
    
    setChatSessions(prev => [newSession, ...prev.slice(0, 19)]); // Keep last 20 sessions
    setCurrentSessionId(sessionId);
    setMessages([]);
    setShowSidebar(false);
    
    // Add welcome message
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      content: `👋 Hello${user?.firstName ? `, ${user.firstName}` : ''}! I'm your GroupGenius Assistant.\n\nI can help you with:\n• Study groups\n• Course enrollment\n• Finding peers\n• Platform guidance\n\nWhat would you like help with today?`,
      isUser: false,
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
    updateSession(sessionId, [welcomeMessage]);
  };

  // Update session
  const updateSession = (sessionId: string, updatedMessages: ChatMessage[]) => {
    setChatSessions(prev => prev.map(session => {
      if (session.id === sessionId) {
        const lastMessage = updatedMessages[updatedMessages.length - 1];
        const preview = lastMessage?.content.length > 40 
          ? lastMessage.content.substring(0, 40) + '...' 
          : lastMessage?.content || 'New conversation';
        
        const title = lastMessage?.isUser && lastMessage.content.length > 20
          ? lastMessage.content.substring(0, 20) + '...'
          : 'GroupGenius Assistant';
        
        return {
          ...session,
          title,
          preview,
          timestamp: new Date(),
          messages: updatedMessages
        };
      }
      return session;
    }));
  };

  // Load chat session
  const loadSession = (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
      setShowSidebar(false);
    }
  };

  // Handle drag events for floating button
  const handleFloatingButtonMouseDown = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    // record initial pointer to detect if it's a drag vs click
    initialDragPos.current = { x: e.clientX, y: e.clientY };
    movedRef.current = false;
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
    e.preventDefault();
  };

  const handleFloatingButtonClick = (e: React.MouseEvent) => {
    // prevent opening when this interaction was a drag
    if (movedRef.current) {
      // reset flag and ignore click
      movedRef.current = false;
      return;
    }
    setIsOpen(true);
    onOpenChange?.(true);
  };

  // Handle drag events for widget header
  const handleWidgetMouseDown = (e: React.MouseEvent) => {
    if (!widgetRef.current) return;
    
    const rect = widgetRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
    e.preventDefault();
  };

  // Global mouse move handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !onPositionChange) return;
      // detect if pointer moved beyond threshold to treat as drag
      if (!movedRef.current) {
        const dx = e.clientX - initialDragPos.current.x;
        const dy = e.clientY - initialDragPos.current.y;
        if (Math.sqrt(dx * dx + dy * dy) > 5) {
          movedRef.current = true;
        }
      }
      const newX = e.clientX - dragOffset.x;
      const newTop = e.clientY - dragOffset.y;

      // Calculate bounds based on current state
      const currentWidth = isOpen ? (showSidebar ? 800 : 400) : 56;
      const currentHeight = isOpen ? (isMinimized ? 60 : 500) : 56;

      const boundedX = Math.max(10, Math.min(window.innerWidth - currentWidth - 10, newX));
      const boundedTop = Math.max(10, Math.min(window.innerHeight - currentHeight - 10, newTop));

      if (anchor === 'bottom-left') {
        // Convert top coordinate to bottom offset. Keep a safe minimum so the typing area doesn't get hidden
        const minBottom = 80; // reserve space above bottom nav / taskbar
        const boundedBottom = Math.max(minBottom, window.innerHeight - boundedTop - currentHeight);
        onPositionChange({ x: boundedX, y: boundedBottom });
      } else {
        onPositionChange({ x: boundedX, y: boundedTop });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      // leave movedRef value for click handler to consult; reset shortly after
      setTimeout(() => { movedRef.current = false; }, 50);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging, dragOffset, isOpen, isMinimized, showSidebar, onPositionChange]);

  // Track mobile viewport so we can expand the widget to fill available space on small screens
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Find best response for user message
  const findBestResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase().trim();
    
    // Priority matching for common phrases
    if (lowerMessage.includes('join') && lowerMessage.includes('group')) {
      return responseMap['how to join a group'];
    } else if (lowerMessage.includes('enroll') && lowerMessage.includes('course')) {
      return responseMap['how to enroll in a course'];
    } else if (lowerMessage.includes('create') && lowerMessage.includes('group')) {
      return responseMap['how to create a group'];
    } else if ((lowerMessage.includes('find') || lowerMessage.includes('connect')) && 
        (lowerMessage.includes('peer') || lowerMessage.includes('partner'))) {
      return responseMap['find peers'];
    } else if (lowerMessage.includes('password') || lowerMessage.includes('reset')) {
      return responseMap['reset password'];
    } else if (lowerMessage.includes('profile') || lowerMessage.includes('update')) {
      return responseMap['change password'];
    } else if (lowerMessage.includes('how') && lowerMessage.includes('use')) {
      return responseMap['how to use platform'];
    } else if (lowerMessage.includes('navigate') || lowerMessage.includes('navigation')) {
      return responseMap['navigation help'];
    } else if (lowerMessage.includes('help')) {
      return responseMap['help'];
    }
    
    // Check for exact keyword matches
    for (const [key, value] of Object.entries(responseMap)) {
      if (key !== 'default' && lowerMessage.includes(key)) {
        return value;
      }
    }
    
    return responseMap['default'];
  };

  // Process user message and generate response
  const processMessage = async (userMessage: string) => {
    if (!currentSessionId) return;

    setIsLoading(true);

    // Save user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      content: userMessage,
      isUser: true,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    updateSession(currentSessionId, updatedMessages);

    // Generate response after delay
    setTimeout(() => {
      const response = findBestResponse(userMessage);

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        isUser: false,
        timestamp: new Date()
      };

      const finalMessages = [...updatedMessages, botMessage];
      setMessages(finalMessages);
      updateSession(currentSessionId, finalMessages);
      setIsLoading(false);
    }, 800);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() || !currentSessionId || isLoading) return;

    processMessage(inputValue.trim());
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Filter chat sessions based on search
  const filteredSessions = chatSessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.messages.some(msg => 
      msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  if (!user) return null;

  return (
    <>
      {/* Floating Button - Fully draggable */}
      {!isOpen && (
        <div
          ref={floatingButtonRef}
          className="fixed z-50 cursor-move transition-all duration-200 hover:scale-110"
          style={(() => {
            // Hide floating button on mobile when widget is open state would be true; since we only render when !isOpen,
            // also hide on mobile small screens so it doesn't overlap the pinned input when the widget is open.
            if (isMobile && isOpen) return { display: 'none' } as React.CSSProperties;
            return anchor === 'bottom-left' ? {
              left: `${position.x}px`,
              bottom: `${position.y}px`,
              filter: 'drop-shadow(0 8px 25px rgba(99, 102, 241, 0.3))',
              transition: isDragging ? 'none' : undefined
            } : {
              left: `${position.x}px`,
              top: `${position.y}px`,
              filter: 'drop-shadow(0 8px 25px rgba(99, 102, 241, 0.3))',
              transition: isDragging ? 'none' : undefined
            } as React.CSSProperties;
          })()}
          onMouseDown={handleFloatingButtonMouseDown}
        >
          <Button
            onClick={handleFloatingButtonClick}
            className="rounded-full w-14 h-14 bg-gradient-to-br from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-elegant transition-all duration-300"
            size="icon"
          >
            <MessageCircle className="h-6 w-6 text-white" />
          </Button>
        </div>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div
          ref={widgetRef}
          className="fixed z-50 transition-all duration-300 ease-out flex bg-background rounded-lg overflow-hidden border border-border shadow-2xl"
          style={(() => {
            // Mobile open: use full width and nearly-full height under top nav
            if (isMobile && isOpen) {
              // On mobile we want the widget to use the full available height under the top nav.
              // Snap to bottom (no gap) and remove bottom rounding so it sits flush with viewport bottom.
              const topNavHeight = 56; // approximate top nav height in px
              return {
                left: '0px',
                right: '0px',
                bottom: '0px',
                width: '100vw',
                maxWidth: '100vw',
                height: `calc(100vh - ${topNavHeight}px)`,
                transition: isDragging ? 'none' : undefined,
                borderRadius: '12px 12px 0 0',
                margin: '0',
                overflow: 'hidden'
              } as React.CSSProperties;
            }

            if (anchor === 'bottom-left') {
              return {
                left: `${position.x}px`,
                bottom: `${position.y}px`,
                width: showSidebar ? '800px' : '400px',
                height: isMinimized ? '60px' : '500px',
                transition: isDragging ? 'none' : undefined
              } as React.CSSProperties;
            }

            return {
              left: `${position.x}px`,
              top: `${position.y}px`,
              width: showSidebar ? '800px' : '400px',
              height: isMinimized ? '60px' : '500px',
              transition: isDragging ? 'none' : undefined
            } as React.CSSProperties;
          })()}
        >
          {/* Sidebar - Chat History */}
          {showSidebar && (
            <div className="w-64 bg-card border-r border-border flex flex-col">
              {/* Sidebar Header */}
              <div className="p-4 border-b border-border shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    Chat History
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={createNewSession}
                    className="h-8 w-8 hover:bg-primary/10"
                    title="New Chat"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search chats..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-background border-border/50 text-sm h-9"
                  />
                </div>
              </div>

              {/* Chat Sessions List */}
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  {filteredSessions.map((session) => (
                    <button
                      key={session.id}
                      className={cn(
                        "w-full p-3 rounded-lg text-left transition-all duration-200 border hover:bg-accent/50",
                        currentSessionId === session.id
                          ? "bg-primary/10 border-primary/20 shadow-sm"
                          : "bg-transparent border-transparent hover:border-border"
                      )}
                      onClick={() => loadSession(session.id)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium text-sm truncate flex-1">
                          {session.title}
                        </h4>
                        <span className="text-xs text-muted-foreground ml-2 shrink-0">
                          {formatTime(session.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate leading-relaxed">
                        {session.preview}
                      </p>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDate(session.timestamp)}
                      </div>
                    </button>
                  ))}
                  
                  {filteredSessions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No conversations yet</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={createNewSession}
                        className="mt-2"
                      >
                        Start chatting
                      </Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Main Chat Area */}
          <div className="flex-1 min-h-0 flex flex-col bg-background">
            {/* Header - Draggable Area */}
            <div 
              className={cn(
                "flex items-center justify-between p-4 border-b border-border cursor-move select-none transition-colors",
                isDragging ? "bg-accent/50" : "bg-background"
              )}
              onMouseDown={handleWidgetMouseDown}
            >
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="h-8 w-8 hover:bg-accent"
                  title={showSidebar ? "Hide history" : "Show history"}
                >
                  {showSidebar ? <ChevronLeft className="h-4 w-4" /> : <History className="h-4 w-4" />}
                </Button>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">
                      GroupGenius Assistant
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {isLoading ? "Typing..." : "Online • Ready to help"}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={createNewSession}
                  className="h-8 w-8 hover:bg-accent"
                  title="New chat"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-8 w-8 hover:bg-accent"
                  title={isMinimized ? "Expand" : "Minimize"}
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenChange?.(false);
                  }}
                  className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {isLoading && (
              <div className="px-4 py-2 border-b border-border text-sm text-muted-foreground flex items-center gap-2">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                <span>Typing…</span>
              </div>
            )}

            {!isMinimized && (
              <>
                {/* Messages Area */}
                <div className="flex-1 min-h-0 overflow-hidden">
                  <ScrollArea
                    className={isMobile && isOpen ? "h-full px-3 pt-3" : "h-full p-4"}
                    style={(() => {
                      if (isMobile && isOpen) {
                        return { paddingBottom: 'calc(96px + env(safe-area-inset-bottom, 0px))' } as React.CSSProperties;
                      }
                      if (!isMobile && anchor === 'bottom-left' && !isMinimized) {
                        return { paddingBottom: '90px' } as React.CSSProperties;
                      }
                      return undefined;
                    })()}
                  >
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={cn(
                            "flex gap-3 transition-opacity duration-200",
                            message.isUser ? "flex-row-reverse" : "flex-row"
                          )}
                        >
                          {/* Avatar */}
                          <div className={cn(
                            "shrink-0 w-8 h-8 rounded-full flex items-center justify-center border shadow-sm",
                            message.isUser 
                              ? "bg-gradient-to-br from-primary to-secondary border-primary/20" 
                              : "bg-muted border-border"
                          )}>
                            {message.isUser ? (
                              <User className="h-4 w-4 text-white" />
                            ) : (
                              <Bot className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          
                          {/* Message Bubble */}
                          <div className={cn(
                            "max-w-[80%] rounded-2xl p-3 transition-all duration-200 border shadow-sm",
                            message.isUser
                              ? "bg-gradient-to-br from-primary to-secondary text-primary-foreground border-primary/20 rounded-br-md"
                              : "bg-muted text-foreground border-border rounded-bl-md"
                          )}>
                            <p className="text-sm whitespace-pre-line leading-relaxed break-words">
                              {message.content}
                            </p>
                            <div className={cn(
                              "flex items-center gap-1 mt-2 text-xs",
                              message.isUser ? "text-primary-foreground/80" : "text-muted-foreground"
                            )}>
                              <Clock className="h-3 w-3" />
                              {formatTime(message.timestamp)}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {isLoading && (
                        <div className="flex gap-3">
                          <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-muted border border-border">
                            <Bot className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="bg-muted text-foreground rounded-2xl rounded-bl-md p-3 border border-border">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                </div>

                {/* Input Area */}
                <div
                  className={cn(
                    "shrink-0",
                    isMobile && isOpen ? "p-0 border-0 bg-transparent" : "p-4 border-t border-border bg-background"
                  )}
                  style={isMobile && isOpen ? ({
                    position: 'sticky',
                    bottom: 0,
                    zIndex: 60,
                    left: 0,
                    right: 0,
                    padding: '0 12px 12px',
                    background: 'transparent',
                    pointerEvents: 'none'
                  } as React.CSSProperties) : undefined}
                >
                  <div className={cn(
                    "flex gap-2",
                    isMobile && isOpen ? "pointer-events-auto w-full max-w-none rounded-xl bg-card border border-border shadow-md p-2" : ""
                  )}>
                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Ask about groups, courses, or help..."
                      className={cn(
                        "flex-1 border-border focus:border-primary transition-colors",
                        isMobile && isOpen ? "bg-transparent" : "bg-background"
                      )}
                      disabled={isLoading}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isLoading}
                      className="bg-gradient-to-br from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                      size="icon"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Drag overlay when dragging */}
      {isDragging && (
        <div className="fixed inset-0 z-40 cursor-grabbing" style={{ pointerEvents: 'none' }} />
      )}
    </>
  );
};

export default MessagingWidget;