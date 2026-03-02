import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PersonStanding } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <PersonStanding className="mb-4 h-16 w-16 text-muted-foreground/40" />
      <h2 className="mb-2 text-2xl font-bold">404 — ไม่พบหน้านี้</h2>
      <p className="mb-6 text-muted-foreground">
        หน้าที่คุณกำลังค้นหาอาจถูกย้ายหรือไม่มีอยู่แล้ว
      </p>
      <Link href="/">
        <Button className="bg-brand text-brand-foreground hover:bg-brand/90">
          กลับหน้าแรก
        </Button>
      </Link>
    </div>
  );
}
