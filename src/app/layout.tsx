// src/app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";
import Nav from "@/components/nav";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Nav />
        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-4 py-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
