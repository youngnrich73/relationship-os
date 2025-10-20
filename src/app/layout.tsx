// src/app/layout.tsx
import "./globals.css";
import Link from "next/link";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${inter.className} bg-neutral text-gray-800 min-h-screen flex flex-col`}>
        <header className="border-b border-gray-200">
          <nav className="container mx-auto px-4 py-2 flex items-center justify-between">
            <h1 className="font-semibold text-lg">
              <Link href="/">RelationOS</Link>
            </h1>
            <div className="space-x-4 text-sm">
              <Link href="/" className="hover:text-primary">Home</Link>
              <Link href="/people" className="hover:text-primary">People</Link>
              <Link href="/logs" className="hover:text-primary">Logs</Link>
              <Link href="/radar" className="hover:text-primary">Radar</Link>
              <Link href="/ideas" className="hover:text-primary">Ideas</Link>
            </div>
          </nav>
        </header>
        <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}

