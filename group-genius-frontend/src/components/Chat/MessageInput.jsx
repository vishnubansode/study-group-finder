import React, { useRef, useState, useEffect, useCallback } from "react";
import { Loader2, Paperclip, Send } from "lucide-react";

const ACCEPTED_TYPES = "image/*,video/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar,.7z";

const MessageInput = ({ onSend, onUpload, onTyping, disabled = false, isUploading = false }) => {
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Notify typing stopped when user stops typing for 2 seconds
  const notifyTypingStopped = useCallback(() => {
    console.log('[MessageInput] Notifying typing stopped');
    if (typeof onTyping === "function") {
      onTyping(false);
    }
  }, [onTyping]);

  // Handle text change and emit typing indicator
  const handleTextChange = useCallback((e) => {
    const newText = e.target.value;
    setText(newText);

    // Notify that user is typing
    if (typeof onTyping === "function" && newText.trim()) {
      console.log('[MessageInput] Notifying typing started');
      onTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator after 2 seconds of inactivity
    if (newText.trim()) {
      typingTimeoutRef.current = setTimeout(notifyTypingStopped, 2000);
    } else {
      // If text is empty, immediately stop typing indicator
      notifyTypingStopped();
    }
  }, [onTyping, notifyTypingStopped]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || typeof onSend !== "function") return;

    // Clear typing timeout and notify typing stopped
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    notifyTypingStopped();

    try {
      setIsSending(true);
      const result = await Promise.resolve(onSend(trimmed));
      if (result !== false) {
        setText("");
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleFileButtonClick = () => {
    if (disabled || isUploading || isSending) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    if (typeof onUpload !== "function") return;
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    try {
      setIsSending(true);
      const success = await Promise.resolve(onUpload(file, text.trim()));
      if (success !== false) {
        setText("");
      }
    } catch (err) {
      console.error("Attachment upload failed", err);
    } finally {
      setIsSending(false);
      event.target.value = "";
    }
  };

  const busy = disabled || isUploading || isSending;

  return (
    <form onSubmit={handleSend} className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleFileButtonClick}
        className="flex h-12 w-12 md:h-10 md:w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition disabled:opacity-50"
        disabled={busy}
        aria-label="Attach file"
      >
        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        className="flex-1 h-12 md:h-10 rounded-full border border-gray-200 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        type="text"
        placeholder="Type a message or add a caption..."
        value={text}
        onChange={handleTextChange}
      />
      <button
        type="submit"
        className="flex h-12 md:h-10 items-center gap-2 rounded-full bg-blue-500 px-5 md:px-4 text-white transition hover:bg-blue-600 disabled:opacity-60"
        disabled={busy || !text.trim()}
      >
        {isSending && !isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">Send</span>
      </button>
    </form>
  );
};

export default MessageInput;
