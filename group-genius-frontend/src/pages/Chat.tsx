import { useState, useEffect, useRef } from "react";
import {
  Send,
  Hash,
  Users,
  MoreVertical,
  Plus,
  Info,
  FileText,
  Loader2,
  Menu,
  X,
} from "lucide-react";

const chatChannels = [
  { id: 1, name: "general", unread: 0, members: 15 },
  { id: 2, name: "assignments", unread: 3, members: 12 },
  { id: 3, name: "study-sessions", unread: 7, members: 8 },
  { id: 4, name: "resources", unread: 0, members: 15 },
];

const initialMessages = [
  {
    id: 1,
    user: "Sarah Chen",
    avatar: "SC",
    message: "Hey team! Welcome to chat.",
    timestamp: "10:30 AM",
  },
  {
    id: 2,
    user: "Mike Johnson",
    avatar: "MJ",
    message: "Hello ! team 👀",
    timestamp: "10:32 AM",
  },
];

export default function Chat() {
  const [activeChannel, setActiveChannel] = useState(chatChannels[0]);
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [showDocumentEditor, setShowDocumentEditor] = useState(false);
  const [documentText, setDocumentText] = useState(
    "Collaborative document content goes here..."
  );
  const [lastUpdated, setLastUpdated] = useState({
    user: "Sarah Chen",
    time: "11:00 AM",
  });
  const [showInfo, setShowInfo] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showAddChannel, setShowAddChannel] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const newMsg = {
      id: messages.length + 1,
      user: "You",
      avatar: "U",
      message: newMessage,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setNewMessage("");
    setTypingUser(null);
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (e.target.value.trim()) setTypingUser("You");
    else setTypingUser(null);
  };

  const Button = ({
    onClick,
    children,
    className = "",
    disabled = false,
  }: {
    onClick?: () => void;
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-2 rounded-md text-sm font-medium border border-gray-200 hover:bg-gray-100 transition disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );

  const Input = ({
    value,
    onChange,
    onKeyDown,
    placeholder,
    className = "",
  }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    placeholder?: string;
    className?: string;
  }) => (
    <input
      type="text"
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className={`border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    />
  );

  const Badge = ({ children }: { children: React.ReactNode }) => (
    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full ml-2">
      {children}
    </span>
  );

  // ---------------------- JSX ----------------------
  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50 text-gray-900 overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden flex justify-between items-center p-4 border-b bg-white shadow-sm">
        <h2 className="font-semibold text-lg">CS 101 Study Group</h2>
        <Button onClick={() => setShowSidebar(!showSidebar)}>
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 left-0 z-30 bg-white border-r w-64 h-full flex flex-col transform transition-transform duration-300 ease-in-out ${
          showSidebar ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold hidden lg:block">CS 101 Study Group</h2>
          <Button onClick={() => setShowOptions(!showOptions)}>
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>

        {/* Sidebar Options Popup */}
        {showOptions && (
          <div className="absolute right-4 top-12 bg-white shadow-lg rounded-lg border w-40 text-sm z-40">
            <button
              onClick={() => alert("Settings clicked")}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Settings
            </button>
            <button
              onClick={() => alert("Logout clicked")}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        )}

        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-6">
            {/* Channels */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Channels
                </h3>
                <Button onClick={() => setShowAddChannel(true)}>
                  <Plus className="w-3 h-3" />
                </Button>
              </div>

              <div className="space-y-1">
                {chatChannels.map((ch) => (
                  <Button
                    key={ch.id}
                    onClick={() => {
                      setActiveChannel(ch);
                      setShowDocumentEditor(false);
                      if (window.innerWidth < 1024) setShowSidebar(false);
                    }}
                    className={`w-full justify-start flex items-center ${
                      activeChannel.id === ch.id
                        ? "bg-blue-100 text-blue-700"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <Hash className="w-4 h-4 mr-2" />
                    <span className="flex-1 text-left capitalize">
                      {ch.name}
                    </span>
                    {ch.unread > 0 && <Badge>{ch.unread}</Badge>}
                  </Button>
                ))}
              </div>
            </div>

            {/* Document Editor Button */}
            <Button
              onClick={() => {
                setShowDocumentEditor(true);
                if (window.innerWidth < 1024) setShowSidebar(false);
              }}
              className={`w-full justify-start ${
                showDocumentEditor ? "bg-blue-100 text-blue-700" : ""
              }`}
            >
              <FileText className="w-4 h-4 mr-2" /> Document Editor
            </Button>
          </div>
        </div>
      </aside>

      {showSidebar && (
        <div
          onClick={() => setShowSidebar(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 lg:hidden"
        ></div>
      )}

      {/* Main Chat */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center space-x-3">
            <Hash className="w-5 h-5 text-gray-500" />
            <div>
              <h1 className="font-semibold text-base capitalize">
                {showDocumentEditor
                  ? "Collaborative Document"
                  : activeChannel.name}
              </h1>
              {!showDocumentEditor && (
                <p className="text-xs text-gray-500">
                  {activeChannel.members} members active
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={() => setShowUsers(true)}>
              <Users className="w-4 h-4" />
            </Button>
            <Button onClick={() => setShowInfo(true)}>
              <Info className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Chat or Document */}
        {!showDocumentEditor ? (
          <>
            <div className="flex-1 px-6 py-4 overflow-y-auto space-y-3 bg-gray-50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="flex items-start space-x-3 hover:bg-gray-100 px-3 py-2 rounded-lg transition"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-xs font-semibold text-white">
                    {msg.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm">{msg.user}</span>
                      <span className="text-xs text-gray-500">
                        {msg.timestamp}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">{msg.message}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {typingUser && (
              <div className="px-6 py-2 text-xs text-gray-500 flex items-center space-x-2 bg-gray-50">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>{typingUser} is typing...</span>
              </div>
            )}

            <div className="border-t p-4 flex items-center space-x-3 bg-white">
              <Input
                placeholder={`Message #${activeChannel.name}`}
                value={newMessage}
                onChange={handleTyping}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                <Send className="w-4 h-4 mr-1" /> Send
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
              <textarea
                className="w-full min-h-[60vh] border border-gray-300 rounded-lg p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={documentText}
                onChange={(e) => {
                  setDocumentText(e.target.value);
                  setLastUpdated({
                    user: "You",
                    time: new Date().toLocaleTimeString(),
                  });
                }}
              />
            </div>
            <div className="border-t p-3 flex justify-between text-xs text-gray-500 bg-white">
              <span>Last updated by {lastUpdated.user}</span>
              <span>{lastUpdated.time}</span>
            </div>
          </div>
        )}
      </main>

      {/* --- Info Modal --- */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80 text-sm relative">
            <button
              onClick={() => setShowInfo(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-semibold mb-2">Group Info</h3>
            <p className="text-gray-600">
              This group is for CS 101 students to discuss assignments and
              collaborate on projects.
            </p>
          </div>
        </div>
      )}

      {/* --- Users Modal --- */}
      {showUsers && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80 text-sm relative">
            <button
              onClick={() => setShowUsers(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-semibold mb-2">Active Members</h3>
            <ul className="text-gray-700 space-y-1">
              <li>Sarah Chen</li>
              <li>Mike Johnson</li>
              <li>Emma Watson</li>
              <li>You</li>
            </ul>
          </div>
        </div>
      )}

      {/* --- Add Channel Modal --- */}
      {showAddChannel && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80 text-sm relative">
            <button
              onClick={() => setShowAddChannel(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-semibold mb-2">Add New Channel</h3>
            <input
              type="text"
              placeholder="Channel name..."
              className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm"
            />
            <button
              onClick={() => alert("New channel added (sample)")}
              className="mt-3 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            >
              Add Channel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
