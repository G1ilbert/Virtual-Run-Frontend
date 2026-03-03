import axios from "axios";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor — attach Bearer token
api.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // silently continue without token
  }
  return config;
});

// Pages that should never trigger a 401 redirect (user auth)
// Admin pages are handled by admin-api-client's own interceptor
const publicPaths = ["/login", "/register", "/admin"];

// Response interceptor — handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window === "undefined") return Promise.reject(error);

    const status = error.response?.status;
    const message =
      error.response?.data?.message || error.message || "เกิดข้อผิดพลาด";

    if (status === 401) {
      // Only redirect if not already on a public page (prevents loop)
      const onPublicPage = publicPaths.some((p) =>
        window.location.pathname.startsWith(p),
      );
      if (!onPublicPage) {
        window.location.href = "/login";
      }
    } else if (status === 403) {
      toast.error("ไม่มีสิทธิ์เข้าถึง");
    } else if (status >= 500) {
      toast.error("เซิร์ฟเวอร์ขัดข้อง กรุณาลองใหม่");
    } else if (status !== 401) {
      toast.error(message);
    }

    return Promise.reject(error);
  },
);

export default api;
