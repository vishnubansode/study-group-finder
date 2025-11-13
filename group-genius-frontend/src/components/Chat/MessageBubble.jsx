import React, { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil, Trash2, MoreVertical, Download, FileText, Music, Mic, Reply, Smile } from "lucide-react";
import { resolveMediaUrl, resolveDocumentUrl, resolveDownloadUrl } from "@/lib/media";

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

    // Apply +5:30 offset for IST
    const offsetMilliseconds = (5 * 60 + 30) * 60 * 1000;
    const adjustedDate = new Date(date.getTime() + offsetMilliseconds);

    // Format time in UTC to reflect the manual offset
    return adjustedDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC'
    });
  } catch (e) {
    return "";
  }
};

const MessageBubble = ({ message, isOwn, onEdit, onDelete, onReply, onReact }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);
  const menuRef = useRef(null);
  const audioRef = useRef(null);

  // Check if this image was already downloaded by checking localStorage
  const getDownloadKey = () => {
    if (!message?.id && !message?.attachmentUrl) return null;
    return `downloaded_${message.id || message.attachmentUrl}`;
  };

  const [imageDownloaded, setImageDownloaded] = useState(() => {
    const key = getDownloadKey();
    if (!key) return false;
    return localStorage.getItem(key) === 'true';
  });

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
  const documentViewUrl = isDocumentAttachment ? resolveDocumentUrl(message?.attachmentUrl) : null;
  const downloadUrl = isDocumentAttachment ? resolveDownloadUrl(message?.attachmentUrl) : null;

  const canEdit = isOwn && typeof onEdit === "function";
  const canDelete = isOwn && typeof onDelete === "function";
  const canReply = !isOwn && typeof onReply === "function";
  const canReact = typeof onReact === "function";
  const hasMenuActions = canEdit || canDelete || canReply || canReact;
  const isTextMessage = attachmentType === "TEXT";

  const toggleMenu = (e) => {
    if (!hasMenuActions) return;
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

  const handleReply = () => {
    setShowMenu(false);
    if (canReply && onReply) onReply(message);
  };

  const handleReact = () => {
    setShowMenu(false);
    if (canReact && onReact) onReact(message);
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const formatAudioTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const saveDownloadMetadata = (type) => {
    // Get groupId from message or URL
    const groupId = message?.groupId || message?.recipientId;
    if (!groupId || !message?.id) return;

    const downloadKey = `download_${groupId}_${message.id}`;
    const metadata = {
      messageId: message.id,
      url: attachmentUrl,
      type: type,
      name: message?.attachmentName || `file_${message.id}`,
      size: message?.attachmentSize || 0,
      downloadedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(downloadKey, JSON.stringify(metadata));
    } catch (e) {
      console.error('Failed to save download metadata:', e);
    }
  };

  const handleImageDownload = async () => {
    if (!attachmentUrl || isDownloadingImage) return;
    
    setIsDownloadingImage(true);
    try {
      const response = await fetch(attachmentUrl);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = message?.attachmentName || 'image.jpg';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Mark as downloaded in state and localStorage so blur stays off
      const key = getDownloadKey();
      if (key) {
        localStorage.setItem(key, 'true');
      }
      setImageDownloaded(true);
      
      // Save download metadata for gallery
      saveDownloadMetadata('IMAGE');
      
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Image download failed:', error);
    } finally {
      setIsDownloadingImage(false);
    }
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
          <div className="relative group">
            <div
              className={`px-3 py-2 rounded-lg ${
                isOwn ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
              } ${hasAttachment ? "space-y-2" : ""}`}
            >
              {hasAttachment && (
                <div
                  className={`overflow-hidden rounded-md ${
                    isOwn ? "bg-white/10" : "bg-white"
                  }`}
                >
                  {isImageAttachment && (
                    <div className="relative max-w-xs group">
                      <img
                        src={attachmentUrl}
                        alt={message?.attachmentName || "Shared image"}
                        className={`max-h-80 w-full object-cover rounded-md transition-all ${
                          !isOwn && !imageDownloaded ? "blur-[50px] scale-105" : ""
                        }`}
                        loading="lazy"
                        style={!isOwn && !imageDownloaded ? { filter: 'blur(50px)' } : {}}
                      />
                      
                      {/* Download overlay for receiver (blurred image) */}
                      {!isOwn && !imageDownloaded && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-md">
                          <button
                            onClick={handleImageDownload}
                            disabled={isDownloadingImage}
                            className="flex flex-col items-center gap-2 px-6 py-4 bg-white/90 hover:bg-white rounded-lg transition-all active:scale-95 disabled:opacity-50"
                          >
                            {isDownloadingImage ? (
                              <>
                                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                <span className="text-sm font-medium text-gray-700">Downloading...</span>
                              </>
                            ) : (
                              <>
                                <Download className="w-8 h-8 text-blue-500" />
                                <span className="text-sm font-medium text-gray-900">Download to View</span>
                                <span className="text-xs text-gray-500">
                                  {message?.attachmentSize 
                                    ? `${(message.attachmentSize / 1024 / 1024).toFixed(1)} MB`
                                    : 'Tap to download'}
                                </span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                      
                      {/* Download button for sender OR after receiver downloads */}
                      {(isOwn || imageDownloaded) && (
                        <button
                          onClick={handleImageDownload}
                          disabled={isDownloadingImage}
                          className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                          aria-label="Download image"
                        >
                          {isDownloadingImage ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  )}
                  {isVideoAttachment && (
                    <div className="relative group">
                      <video
                        controls
                        className="max-h-60 w-full rounded-md"
                        src={attachmentUrl}
                      >
                        Your browser does not support the video element.
                      </video>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          const link = document.createElement('a');
                          link.href = resolveDownloadUrl(message?.attachmentUrl) || attachmentUrl;
                          link.download = message?.attachmentName || 'video.mp4';
                          link.click();
                          saveDownloadMetadata('VIDEO');
                        }}
                        className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Download video"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {isAudioAttachment && (
                    <div className={`rounded-xl p-3 min-w-[280px] max-w-sm ${
                      isOwn ? "bg-white/10 backdrop-blur-sm" : "bg-white shadow-sm"
                    }`}>
                      <div className="flex items-center gap-3">
                        {/* Play/Pause Button */}
                        <button
                          onClick={handlePlayPause}
                          className={`relative w-12 h-12 rounded-full flex items-center justify-center cursor-pointer shrink-0 transition-all ${
                            isOwn 
                              ? "bg-white text-blue-500 hover:bg-white/90 active:scale-95 shadow-lg" 
                              : "bg-blue-500 hover:bg-blue-600 active:scale-95 shadow-lg"
                          }`}
                        >
                          {isPlaying ? (
                            // Pause icon (two bars)
                            <div className="flex gap-1.5">
                              <div className={`w-1 h-5 rounded-sm ${isOwn ? "bg-blue-500" : "bg-white"}`}></div>
                              <div className={`w-1 h-5 rounded-sm ${isOwn ? "bg-blue-500" : "bg-white"}`}></div>
                            </div>
                          ) : (
                            // Play icon (triangle)
                            <div 
                              className="w-0 h-0 ml-1"
                              style={{
                                borderLeft: `14px solid ${isOwn ? '#3b82f6' : 'white'}`,
                                borderTop: '9px solid transparent',
                                borderBottom: '9px solid transparent'
                              }}
                            ></div>
                          )}
                        </button>
                        
                        {/* Hidden audio element */}
                        <audio 
                          ref={audioRef}
                          src={attachmentUrl}
                          onLoadedMetadata={(e) => setAudioDuration(e.target.duration)}
                          onTimeUpdate={(e) => setAudioProgress((e.target.currentTime / e.target.duration) * 100)}
                          onPlay={() => setIsPlaying(true)}
                          onPause={() => setIsPlaying(false)}
                          onEnded={() => {
                            setIsPlaying(false);
                            setAudioProgress(0);
                          }}
                        />
                        
                        {/* Waveform and progress */}
                        <div className="flex-1 min-w-0">
                          {/* File name */}
                          <div className={`text-xs font-medium truncate mb-2 ${
                            isOwn ? "text-white/90" : "text-gray-700"
                          }`}>
                            <Music className="w-3 h-3 inline mr-1 -mt-0.5" />
                            {message?.attachmentName || "Voice Message"}
                          </div>
                          
                          {/* Progress bar */}
                          <div className="relative mb-2 h-1 rounded-full overflow-hidden bg-gray-300">
                            {/* Grey background (total length) - already applied above */}
                            {/* Progress fill (white/blue line showing current position) */}
                            <div 
                              className={`absolute top-0 left-0 h-full rounded-full transition-all duration-100 ${
                                isOwn ? "bg-white" : "bg-blue-600"
                              }`}
                              style={{ width: `${audioProgress}%` }}
                            />
                          </div>
                          
                          {/* Time display */}
                          <div className={`text-[10px] flex justify-between ${
                            isOwn ? "text-white/70" : "text-gray-500"
                          }`}>
                            <span>
                              {audioRef.current ? formatAudioTime(audioRef.current.currentTime) : '0:00'}
                            </span>
                            <span>
                              {formatAudioTime(audioDuration)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Download Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const link = document.createElement('a');
                            link.href = downloadUrl || attachmentUrl;
                            link.download = message?.attachmentName || 'audio.mp3';
                            link.click();
                            saveDownloadMetadata('AUDIO');
                          }}
                          className={`p-2 rounded-full shrink-0 transition-all ${
                            isOwn 
                              ? "hover:bg-white/20 text-white/80 hover:text-white active:scale-90" 
                              : "hover:bg-gray-100 text-gray-600 hover:text-gray-900 active:scale-90"
                          }`}
                          aria-label="Download audio"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  {isDocumentAttachment && (
                    <div className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm transition ${
                      isOwn ? "border-white/40 bg-white/10 text-white hover:bg-white/20" : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}>
                      <a
                        href={downloadUrl || attachmentUrl}
                        download
                        onClick={() => saveDownloadMetadata('DOCUMENT')}
                        className="flex items-center gap-2 truncate flex-1"
                      >
                        <FileText className="h-4 w-4" />
                        <span className="truncate">{message?.attachmentName || 'Document'}</span>
                      </a>
                      {downloadUrl && (
                        <a
                          href={downloadUrl}
                          onClick={() => saveDownloadMetadata('DOCUMENT')}
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
              {/* Show caption/text only if it's different from attachment name */}
              {message?.content && message?.content !== message?.attachmentName && (
                <div className="text-sm whitespace-pre-wrap break-words">{message?.content}</div>
              )}
              {message?.edited && (
                <div className="text-[10px] opacity-70 mt-1">(edited)</div>
              )}
            </div>

            {/* Three-dot menu button - hidden for text messages */}
            {hasMenuActions && !isTextMessage && (
              <button
                onClick={toggleMenu}
                className={`absolute top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all ${
                  isOwn ? "right-2" : "left-2"
                } ${
                  isOwn
                    ? "bg-white/20 text-white hover:bg-white/30"
                    : "bg-black/20 text-black hover:bg-black/30"
                } opacity-0 group-hover:opacity-100`}
                aria-label="Message options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            )}

             {/* Dropdown menu */}
             {showMenu && (
               <div
                 ref={menuRef}
                 className={`absolute ${isOwn ? "right-0" : "left-0"} top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 min-w-[180px]`}
               >
                 {canReply && (
                  <button
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                    onClick={handleReply}
                  >
                    <Reply className="w-4 h-4" />
                    Reply
                  </button>
                )}
                {canReact && (
                  <button
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                    onClick={handleReact}
                  >
                    <Smile className="w-4 h-4" />
                    React
                  </button>
                )}
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
