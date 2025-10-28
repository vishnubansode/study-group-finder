import React, { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil, Trash2, MoreVertical } from "lucide-react";

const formatTime = (ts) => {
  try {
    if (ts === null || ts === undefined || ts === "") return "";

 
    let date;
    if (typeof ts === "number") {
      
      date = ts < 1e12 ? new Date(ts * 1000) : new Date(ts);
    } else if (/^\d+$/.test(String(ts))) {
  
      const n = parseInt(ts, 10);
      date = n < 1e12 ? new Date(n * 1000) : new Date(n);
    } else {
      date = new Date(ts);
    }

    if (isNaN(date.getTime())) return "";

   
    return date.toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch (e) {
    return "";
  }
};

const MessageBubble = ({ message, isOwn, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const menuRef = useRef(null);

  const rawTimestamp = message?.timestamp;
  const time = formatTime(rawTimestamp);

  // Check if message is within 1 minute (60000ms) for edit/delete
  useEffect(() => {
    const checkEditability = () => {
      if (!message?.timestamp) {
        setCanEdit(false);
        return;
      }

      let messageTime;
      const ts = message.timestamp;
      
      if (typeof ts === "number") {
        messageTime = ts < 1e12 ? ts * 1000 : ts;
      } else if (/^\d+$/.test(String(ts))) {
        const n = parseInt(ts, 10);
        messageTime = n < 1e12 ? n * 1000 : n;
      } else {
        messageTime = new Date(ts).getTime();
      }

      const now = Date.now();
      const timeDiff = now - messageTime;
      const oneMinute = 60000; // 60 seconds in milliseconds

      setCanEdit(isOwn && timeDiff <= oneMinute);
    };

    checkEditability();
    // Re-check every 10 seconds
    const interval = setInterval(checkEditability, 10000);

    return () => clearInterval(interval);
  }, [message?.timestamp, isOwn]);

  const toggleMenu = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleEdit = () => {
    setShowMenu(false);
    if (onEdit) onEdit(message);
  };

  const handleDelete = () => {
    setShowMenu(false);
    if (onDelete) onDelete(message);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  // Dev-only debug to help diagnose formatting issues. Remove once verified.
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.debug("[MessageBubble] raw timestamp:", rawTimestamp, "formatted:", time, "message id:", message?.id);
  }
  const senderName = message?.sender || "Unknown";
  const senderPhone = message?.senderPhone || "";
  const senderImage = message?.senderProfileImageUrl;
  const senderInitial = senderName.slice(0, 1).toUpperCase();

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`flex items-start gap-2 max-w-md ${isOwn ? "flex-row-reverse" : ""}`}>
     
        <Avatar className="w-10 h-10 shrink-0 select-none">
          {senderImage ? (
            <AvatarImage src={senderImage} alt={senderName} />
          ) : null}
          <AvatarFallback>{senderInitial}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
         
          {!isOwn && (
            <div className="mb-1">
              <div className="font-semibold text-sm">{senderName}</div>
            </div>
          )}

          {/* Message bubble */}
          <div className="relative">
            <div
              className={`px-3 py-2 rounded-lg ${
                isOwn ? "bg-blue-500 text-white pr-8" : "bg-gray-200 text-black"
              }`}
            >
              <div className="text-sm whitespace-pre-wrap break-words">{message?.content}</div>
              {message?.edited && (
                <div className="text-[10px] opacity-70 mt-1">(edited)</div>
              )}
            </div>
            
            {/* Three-dot menu button - always visible for own messages */}
            {isOwn && (
              <button
                onClick={toggleMenu}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-blue-400/70 transition-colors"
                aria-label="Message options"
              >
                <MoreVertical className="w-3 h-3 text-white" />
              </button>
            )}

            {/* Dropdown menu */}
            {showMenu && (
              <div
                ref={menuRef}
                className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 min-w-[160px]"
              >
                <button
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                  onClick={handleEdit}
                >
                  <Pencil className="w-4 h-4" />
                  Edit Message
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-red-600 flex items-center gap-2"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Message
                </button>
              </div>
            )}
          </div>
          
          {/* Timestamp below the bubble */}
          <div className={`text-[10px] text-muted-foreground mt-1 ${isOwn ? "text-right" : "text-left"}`}>
            {time}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
