import React, { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

const MessageList = ({ messages, username, userId }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.map((msg, idx) => {
        const ownById = typeof msg.senderId !== 'undefined' && typeof userId !== 'undefined'
          ? msg.senderId === userId
          : false;
        const ownByName = msg.sender === username;
        const isOwn = ownById || ownByName;
        return (
          <MessageBubble key={idx} message={msg} isOwn={isOwn} />
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
