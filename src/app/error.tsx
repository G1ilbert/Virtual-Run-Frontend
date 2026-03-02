"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <AlertTriangle className="mb-4 h-16 w-16 text-destructive" />
      <h2 className="mb-2 text-2xl font-bold">เกิดข้อผิดพลาด</h2>
      <p className="mb-6 text-muted-foreground">
        ขออภัย เกิดข้อผิดพลาดบางอย่าง กรุณาลองใหม่อีกครั้ง
      </p>
      <Button
        onClick={reset}
        className="bg-brand text-brand-foreground hover:bg-brand/90"
      >
        ลองใหม่
      </Button>
    </div>
  );
}
