import React, { useState, useEffect } from "react";
import { X, Download, FileText, Music, Image as ImageIcon, File, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MediaGallery = ({ groupId, onClose }) => {
  const [activeTab, setActiveTab] = useState("all");
  const [downloads, setDownloads] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [replyTo, setReplyTo] = useState(null);

  useEffect(() => {
    loadDownloads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const loadDownloads = () => {
    const allDownloads = [];
    const prefix = `download_${groupId}_`;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        try {
          const raw = JSON.parse(localStorage.getItem(key));
          const url = raw?.url || raw?.attachmentUrl || "";
          const declared = (raw?.type || raw?.attachmentType || "").toString().toUpperCase();
          const extMatch = (url || "").match(/\.([a-z0-9]+)(?:\?|$)/i);
          const ext = extMatch ? extMatch[1].toLowerCase() : "";

          let normalizedType = "DOCUMENT";
          if (declared.includes("VIDEO") || ["mp4", "webm", "mov", "mkv", "avi", "ogg"].includes(ext)) normalizedType = "VIDEO";
          else if (declared.includes("AUDIO") || ["mp3", "wav", "ogg", "opus", "m4a"].includes(ext)) normalizedType = "AUDIO";
          else if (declared.includes("IMAGE") || ["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext)) normalizedType = "IMAGE";

          const imageSubType = normalizedType === "IMAGE" ? (ext === "gif" ? "GIF" : "PHOTO") : null;

          allDownloads.push({ ...(raw || {}), normalizedType, imageSubType, url });
        } catch (e) {
          // ignore malformed entries
        }
      }
    }

    allDownloads.sort((a, b) => new Date(b.downloadedAt || 0) - new Date(a.downloadedAt || 0));
    setDownloads(allDownloads);
  };

  const getFilteredDownloads = () => {
    switch (activeTab) {
      case "images":
        return downloads.filter((d) => d.normalizedType === "IMAGE" || d.normalizedType === "VIDEO");
      case "audio":
        return downloads.filter((d) => d.normalizedType === "AUDIO");
      case "documents":
        return downloads.filter((d) => d.normalizedType === "DOCUMENT");
      default:
        return downloads;
    }
  };

  const renderGalleryGrid = (items) => (
    <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))" }}>
      {items.map((item, idx) => (
        <button
          key={item.messageId || item.url || idx}
          onClick={() => openMediaViewer(item)}
          className="aspect-square w-full overflow-hidden rounded bg-slate-100 dark:bg-slate-800 relative"
          title={item.name || ""}
        >
          {item.normalizedType === "IMAGE" ? (
            <img src={item.url} alt={item.name || "image"} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-black flex items-center justify-center">
              <video src={item.url} className="w-full h-full object-cover" muted playsInline />
            </div>
          )}
        </button>
      ))}
    </div>
  );

  const filteredDownloads = getFilteredDownloads();
  const mediaItems = downloads.filter((d) => d.normalizedType === "IMAGE" || d.normalizedType === "VIDEO");
  const photos = filteredDownloads.filter((d) => d.normalizedType === "IMAGE" && d.imageSubType === "PHOTO");
  const gifs = filteredDownloads.filter((d) => d.normalizedType === "IMAGE" && d.imageSubType === "GIF");
  const videos = filteredDownloads.filter((d) => d.normalizedType === "VIDEO");

  const openMediaViewer = (item) => {
    if (!item) return;
    const idx = mediaItems.findIndex((m) => (m.messageId && item.messageId && m.messageId === item.messageId) || m.url === item.url);
    const finalIndex = idx >= 0 ? idx : Math.max(0, mediaItems.findIndex((m) => m.url === item.url));
    setSelectedMedia(mediaItems[finalIndex] || item);
    setSelectedMediaIndex(finalIndex >= 0 ? finalIndex : 0);
  };

  const closeMediaViewer = () => {
    setSelectedMedia(null);
    setSelectedMediaIndex(0);
  };

  const navigateMedia = (dir) => {
    if (!mediaItems.length) return;
    let ni = selectedMediaIndex + dir;
    if (ni < 0) ni = mediaItems.length - 1;
    if (ni >= mediaItems.length) ni = 0;
    setSelectedMediaIndex(ni);
    setSelectedMedia(mediaItems[ni]);
  };

  const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString();
  };

  const formatFileSize = (bytes) => {
    if (bytes == null) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const tabs = [
    { id: "all", label: "All", icon: Download, count: downloads.length },
    { id: "images", label: "Gallery", icon: ImageIcon, count: downloads.filter((d) => d.normalizedType === "IMAGE" || d.normalizedType === "VIDEO").length },
    { id: "audio", label: "Audio", icon: Music, count: downloads.filter((d) => d.normalizedType === "AUDIO").length },
    { id: "documents", label: "Documents", icon: FileText, count: downloads.filter((d) => d.normalizedType === "DOCUMENT").length },
  ];
  const tabButtonClasses = (id) =>
    `relative px-3 py-2 font-medium transition-all rounded ${
      activeTab === id
        ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-b-2 border-blue-600 dark:border-blue-400"
        : "text-slate-600 dark:text-slate-400 border-b-2 border-transparent hover:text-slate-900 dark:hover:text-slate-100"
    }`;

  const handleReply = (message) => {
    setReplyTo(message);
    // Auto-focus input if needed
    const inputElement = document.querySelector('[data-chat-input]');
    if (inputElement) inputElement.focus();
  };

  const clearReply = () => {
    setReplyTo(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-6xl bg-white dark:bg-slate-900 rounded-lg shadow-lg overflow-hidden my-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 border-b dark:border-slate-700">
          <div className="flex items-center gap-2 min-w-0 w-full sm:w-auto justify-between sm:justify-start">
            <h3 className="text-lg font-semibold">Media</h3>
            <div className="text-sm text-slate-500 hidden sm:block">{downloads.length} items</div>
            <button onClick={onClose} className="sm:hidden p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 ml-auto"><X className="w-4 h-4" /></button>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
            <div className="flex items-center gap-1 flex-wrap justify-center sm:justify-start">
              {tabs.map((tab) => (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id)}
                   className={`${tabButtonClasses(tab.id)} text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap`}
                 >
                   {tab.label}
                 </button>
               ))}
             </div>
            <button onClick={onClose} className="hidden sm:flex ml-2 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="p-3 sm:p-4 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto">
           {filteredDownloads.length === 0 ? (
            <div className="text-center text-slate-500 py-12 sm:py-24 text-sm sm:text-base">No media found</div>
          ) : activeTab === "images" ? (
            <div className="space-y-4 sm:space-y-6">
              {photos.length > 0 && (
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Photos</h4>
                  <div className="grid gap-1 sm:gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))" }}>
                    {photos.map((item, idx) => (
                      <button
                        key={item.messageId || item.url || idx}
                        onClick={() => openMediaViewer(item)}
                        className="aspect-square w-full overflow-hidden rounded bg-slate-100 dark:bg-slate-800 relative hover:opacity-80 transition"
                        title={item.name || ""}
                      >
                        <img src={item.url} alt={item.name || "image"} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {gifs.length > 0 && (
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">GIFs</h4>
                  <div className="grid gap-1 sm:gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))" }}>
                    {gifs.map((item, idx) => (
                      <button
                        key={item.messageId || item.url || idx}
                        onClick={() => openMediaViewer(item)}
                        className="aspect-square w-full overflow-hidden rounded bg-slate-100 dark:bg-slate-800 relative hover:opacity-80 transition"
                        title={item.name || ""}
                      >
                        <img src={item.url} alt={item.name || "image"} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {videos.length > 0 && (
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Videos</h4>
                  <div className="grid gap-1 sm:gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))" }}>
                    {videos.map((item, idx) => (
                      <button
                        key={item.messageId || item.url || idx}
                        onClick={() => openMediaViewer(item)}
                        className="aspect-square w-full overflow-hidden rounded bg-slate-100 dark:bg-slate-800 relative hover:opacity-80 transition"
                        title={item.name || ""}
                      >
                        <div className="w-full h-full bg-black flex items-center justify-center">
                          <video src={item.url} className="w-full h-full object-cover" muted playsInline />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1 sm:space-y-2">
              {filteredDownloads.map((item, idx) => {
                const Icon = item.normalizedType === "AUDIO" ? Music : item.normalizedType === "DOCUMENT" ? FileText : File;
                return (
                  <div
                    key={idx}
                    onClick={() => (item.normalizedType === "IMAGE" || item.normalizedType === "VIDEO") && openMediaViewer(item)}
                    className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition text-xs sm:text-sm ${
                       item.normalizedType === "IMAGE" || item.normalizedType === "VIDEO" ? "cursor-pointer" : "cursor-default"
                     } border`}
                  >
                    <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg shrink-0">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <div className="flex items-center gap-1 sm:gap-2 text-xs text-gray-500 mt-0.5 hidden sm:flex">
                        <span>{formatFileSize(item.size)}</span>
                        <span>•</span>
                        <span>{formatDate(item.downloadedAt)}</span>
                      </div>
                    </div>
                    <a href={item.url} download={item.name} className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-full transition shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selectedMedia && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-2 sm:p-4" onClick={closeMediaViewer}>
          <div className="relative bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full h-auto max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeMediaViewer} className="absolute top-2 sm:top-4 right-2 sm:right-4 p-1.5 sm:p-2 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 rounded-full transition-all duration-200 text-gray-700 dark:text-gray-200 z-10 shadow-lg hover:scale-110" aria-label="Close viewer">
               <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {mediaItems.length > 1 && (
                <>
                <button onClick={(e) => { e.stopPropagation(); navigateMedia(-1); }} className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 p-1.5 sm:p-2.5 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 rounded-full transition-all duration-200 text-gray-700 dark:text-gray-200 z-10 shadow-lg hover:scale-110" aria-label="Previous">
                   <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                 </button>
                <button onClick={(e) => { e.stopPropagation(); navigateMedia(1); }} className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 p-1.5 sm:p-2.5 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 rounded-full transition-all duration-200 text-gray-700 dark:text-gray-200 z-10 shadow-lg hover:scale-110" aria-label="Next">
                   <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                 </button>
               </>
             )}

            <div className="flex-1 flex items-center justify-center p-3 sm:p-8 min-h-0 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 overflow-auto">
               {selectedMedia.normalizedType === 'VIDEO' ? (
                 <video src={selectedMedia.url} controls autoPlay className="max-w-full max-h-full object-contain" />
               ) : (
                 <img src={selectedMedia.url} alt={selectedMedia.name} className="max-w-full max-h-full object-contain rounded-lg" />
               )}
             </div>

            <div className="px-3 sm:px-6 py-2 sm:py-4 border-t dark:border-slate-700 bg-white dark:bg-slate-900 shrink-0">
              <p className="font-semibold text-gray-900 dark:text-white truncate text-xs sm:text-sm mb-1 sm:mb-2">{selectedMedia.name}</p>
              <div className="flex items-center gap-1 sm:gap-2 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                 <span>{formatFileSize(selectedMedia.size)}</span>
                 <span>•</span>
                 <span>{formatDate(selectedMedia.downloadedAt)}</span>
                 <span>•</span>
                 <span className="font-medium text-gray-700 dark:text-gray-300">{selectedMediaIndex + 1} / {mediaItems.length}</span>
               </div>
             </div>
           </div>
         </div>
       )}
    </div>
  );
};

export default MediaGallery;