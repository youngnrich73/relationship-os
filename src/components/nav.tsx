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

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav className="w-full border-b bg-white/70 backdrop-blur">
      <div className="mx-auto max-w-5xl flex items-center gap-4 px-4 h-12">
        <span className="font-semibold">RelationOS</span>
        <div className="flex gap-2 text-sm">
          {tabs.map(t => {
            const active = pathname === t.href;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`px-2 py-1 rounded ${
                  active ? "bg-black text-white" : "hover:bg-black/5"
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
