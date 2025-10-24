import { useState, useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { Send, Users, Info, Smile, Paperclip, Phone, Video } from "lucide-react";

export default function Chat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [connected, setConnected] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const groupId = "1"; // replace dynamically
  const username = "Sarran"; // replace dynamically
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const clientRef = useRef<Client | null>(null);
  const subRef = useRef<any>(null);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws-chat"),
      reconnectDelay: 5000,
      debug: () => {},
    });

    client.onConnect = () => {
      setConnected(true);
      try {
        subRef.current = client.subscribe(`/ws/group/${groupId}`, (payload) => {
          if (!payload.body) return;
          const msg = JSON.parse(payload.body);
          setMessages((prev) => [...prev, msg]);
        });
      } catch (e) {
        console.error("Subscribe failed", e);
      }
    };

    client.onStompError = (frame) => {
      console.error("Broker error", frame);
      setConnected(false);
    };

    client.onWebSocketClose = () => setConnected(false);

    client.activate();
    clientRef.current = client;

    return () => {
      try {
        if (subRef.current) subRef.current.unsubscribe();
      } catch (e) {}
      if (clientRef.current) clientRef.current.deactivate();
      setConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = () => {
    const client = clientRef.current;
    if (client && connected && newMessage.trim()) {
      const chatMsg = {
        sender: username,
        content: newMessage,
        timestamp: new Date().toISOString(),
      };
      try {
        client.publish({ destination: `/ws/app/chat/${groupId}`, body: JSON.stringify(chatMsg) });
        setMessages((prev) => [...prev, chatMsg]);
        setNewMessage("");
      } catch (e) {
        console.error("Send failed", e);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 border-r bg-white">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h1 className="font-semibold text-gray-800 text-lg">Study Chat</h1>
          <Info size={18} className="text-gray-500" />
        </div>
        <div className="p-4 text-sm text-gray-500">
          <p>Connected: {connected ? "Yes" : "No"}</p>
        </div>
      </div>

      {/* Main Chat Section */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
          <div>
            <h2 className="font-semibold text-gray-800 text-lg">#general</h2>
            <p className="text-sm text-gray-500">Study Group Discussion</p>
          </div>
          <div className="flex items-center space-x-3">
            <Phone className="text-gray-500 cursor-pointer" size={18} />
            <Video className="text-gray-500 cursor-pointer" size={18} />
            <Users
              className="text-gray-500 cursor-pointer"
              size={18}
              onClick={() => setShowMembers(!showMembers)}
            />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.sender === username ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-2xl ${
                  msg.sender === username
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-900"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <div className="text-[10px] opacity-70 mt-1 text-right">
                  {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ""}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef}></div>
        </div>

        {/* Message Input */}
        <div className="p-4 border-t bg-white flex items-center space-x-3">
          <button className="p-2 text-gray-500 hover:text-gray-700">
            <Paperclip size={18} />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700">
            <Smile size={18} />
          </button>
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border rounded-full outline-none focus:ring-1 focus:ring-blue-400"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Members Sidebar */}
      {showMembers && (
        <div className="w-60 border-l bg-white p-4">
          <h3 className="font-semibold mb-2 text-gray-800">Members</h3>
          <p className="text-sm text-gray-500">Online list integration later</p>
        </div>
      )}
    </div>
  );
}
