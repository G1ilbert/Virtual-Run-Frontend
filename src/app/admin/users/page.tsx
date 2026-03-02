"use client";

import { useState } from "react";
import { useAdminUsers, updateUser, deleteUser } from "@/hooks/useAdminApi";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Search, Eye, Trash2, Loader2, Users } from "lucide-react";
import type { User } from "@/types/api";

const roleBadgeClass: Record<string, string> = {
  USER: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  ORGANIZER: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  ADMIN: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

function TableSkeleton() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <Skeleton className="h-8 w-48" />
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-[160px]" />
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="space-y-0">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 border-b px-4 py-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16 ml-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [updatingRole, setUpdatingRole] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const params = {
    page,
    limit: 10,
    search: search || undefined,
    role: roleFilter !== "all" ? roleFilter : undefined,
  };

  const { data, isLoading, mutate: mutateUsers } = useAdminUsers(params);

  const users = data?.data ?? [];
  const meta = data?.meta ?? { total: 0, page: 1, limit: 10, totalPages: 1 };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleRoleChange = (value: string) => {
    setRoleFilter(value);
    setPage(1);
  };

  const handleUpdateRole = async (userId: number, newRole: string) => {
    setUpdatingRole(true);
    try {
      await updateUser(userId, { role: newRole as User["role"] });
      toast.success("อัพเดท Role สำเร็จ");
      mutateUsers();
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, role: newRole as User["role"] });
      }
    } catch {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setUpdatingRole(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteUser(deleteTarget.id);
      toast.success("ลบผู้ใช้สำเร็จ");
      mutateUsers();
      setDeleteTarget(null);
      setSelectedUser(null);
    } catch {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setDeleting(false);
    }
  };

  if (isLoading && !data) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Page Header */}
      <h1 className="text-2xl font-bold">จัดการ Users</h1>

      {/* Search & Filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ค้นหา username หรือ email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </form>
        <Select value={roleFilter} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="ทั้งหมด" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทั้งหมด</SelectItem>
            <SelectItem value="USER">USER</SelectItem>
            <SelectItem value="ORGANIZER">ORGANIZER</SelectItem>
            <SelectItem value="ADMIN">ADMIN</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {users.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12">
              <Users className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">ไม่พบผู้ใช้</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>วันสมัคร</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow
                    key={user.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedUser(user)}
                  >
                    <TableCell className="font-medium">
                      {user.username}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={roleBadgeClass[user.role] ?? ""}
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("th-TH")
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUser(user);
                        }}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        ดู
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            หน้า {meta.page} / {meta.totalPages} (ทั้งหมด {meta.total} คน)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* User Detail Dialog */}
      <Dialog
        open={!!selectedUser}
        onOpenChange={(open) => {
          if (!open) setSelectedUser(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>รายละเอียดผู้ใช้</DialogTitle>
            <DialogDescription>
              ข้อมูลของ {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">ID</p>
                  <p className="font-medium">{selectedUser.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Username</p>
                  <p className="font-medium">{selectedUser.username}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedUser.email || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">ชื่อ</p>
                  <p className="font-medium">
                    {selectedUser.firstName || "-"} {selectedUser.lastName || ""}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">เบอร์โทร</p>
                  <p className="font-medium">
                    {selectedUser.phoneNumber || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">ที่อยู่</p>
                  <p className="font-medium">
                    {selectedUser.addressDetail || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">วันสมัคร</p>
                  <p className="font-medium">
                    {selectedUser.createdAt
                      ? new Date(selectedUser.createdAt).toLocaleDateString(
                          "th-TH",
                        )
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">อัพเดทล่าสุด</p>
                  <p className="font-medium">
                    {selectedUser.updatedAt
                      ? new Date(selectedUser.updatedAt).toLocaleDateString(
                          "th-TH",
                        )
                      : "-"}
                  </p>
                </div>
              </div>

              {/* Role Change */}
              <div className="space-y-2 rounded-lg border p-3">
                <p className="text-sm font-medium">เปลี่ยน Role</p>
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedUser.role}
                    onValueChange={(value) =>
                      handleUpdateRole(selectedUser.id, value)
                    }
                    disabled={updatingRole}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">USER</SelectItem>
                      <SelectItem value="ORGANIZER">ORGANIZER</SelectItem>
                      <SelectItem value="ADMIN">ADMIN</SelectItem>
                    </SelectContent>
                  </Select>
                  {updatingRole && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setSelectedUser(null)}
            >
              ปิด
            </Button>
            <Button
              variant="destructive"
              className="gap-2"
              onClick={() => {
                if (selectedUser) setDeleteTarget(selectedUser);
              }}
            >
              <Trash2 className="h-4 w-4" />
              ลบผู้ใช้
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการลบผู้ใช้</DialogTitle>
            <DialogDescription>
              คุณต้องการลบผู้ใช้ &quot;{deleteTarget?.username}&quot; ใช่หรือไม่?
              การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              ยกเลิก
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="gap-2"
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              ลบ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
