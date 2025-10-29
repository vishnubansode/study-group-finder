import React, { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil, Trash2, MoreVertical, Download, FileText } from "lucide-react";

const API_ROOT = (import.meta?.env?.VITE_API_BASE_URL ?? "http://localhost:8080").replace(/\/$/, "");



const resolveMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized.startsWith("/uploads/")) {
    const filenameWithParams = normalized.split("/").pop();
    const filename = filenameWithParams ? filenameWithParams.split("?")[0] : null;
    if (filename) {
      return `${API_ROOT}/api/files/${filename}`;
    }
  }

  return `${API_ROOT}${normalized}`;
};

const resolveDocumentViewUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized.startsWith("/uploads/")) {
    const filenameWithParams = normalized.split("/").pop();
    const filename = filenameWithParams ? filenameWithParams.split("?")[0] : null;
    if (filename) {
      return `${API_ROOT}/api/files/view/${filename}`;
    }
  }

  return `${API_ROOT}${normalized}`;
};

const resolveDownloadUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    if (path.includes("/api/files/download/")) return path;
    if (path.includes("/api/files/")) return path.replace("/api/files/", "/api/files/download/");
    return path;
  }

  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized.startsWith("/uploads/")) {
    const filenameWithParams = normalized.split("/").pop();
    const filename = filenameWithParams ? filenameWithParams.split("?")[0] : null;
    if (filename) {
      return `${API_ROOT}/api/files/download/${filename}`;
    }
  }

  return `${API_ROOT}${normalized}`;
};

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
  const menuRef = useRef(null);

  const rawTimestamp = message?.timestamp;
  const time = formatTime(rawTimestamp);


  const senderName = message?.sender || "Unknown";
  const senderImage = message?.senderProfileImageUrl;
  const senderInitial = senderName.slice(0, 1).toUpperCase();
  const resolvedSenderImage = resolveMediaUrl(senderImage);

  const attachmentUrl = resolveMediaUrl(message?.attachmentUrl);
  const attachmentType = (message?.attachmentType || message?.messageType || "TEXT").toUpperCase();
  const hasAttachment = Boolean(attachmentUrl);
  const isImageAttachment = hasAttachment && attachmentType === "IMAGE";
  const isVideoAttachment = hasAttachment && attachmentType === "VIDEO";
  const isAudioAttachment = hasAttachment && attachmentType === "AUDIO";
  const isDocumentAttachment = hasAttachment && !isImageAttachment && !isVideoAttachment && !isAudioAttachment;
  const documentViewUrl = isDocumentAttachment ? resolveDocumentViewUrl(message?.attachmentUrl) : null;
  const downloadUrl = isDocumentAttachment ? resolveDownloadUrl(message?.attachmentUrl) : null;

  const canEdit = isOwn && typeof onEdit === "function";
  const canDelete = isOwn && typeof onDelete === "function";
  const hasMenuActions = canEdit || canDelete;
  const isTextMessage = attachmentType === "TEXT";

  const toggleMenu = (e) => {
    if (!hasMenuActions || !isTextMessage) return;
    e.stopPropagation();
    setShowMenu((prev) => !prev);
  };

  const handleEdit = () => {
    setShowMenu(false);
    if (canEdit && onEdit) onEdit(message);
  };

  const handleDelete = () => {
    setShowMenu(false);
    if (canDelete && onDelete) onDelete(message);
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

  useEffect(() => {
    if (!hasMenuActions && showMenu) {
      setShowMenu(false);
    }
  }, [hasMenuActions, showMenu]);

  // Dev-only debug to help diagnose formatting issues. Remove once verified.
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.debug(
      "[MessageBubble] raw timestamp:",
      rawTimestamp,
      "formatted:",
      time,
      "message id:",
      message?.id,
      "attachment:",
      message?.attachmentUrl,
      "type:",
      attachmentType
    );
  }

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`flex items-start gap-2 max-w-md ${isOwn ? "flex-row-reverse" : ""}`}>
     
        <Avatar className="w-10 h-10 shrink-0 select-none">
          {resolvedSenderImage ? (
            <AvatarImage src={resolvedSenderImage} alt={senderName} />
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
                isOwn ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
              } ${hasAttachment ? "space-y-2" : ""} ${hasMenuActions && isTextMessage ? "pr-10" : ""}`}
            >
              {hasAttachment && (
                <div
                  className={`overflow-hidden rounded-md ${
                    isOwn ? "bg-white/10" : "bg-white"
                  }`}
                >
                  {isImageAttachment && (
                    <img
                      src={attachmentUrl}
                      alt={message?.attachmentName || "Shared image"}
                      className="max-h-60 w-full object-cover"
                      loading="lazy"
                    />
                  )}
                  {isVideoAttachment && (
                    <video
                      controls
                      className="max-h-60 w-full rounded-md"
                      src={attachmentUrl}
                    >
                      Your browser does not support the video element.
                    </video>
                  )}
                  {isAudioAttachment && (
                    <div className={`p-2 ${isOwn ? "bg-white/5" : "bg-gray-100"}`}>
                      <audio controls className="w-full">
                        <source src={attachmentUrl} />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}
                  {isDocumentAttachment && (
                    <div className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm transition ${
                      isOwn ? "border-white/40 bg-white/10 text-white hover:bg-white/20" : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}>
                      <a
                        href={downloadUrl || attachmentUrl}
                        download
                        className="flex items-center gap-2 truncate flex-1"
                      >
                        <FileText className="h-4 w-4" />
                        <span className="truncate">{message?.attachmentName || message?.content || 'Open attachment'}</span>
                      </a>
                      {downloadUrl && (
                        <a
                          href={downloadUrl}
                          className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${isOwn ? "border-white/40 text-white hover:bg-white/20" : "border-gray-200 text-gray-700 hover:bg-gray-200"}`}
                          aria-label="Download attachment"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}
              {message?.content && (
                <div className="text-sm whitespace-pre-wrap break-words">{message?.content}</div>
              )}
              {message?.edited && (
                <div className="text-[10px] opacity-70 mt-1">(edited)</div>
              )}
            </div>

            {/* Three-dot menu button: only show for text messages, positioned on the right with proper spacing */}
            {hasMenuActions && isTextMessage && (
              <button
                onClick={toggleMenu}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all ${
                  isOwn 
                    ? "hover:bg-blue-400/30 text-white/90 hover:text-white" 
                    : "hover:bg-gray-300/80 text-gray-600 hover:text-gray-800"
                }`}
                aria-label="Message options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            )}

            {/* Dropdown menu */}
            {showMenu && (
              <div
                ref={menuRef}
                className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 min-w-[160px]"
              >
                {canEdit && (
                  <button
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                    onClick={handleEdit}
                  >
                    <Pencil className="w-4 h-4" />
                    Edit Message
                  </button>
                )}
                {canDelete && (
                  <button
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-red-600 flex items-center gap-2"
                    onClick={handleDelete}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Message
                  </button>
                )}
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
