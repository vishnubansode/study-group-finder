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
  
  // Get current UTC time
  const now = new Date();
  const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const yesterdayUTC = todayUTC - 24 * 60 * 60 * 1000;
  
  // Get message date in UTC
  const msgUTC = Date.UTC(msgDate.getUTCFullYear(), msgDate.getUTCMonth(), msgDate.getUTCDate());
  
  if (msgUTC === todayUTC) {
    return "Today";
  } else if (msgUTC === yesterdayUTC) {
    return "Yesterday";
  } else {
    // Format as "Month Date" using UTC (e.g., "October 25")
    return msgDate.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      timeZone: 'UTC'
    });
  }
};

const MessageList = ({ messages, username, userId, onEdit, onDelete, typingIndicator }) => {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    requestAnimationFrame(() => {
      try {
        containerRef.current.scrollTo({
          top: containerRef.current.scrollHeight,
          behavior: "smooth",
        });
      } catch (err) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    });
  }, [messages, typingIndicator]);

  let lastDateLabel = null;
  const hasMessages = messages && messages.length > 0;

  // Debug logging
  useEffect(() => {
    console.log('[MessageList] Messages:', messages?.length || 0, messages);
  }, [messages]);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto p-4">
      {!hasMessages && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">No messages yet</p>
            <p className="text-xs mt-1">Start the conversation!</p>
          </div>
        </div>
      )}
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
      {typingIndicator && (
        <div className="flex items-center gap-2 px-3 py-2 mb-2 text-sm italic bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
          <span className="text-blue-700 font-medium">{typingIndicator}</span>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
