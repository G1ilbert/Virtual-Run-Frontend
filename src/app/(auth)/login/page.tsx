"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, User, Crown, Shield, Wrench } from "lucide-react";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
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
      router.push(redirect);
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
      router.push(redirect);
    } catch {
      toast.error("ไม่สามารถเข้าสู่ระบบด้วย Google ได้");
    } finally {
      setLoading(false);
    }
  };

  const handleMockLogin = async (role: "user" | "organizer" | "admin" | "staff") => {
    loginAsMock(role);
    const names: Record<string, string> = { user: "ผู้ใช้ทั่วไป", organizer: "ผู้จัดงาน", admin: "แอดมิน", staff: "Staff" };
    toast.success(`เข้าสู่ระบบเป็น ${names[role]} สำเร็จ!`);

    if (role === "admin") {
      try { await adminLogin("admin", "admin123"); } catch { /* ignore */ }
      router.push("/admin");
    } else if (role === "organizer") {
      router.push("/organizer");
    } else if (role === "staff") {
      router.push("/staff");
    } else {
      router.push(redirect);
    }
  };

  return (
    <div className="w-full max-w-sm px-4">
      {/* Logo */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">เก่าต่อไป</h1>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
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
        <div className="space-y-1.5">
          <Label htmlFor="password">รหัสผ่าน</Label>
          <Input
            id="password"
            type="password"
            placeholder="รหัสผ่าน"
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
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground">
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
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        เข้าด้วย Google
      </Button>

      {/* Links */}
      <div className="mt-6 text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          ยังไม่มีบัญชี?{" "}
          <Link href="/register" className="font-medium text-brand-foreground dark:text-brand hover:underline">
            สมัครสมาชิก
          </Link>
        </p>
        <p>
          <Link href="/admin/login" className="text-xs text-muted-foreground hover:underline">
            เข้าสู่ระบบสำหรับผู้ดูแล
          </Link>
        </p>
      </div>

      {/* Mock Mode */}
      {USE_MOCK && (
        <div className="mt-8 rounded-xl border p-4 space-y-2">
          <p className="text-xs text-muted-foreground text-center mb-3">เลือก role ทดสอบ</p>
          <div className="grid grid-cols-4 gap-2">
            <Button variant="outline" size="sm" className="h-auto py-2 flex-col gap-1" onClick={() => handleMockLogin("user")}>
              <User className="h-4 w-4 text-blue-500" />
              <span className="text-[10px]">User</span>
            </Button>
            <Button variant="outline" size="sm" className="h-auto py-2 flex-col gap-1" onClick={() => handleMockLogin("organizer")}>
              <Crown className="h-4 w-4 text-amber-500" />
              <span className="text-[10px]">Organizer</span>
            </Button>
            <Button variant="outline" size="sm" className="h-auto py-2 flex-col gap-1" onClick={() => handleMockLogin("staff")}>
              <Wrench className="h-4 w-4 text-emerald-500" />
              <span className="text-[10px]">Staff</span>
            </Button>
            <Button variant="outline" size="sm" className="h-auto py-2 flex-col gap-1" onClick={() => handleMockLogin("admin")}>
              <Shield className="h-4 w-4 text-red-500" />
              <span className="text-[10px]">Admin</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
