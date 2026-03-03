"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Search,
  Trophy,
  ClipboardList,
  User,
  LogOut,
  LogIn,
  Crown,
  Shield,
  UserPlus,
} from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const navigateTo = (path: string) => {
    setSheetOpen(false);
    router.push(path);
  };

  const isOrganizer = user?.role === "ORGANIZER" || user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-brand-foreground font-extrabold text-sm">
            VR
          </span>
          <span className="hidden sm:inline">Virtual Run</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/search">
              <Search className="mr-1.5 h-4 w-4" />
              ค้นหา
            </Link>
          </Button>
          {user && (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/my">
                  <ClipboardList className="mr-1.5 h-4 w-4" />
                  งานของฉัน
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/my/running-proofs">
                  <Trophy className="mr-1.5 h-4 w-4" />
                  ผลวิ่ง
                </Link>
              </Button>
              {isOrganizer && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/organizer">
                    <Crown className="mr-1.5 h-4 w-4" />
                    จัดการงานวิ่ง
                  </Link>
                </Button>
              )}
              {user.role === "ADMIN" && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin">
                    <Shield className="mr-1.5 h-4 w-4" />
                    Admin
                  </Link>
                </Button>
              )}
            </>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-1">
          <ThemeToggle />

          {user ? (
            <>
              {/* Desktop: DropdownMenu */}
              <div className="hidden md:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="bg-brand text-brand-foreground text-xs font-bold">
                          {user?.username?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => router.push("/profile")}>
                      <User className="mr-2 h-4 w-4" />
                      โปรไฟล์
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/my")}>
                      <ClipboardList className="mr-2 h-4 w-4" />
                      งานของฉัน
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/my/running-proofs")}>
                      <Trophy className="mr-2 h-4 w-4" />
                      ผลวิ่งของฉัน
                    </DropdownMenuItem>
                    {isOrganizer ? (
                      <DropdownMenuItem onClick={() => router.push("/organizer")}>
                        <Crown className="mr-2 h-4 w-4" />
                        จัดการงานวิ่ง
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => router.push("/organizer/apply")}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        สมัครเป็นผู้จัดงาน
                      </DropdownMenuItem>
                    )}
                    {user.role === "ADMIN" && (
                      <DropdownMenuItem onClick={() => router.push("/admin")}>
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Panel
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      ออกจากระบบ
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Mobile: Sheet */}
              <div className="md:hidden">
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setSheetOpen(true)}
                  >
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-brand text-brand-foreground text-xs font-bold">
                        {user?.username?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                  <SheetContent side="bottom" className="rounded-t-2xl">
                    <SheetHeader>
                      <SheetTitle className="text-left">
                        {user.username || "ผู้ใช้"}
                      </SheetTitle>
                    </SheetHeader>
                    <nav className="flex flex-col gap-1 py-4">
                      <button
                        onClick={() => navigateTo("/profile")}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
                      >
                        <User className="h-5 w-5 text-muted-foreground" />
                        โปรไฟล์
                      </button>
                      <button
                        onClick={() => navigateTo("/my")}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
                      >
                        <ClipboardList className="h-5 w-5 text-muted-foreground" />
                        งานของฉัน
                      </button>
                      <button
                        onClick={() => navigateTo("/my/running-proofs")}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
                      >
                        <Trophy className="h-5 w-5 text-muted-foreground" />
                        ผลวิ่งของฉัน
                      </button>
                      {isOrganizer ? (
                        <button
                          onClick={() => navigateTo("/organizer")}
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
                        >
                          <Crown className="h-5 w-5 text-amber-500" />
                          จัดการงานวิ่ง
                        </button>
                      ) : (
                        <button
                          onClick={() => navigateTo("/organizer/apply")}
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
                        >
                          <UserPlus className="h-5 w-5 text-muted-foreground" />
                          สมัครเป็นผู้จัดงาน
                        </button>
                      )}
                      {user.role === "ADMIN" && (
                        <button
                          onClick={() => navigateTo("/admin")}
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
                        >
                          <Shield className="h-5 w-5 text-red-500" />
                          Admin Panel
                        </button>
                      )}
                      <div className="my-2 border-t" />
                      <button
                        onClick={async () => {
                          setSheetOpen(false);
                          await handleLogout();
                        }}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="h-5 w-5" />
                        ออกจากระบบ
                      </button>
                    </nav>
                  </SheetContent>
                </Sheet>
              </div>
            </>
          ) : (
            <Button size="sm" asChild>
              <Link href="/login">
                <LogIn className="mr-1.5 h-4 w-4" />
                เข้าสู่ระบบ
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
