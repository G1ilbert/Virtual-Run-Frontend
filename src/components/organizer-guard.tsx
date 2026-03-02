"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { DetailSkeleton } from "@/components/page-skeleton";

export function OrganizerGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user) {
      const isOrganizer =
        user.role === "ORGANIZER" || user.role === "ADMIN";
      if (!isOrganizer) {
        router.replace("/organizer/apply");
      }
    }
  }, [user, loading, router]);

  if (loading || !user) return <DetailSkeleton />;

  const isOrganizer =
    user.role === "ORGANIZER" || user.role === "ADMIN";

  if (!isOrganizer) return <DetailSkeleton />;

  return <>{children}</>;
}
