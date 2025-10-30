import React, { useState, useEffect } from "react";
import { X, Download, FileText, Music, Image, File, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MediaGallery = ({ groupId, onClose }) => {
  const [activeTab, setActiveTab] = useState("images");
  const [downloads, setDownloads] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

  useEffect(() => {
    loadDownloads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const loadDownloads = async () => {
    const allDownloads = [];
    const prefix = `download_${groupId}_`;

    try {
      const result = await window.storage.list(prefix);
      if (result && result.keys) {
        for (const key of result.keys) {
          try {
            const item = await window.storage.get(key);
            if (item && item.value) {
              const raw = JSON.parse(item.value);
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
            }
          } catch (e) {
            // ignore malformed entries
          }
        }
      }
    } catch (e) {
      console.error("Error loading downloads:", e);
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

  const filteredDownloads = getFilteredDownloads();
  const mediaItems = downloads.filter((d) => d.normalizedType === "IMAGE" || d.normalizedType === "VIDEO");

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

  const formatDate = (s) => {
    if (!s) return "";
    const d = new Date(s);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString();
  };

  const formatFileSize = (b) => {
    if (b == null) return "";
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  };

  const tabs = [
    { id: "all", label: "All", icon: Download, count: downloads.length },
    { id: "images", label: "Gallery", icon: Image, count: downloads.filter((d) => d.normalizedType === "IMAGE" || d.normalizedType === "VIDEO").length },
    { id: "audio", label: "Audio", icon: Music, count: downloads.filter((d) => d.normalizedType === "AUDIO").length },
    { id: "documents", label: "Documents", icon: FileText, count: downloads.filter((d) => d.normalizedType === "DOCUMENT").length },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl h-[80vh] flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>Media & Files</CardTitle>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-2 mt-4 overflow-x-auto">
            {tabs.map((t) => {
              const Icon = t.icon;
              return (
                <button 
                  key={t.id} 
                  onClick={() => setActiveTab(t.id)} 
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${activeTab === t.id ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{t.label}</span>
                  {t.count > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === t.id ? 'bg-white/20' : 'bg-gray-200'}`}>
                      {t.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4">
          {filteredDownloads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Download className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No downloads yet</p>
              <p className="text-gray-400 text-sm mt-1">Files you download from this group will appear here</p>
            </div>
          ) : activeTab === 'images' ? (
            <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}>
              {filteredDownloads.map((item, idx) => (
                <div 
                  key={idx} 
                  onClick={() => openMediaViewer(item)} 
                  className="relative group rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 transition aspect-square"
                >
                  {item.normalizedType === 'VIDEO' ? (
                    <video src={item.url} className="w-full h-full object-cover" muted playsInline />
                  ) : (
                    <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-end">
                    <div className="p-1 w-full bg-gradient-to-t from-black/60 to-transparent">
                      <p className="text-white text-[10px] truncate">{item.name}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDownloads.map((item, idx) => {
                const Icon = item.normalizedType === 'AUDIO' ? Music : item.normalizedType === 'DOCUMENT' ? FileText : File;
                return (
                  <div 
                    key={idx} 
                    onClick={() => (item.normalizedType === 'IMAGE' || item.normalizedType === 'VIDEO') && openMediaViewer(item)} 
                    className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition ${item.normalizedType === 'IMAGE' || item.normalizedType === 'VIDEO' ? 'cursor-pointer' : 'cursor-default'} border`}
                  >
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Icon className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        <span>{formatFileSize(item.size)}</span>
                        <span>•</span>
                        <span>{formatDate(item.downloadedAt)}</span>
                      </div>
                    </div>
                    <a 
                      href={item.url} 
                      download={item.name} 
                      className="p-2 hover:bg-gray-200 rounded-full transition" 
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Download className="w-4 h-4 text-gray-600" />
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedMedia && (
        <div className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center" onClick={closeMediaViewer}>
          <button 
            onClick={closeMediaViewer} 
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition text-white z-10" 
            aria-label="Close viewer"
          >
            <X className="w-6 h-6" />
          </button>
          
          <a 
            href={selectedMedia.url} 
            download={selectedMedia.name} 
            onClick={(e) => e.stopPropagation()} 
            className="absolute top-4 right-16 p-2 bg-white/10 hover:bg-white/20 rounded-full transition text-white z-10"
            aria-label="Download file"
          >
            <Download className="w-6 h-6" />
          </a>

          {mediaItems.length > 1 && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); navigateMedia(-1); }} 
                className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition text-white z-10" 
                aria-label="Previous"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); navigateMedia(1); }} 
                className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition text-white z-10" 
                aria-label="Next"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            {selectedMedia.normalizedType === 'VIDEO' ? (
              <video src={selectedMedia.url} controls autoPlay className="max-w-full max-h-full rounded-lg shadow-2xl" />
            ) : (
              <img src={selectedMedia.url} alt={selectedMedia.name} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="max-w-7xl mx-auto text-white">
              <p className="font-medium truncate">{selectedMedia.name}</p>
              <div className="flex items-center gap-3 text-sm text-white/70 mt-1">
                <span>{formatFileSize(selectedMedia.size)}</span>
                <span>•</span>
                <span>{formatDate(selectedMedia.downloadedAt)}</span>
                <span>•</span>
                <span>{selectedMediaIndex + 1} / {mediaItems.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaGallery;
