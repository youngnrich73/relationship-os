// src/app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";
import Nav from "@/components/nav";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body
        className={`${inter.className} bg-neutral text-gray-800 min-h-screen flex flex-col`}
      >
        {/* 헤더 – Nav 컴포넌트 사용 */}
        <Nav />
        {/* 페이지 본문 */}
        <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
