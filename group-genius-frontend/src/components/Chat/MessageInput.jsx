import React, { useState } from "react";

const MessageInput = ({ onSend }) => {
  const [text, setText] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <form onSubmit={handleSend} className="flex p-3 border-t bg-white">
      <input
        className="flex-1 border rounded-full px-4 py-2 outline-none"
        type="text"
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit" className="ml-2 bg-blue-500 text-white rounded-full px-4 py-2">
        Send
      </button>
    </form>
  );
};

export default MessageInput;
