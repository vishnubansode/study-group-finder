import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

const MessageBubble = ({ message, isOwn }) => {
  const rawTimestamp = message?.timestamp;
  const time = formatTime(rawTimestamp);

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
          <div
            className={`px-3 py-2 rounded-lg ${
              isOwn ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
            }`}
          >
            <div className="text-sm whitespace-pre-wrap break-words">{message?.content}</div>
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
