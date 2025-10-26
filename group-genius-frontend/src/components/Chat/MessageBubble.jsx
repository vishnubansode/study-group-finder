import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const formatTime = (ts) => {
  try {
    return ts ? new Date(ts).toLocaleTimeString() : "";
  } catch {
    return "";
  }
};

const MessageBubble = ({ message, isOwn }) => {
  const time = formatTime(message?.timestamp);
  const senderName = message?.sender || "Unknown";
  const senderPhone = message?.senderPhone || "";
  const senderImage = message?.senderProfileImageUrl;
  const senderInitial = senderName.slice(0, 1).toUpperCase();

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`flex items-start gap-2 max-w-md ${isOwn ? "flex-row-reverse" : ""}`}>
        {/* Avatar with profile image */}
        <Avatar className="w-10 h-10 shrink-0 select-none">
          {senderImage ? (
            <AvatarImage src={senderImage} alt={senderName} />
          ) : null}
          <AvatarFallback>{senderInitial}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* Sender name and phone above bubble */}
          {!isOwn && (
            <div className="mb-1">
              <div className="font-semibold text-sm">{senderName}</div>
              {senderPhone && (
                <div className="text-xs text-muted-foreground">~{senderPhone}</div>
              )}
            </div>
          )}

          {/* Message bubble with timestamp to the right */}
          <div className="flex items-end gap-2">
            <div
              className={`px-3 py-2 rounded-lg ${
                isOwn ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
              }`}
            >
              <div className="text-sm whitespace-pre-wrap break-words">{message?.content}</div>
            </div>
            <div className="text-[10px] text-muted-foreground whitespace-nowrap pb-1">
              {time}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
