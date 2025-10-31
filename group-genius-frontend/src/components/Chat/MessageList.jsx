import React, { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

const parseTimestamp = (ts) => {
  if (ts === null || ts === undefined || ts === "") return null;
  let date = null;
  if (typeof ts === 'number') {
    date = ts < 1e12 ? new Date(ts * 1000) : new Date(ts);
  } else if (/^\d+$/.test(String(ts))) {
    const n = parseInt(ts, 10);
    date = n < 1e12 ? new Date(n * 1000) : new Date(n);
  } else {
    date = new Date(ts);
  }
  if (!date || Number.isNaN(date.getTime())) return null;
  return date;
};

const getDateLabel = (timestamp) => {
  if (!timestamp) return null;

  const msgDate = parseTimestamp(timestamp);
  if (!msgDate) return null;
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Reset time parts for comparison
  const msgDay = new Date(msgDate.getFullYear(), msgDate.getMonth(), msgDate.getDate());
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const yesterdayDay = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
  
  if (msgDay.getTime() === todayDay.getTime()) {
    return "Today";
  } else if (msgDay.getTime() === yesterdayDay.getTime()) {
    return "Yesterday";
  } else {
    // Format as "Month Date" (e.g., "October 25")
    return msgDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  }
};

const MessageList = ({ messages, username, userId, onEdit, onDelete }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  let lastDateLabel = null;

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.map((msg, idx) => {
        const ownById = typeof msg.senderId !== 'undefined' && typeof userId !== 'undefined'
          ? msg.senderId === userId
          : false;
        const ownByName = msg.sender === username;
        const isOwn = ownById || ownByName;
        const messageKey = msg.id ?? msg.clientMessageId ?? `${idx}-${msg.timestamp ?? 'pending'}`;
        
        // Determine if we should show a date separator
        const currentDateLabel = getDateLabel(msg.timestamp);
        const showDateSeparator = currentDateLabel && currentDateLabel !== lastDateLabel;
        lastDateLabel = currentDateLabel;
        
        return (
          <React.Fragment key={messageKey}>
            {showDateSeparator && (
              <div className="flex justify-center my-4">
                <div className="bg-gray-200 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                  {currentDateLabel}
                </div>
              </div>
            )}
            <MessageBubble 
              message={msg} 
              isOwn={isOwn}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </React.Fragment>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
