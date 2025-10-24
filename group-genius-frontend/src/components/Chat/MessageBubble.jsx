import React from "react";

const MessageBubble = ({ message, isOwn }) => (
  <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2`}>
    <div
      className={`px-3 py-2 rounded-2xl max-w-xs ${
        isOwn ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
      }`}
    >
      <div className="text-sm">{message.content}</div>
      <div className="text-[10px] text-gray-700 mt-1 text-right">
        {message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : ''}
      </div>
    </div>
  </div>
);
export default MessageBubble;
