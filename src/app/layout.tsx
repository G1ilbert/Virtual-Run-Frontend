import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  variable: "--font-noto-sans-thai",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Virtual Run — ค้นหางานวิ่ง Virtual Run",
  description:
    "แพลตฟอร์มจัดงาน Virtual Run สมัครงานวิ่ง ส่งผลวิ่ง รับเหรียญ ส่งถึงบ้าน",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={`${notoSansThai.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
