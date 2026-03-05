"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useIsStaff } from "@/hooks/useStaffApi";
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
import { Switch } from "@/components/ui/switch";
import {
  Search,
  X,
  User,
  LogOut,
  Menu,
  Bell,
  Moon,
  Settings,
  Wrench,
} from "lucide-react";
import { useTheme } from "next-themes";
import { mockNotifications } from "@/lib/mock-data";
import type { Notification } from "@/types/api";

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export function Navbar({ onToggleSidebar }: NavbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { data: isStaff } = useIsStaff();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleLogout = async () => {
    setSheetOpen(false);
    await logout();
    router.push("/login");
  };

  const navigateTo = (path: string) => {
    setSheetOpen(false);
    router.push(path);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-2 px-4">
        {/* Left: Hamburger (desktop) + Logo */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Hamburger - desktop only */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex h-9 w-9"
            onClick={onToggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link href="/" className="font-bold text-lg tracking-tight">
            เก่าต่อไป
          </Link>
        </div>

        {/* Center: Desktop Search Bar */}
        <div className="hidden md:flex flex-1 justify-center max-w-xl mx-auto">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="ค้นหางานวิ่ง..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border bg-muted/50 py-2 pl-10 pr-4 text-sm outline-none transition-all focus:bg-background focus:border-brand focus:ring-1 focus:ring-brand"
              />
            </div>
          </form>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1 ml-auto shrink-0">
          {/* Mobile Search Icon */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Desktop theme toggle */}
          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          {/* Notification Bell */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-3 py-2">
                  <p className="text-sm font-semibold">การแจ้งเตือน</p>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-brand-foreground dark:text-brand hover:underline"
                    >
                      อ่านทั้งหมด
                    </button>
                  )}
                </div>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                    ไม่มีการแจ้งเตือน
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`px-3 py-2.5 text-sm border-b last:border-0 ${!n.read ? "bg-brand/5" : ""}`}
                    >
                      <p className={`leading-snug ${!n.read ? "font-medium" : "text-muted-foreground"}`}>
                        {n.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                    </div>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Avatar / Login */}
          {user ? (
            <>
              {/* Desktop: DropdownMenu */}
              <div className="hidden md:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="bg-brand text-brand-foreground text-xs font-bold">
                          {user.username?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium">{user.username}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/profile")}>
                      <User className="mr-2 h-4 w-4" />
                      โปรไฟล์
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/profile/info")}>
                      <Settings className="mr-2 h-4 w-4" />
                      ข้อมูลส่วนตัว & ที่อยู่
                    </DropdownMenuItem>
                    {isStaff && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push("/staff")}>
                          <Wrench className="mr-2 h-4 w-4" />
                          Staff Panel
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <div className="flex items-center justify-between px-2 py-1.5">
                      <div className="flex items-center gap-2 text-sm">
                        <Moon className="h-4 w-4" />
                        Dark mode
                      </div>
                      <Switch
                        checked={theme === "dark"}
                        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                      />
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-destructive focus:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      ออกจากระบบ
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Mobile: Avatar triggers Sheet */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setSheetOpen(true)}
                >
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-brand text-brand-foreground text-xs font-bold">
                      {user.username?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>

                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                  <SheetContent side="bottom" className="rounded-t-2xl">
                    <SheetHeader>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-brand text-brand-foreground font-bold">
                            {user.username?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                          <SheetTitle>{user.username}</SheetTitle>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
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
                        onClick={() => navigateTo("/profile/info")}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
                      >
                        <Settings className="h-5 w-5 text-muted-foreground" />
                        ข้อมูลส่วนตัว & ที่อยู่
                      </button>
                      {isStaff && (
                        <>
                          <div className="my-2 border-t" />
                          <button
                            onClick={() => navigateTo("/staff")}
                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
                          >
                            <Wrench className="h-5 w-5 text-muted-foreground" />
                            Staff Panel
                          </button>
                        </>
                      )}
                      <div className="my-2 border-t" />
                      <div className="flex items-center justify-between px-3 py-2.5">
                        <div className="flex items-center gap-3 text-sm font-medium">
                          <Moon className="h-5 w-5 text-muted-foreground" />
                          Dark mode
                        </div>
                        <Switch
                          checked={theme === "dark"}
                          onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                        />
                      </div>
                      <div className="my-2 border-t" />
                      <button
                        onClick={handleLogout}
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
            <Button
              size="sm"
              className="bg-brand text-brand-foreground hover:bg-brand/90"
              asChild
            >
              <Link href="/login">เข้าสู่ระบบ</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-background md:hidden">
          <div className="flex h-14 items-center gap-2 border-b px-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => {
                setSearchOpen(false);
                setSearchQuery("");
              }}
            >
              <X className="h-5 w-5" />
            </Button>
            <form onSubmit={handleSearch} className="flex-1">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="ค้นหางานวิ่ง..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent py-2 text-base outline-none"
                autoFocus
              />
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
