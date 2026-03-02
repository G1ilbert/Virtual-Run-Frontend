"use client";

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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Trophy, ClipboardList, User, LogOut, LogIn, Crown, Shield } from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

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
              {(user.role === "ORGANIZER" || user.role === "ADMIN") && (
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
                {(user.role === "ORGANIZER" || user.role === "ADMIN") && (
                  <DropdownMenuItem onClick={() => router.push("/organizer")}>
                    <Crown className="mr-2 h-4 w-4" />
                    จัดการงานวิ่ง
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
