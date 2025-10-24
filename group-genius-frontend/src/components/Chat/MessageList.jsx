import React, { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

const MessageList = ({ messages, username }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.map((msg, idx) => (
        <MessageBubble key={idx} message={msg} isOwn={msg.sender === username} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
