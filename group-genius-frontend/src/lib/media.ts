const API_ROOT = (import.meta?.env?.VITE_API_BASE_URL ?? "http://localhost:8080").replace(/\/$/, "");
const ABSOLUTE_PROTOCOL = /^(?:https?:|data:|blob:)/i;

export const resolveMediaUrl = (path?: string | null): string | null => {
  if (!path) {
    return null;
  }

  if (ABSOLUTE_PROTOCOL.test(path)) {
    return path;
  }

  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_ROOT}${normalized}`;
};

export const resolveDocumentUrl = (path?: string | null): string | null => resolveMediaUrl(path);

export const resolveDownloadUrl = (path?: string | null): string | null => resolveMediaUrl(path);
