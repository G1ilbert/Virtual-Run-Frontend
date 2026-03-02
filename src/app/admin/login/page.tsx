"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Shield } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { admin, loading: authLoading, login } = useAdminAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && admin) {
      router.replace("/admin");
    }
  }, [admin, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("กรุณากรอก username และ password");
      return;
    }
    setLoading(true);
    try {
      await login(username, password);
      toast.success("เข้าสู่ระบบ Admin สำเร็จ!");
      router.push("/admin");
    } catch {
      toast.error("Username หรือ Password ไม่ถูกต้อง");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;
  if (admin) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-600 shadow-lg shadow-red-600/30">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Virtual Run</h1>
          <p className="mt-1 text-sm text-gray-400">
            Admin Panel — ระบบจัดการหลังบ้าน
          </p>
        </div>

        <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle className="text-white">เข้าสู่ระบบ Admin</CardTitle>
            <CardDescription className="text-gray-400">
              กรอก Username และ Password ของ Admin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-300">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="border-gray-600 bg-gray-700/50 text-white placeholder:text-gray-500 focus-visible:ring-red-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-gray-600 bg-gray-700/50 text-white placeholder:text-gray-500 focus-visible:ring-red-500"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-red-600 text-white hover:bg-red-700"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                เข้าสู่ระบบ
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-gray-500">
          ระบบนี้สำหรับผู้ดูแลระบบเท่านั้น
        </p>
      </div>
    </div>
  );
}
