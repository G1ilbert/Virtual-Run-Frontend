"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile, useMyRegistrations, useMyRunningProofs } from "@/hooks/useApi";
import { AuthGuard } from "@/components/auth-guard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ChevronRight,
  User,
  MapPin,
  Crown,
  UserPlus,
  LogOut,
} from "lucide-react";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { data: profile, isLoading } = useProfile();
  const { data: registrations } = useMyRegistrations();
  const { data: proofs } = useMyRunningProofs();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const totalRegistrations = registrations?.length ?? 0;
  const totalProofs = proofs?.length ?? 0;
  const totalDistance = proofs?.reduce((sum, p) => sum + (p.distance ?? 0), 0) ?? 0;

  const isOrganizer = user?.role === "ORGANIZER" || user?.role === "ADMIN";

  return (
    <AuthGuard>
      <div className="px-4 md:px-6 py-6 max-w-2xl mx-auto">
        {isLoading ? (
          <div className="animate-pulse space-y-6">
            <div className="flex flex-col items-center">
              <div className="h-20 w-20 rounded-full bg-muted" />
              <div className="mt-3 h-5 w-32 bg-muted rounded" />
              <div className="mt-1 h-4 w-48 bg-muted rounded" />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Avatar + Name */}
            <div className="flex flex-col items-center">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-brand text-brand-foreground text-3xl font-bold">
                  {profile?.username?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <h1 className="mt-3 text-xl font-bold">{profile?.username}</h1>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-muted/50 p-3">
                <p className="text-lg font-bold">{Math.round(totalDistance)}</p>
                <p className="text-[10px] text-muted-foreground">กม. รวม</p>
              </div>
              <div className="rounded-xl bg-muted/50 p-3">
                <p className="text-lg font-bold">{totalRegistrations}</p>
                <p className="text-[10px] text-muted-foreground">สมัคร</p>
              </div>
              <div className="rounded-xl bg-muted/50 p-3">
                <p className="text-lg font-bold">{totalProofs}</p>
                <p className="text-[10px] text-muted-foreground">ส่งผล</p>
              </div>
            </div>

            {/* Menu List */}
            <div className="rounded-xl border divide-y">
              {/* ข้อมูลส่วนตัว & ที่อยู่ */}
              <button
                onClick={() => router.push("/profile/info")}
                className="flex w-full items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">ข้อมูลส่วนตัว & ที่อยู่</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>

              {/* Organizer */}
              {isOrganizer ? (
                <button
                  onClick={() => router.push("/organizer")}
                  className="flex w-full items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Crown className="h-5 w-5 text-amber-500" />
                    <span className="text-sm font-medium">จัดการงานวิ่ง</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ) : (
                <button
                  onClick={() => router.push("/organizer/apply")}
                  className="flex w-full items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <UserPlus className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">สมัครเป็นผู้จัดงาน</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Logout */}
            <div className="rounded-xl border">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-3 text-destructive hover:bg-destructive/5 transition-colors rounded-xl"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-sm font-medium">ออกจากระบบ</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
