"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { toast } from "sonner";
import { Loader2, PersonStanding, User, Shield, Crown } from "lucide-react";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle, loginAsMock } = useAuth();
  const { login: adminLogin } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("เข้าสู่ระบบสำเร็จ!");
      router.push("/");
    } catch {
      toast.error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success("เข้าสู่ระบบสำเร็จ!");
      router.push("/");
    } catch {
      toast.error("ไม่สามารถเข้าสู่ระบบด้วย Google ได้");
    } finally {
      setLoading(false);
    }
  };

  const handleMockLogin = async (role: "user" | "organizer" | "admin") => {
    loginAsMock(role);
    const names = { user: "ผู้ใช้ทั่วไป", organizer: "ผู้จัดงาน", admin: "แอดมิน" };
    toast.success(`เข้าสู่ระบบเป็น ${names[role]} สำเร็จ!`);

    if (role === "admin") {
      try { await adminLogin("admin", "admin123"); } catch { /* ignore */ }
      router.push("/admin");
    } else if (role === "organizer") {
      router.push("/organizer");
    } else {
      router.push("/");
    }
  };

  return (
    <div className="w-full max-w-md px-4">
      {/* Illustration / Branding */}
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand shadow-lg shadow-brand/20">
          <PersonStanding className="h-10 w-10 text-brand-foreground" />
        </div>
        <h1 className="text-2xl font-bold">Virtual Run</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ค้นหางานวิ่ง สมัคร ส่งผล รับเหรียญถึงบ้าน
        </p>
      </div>

      {USE_MOCK ? (
        /* ─── Mock User Picker ─── */
        <Card>
          <CardHeader className="text-center">
            <CardTitle>เลือกบัญชีทดสอบ</CardTitle>
            <CardDescription>
              กดเลือกบทบาทเพื่อเข้าสู่ระบบด้วยข้อมูล Mock
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-auto py-4 justify-start gap-4"
              onClick={() => handleMockLogin("user")}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-left">
                <p className="font-semibold">ผู้ใช้ทั่วไป (User)</p>
                <p className="text-xs text-muted-foreground">สมัครงานวิ่ง ส่งผลวิ่ง จัดการโปรไฟล์</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full h-auto py-4 justify-start gap-4"
              onClick={() => handleMockLogin("organizer")}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <Crown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="text-left">
                <p className="font-semibold">ผู้จัดงาน (Organizer)</p>
                <p className="text-xs text-muted-foreground">จัดงานวิ่ง ดูแลผู้สมัคร</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full h-auto py-4 justify-start gap-4"
              onClick={() => handleMockLogin("admin")}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="text-left">
                <p className="font-semibold">แอดมิน (Admin)</p>
                <p className="text-xs text-muted-foreground">จัดการระบบทั้งหมด</p>
              </div>
            </Button>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-xs text-muted-foreground">
              🔧 โหมดทดสอบ — ข้อมูลทั้งหมดเป็น Mock
            </p>
          </CardFooter>
        </Card>
      ) : (
        /* ─── Real Login Form ─── */
        <Card>
          <CardHeader className="text-center">
            <CardTitle>เข้าสู่ระบบ</CardTitle>
            <CardDescription>
              ใช้อีเมลและรหัสผ่าน หรือ Google Account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">อีเมล</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">รหัสผ่าน</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                เข้าสู่ระบบ
              </Button>
            </form>

            <div className="relative my-6">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                หรือ
              </span>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogle}
              disabled={loading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              เข้าสู่ระบบด้วย Google
            </Button>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              ยังไม่มีบัญชี?{" "}
              <Link href="/register" className="font-medium text-brand-foreground dark:text-brand hover:underline">
                สมัครสมาชิก
              </Link>
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
