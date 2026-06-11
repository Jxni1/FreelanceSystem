const API_ORIGIN = import.meta.env.VITE_API_URL ?? '';

export function resolveUploadUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_ORIGIN}/${path.replace(/^\/+/, '')}`;
}
