"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Home" },
  { href: "/people", label: "People" },
  { href: "/interactions", label: "Logs" },
  { href: "/radar", label: "Radar" },
  { href: "/ideas", label: "Ideas" },
];

export default function Nav(){
  const pathname = usePathname();
  return (
    <nav className="w-full border-b bg-neutral/90 backdrop-blur">
      <div className="mx-auto max-w-6xl flex items-center gap-4 px-4 h-14">
        <span className="font-semibold text-lg">관계OS</span>
        <div className="flex gap-1 text-sm">
          {tabs.map(t=>{
            const active = pathname === t.href;
            return (
              <Link
                key={t.href} href={t.href}
                className={`px-3 py-2 rounded-xl transition-colors ${
                  active? "bg-primary text-white":"text-gray-700 hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
