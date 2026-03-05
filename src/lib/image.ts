const API_BASE = "https://virtual-run-production.up.railway.app";

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return "/placeholder.png";
  if (path.startsWith("http")) return path;
  if (path.startsWith("data:")) return path;
  if (path.startsWith("blob:")) return path;
  return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}
