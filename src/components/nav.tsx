"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * 내비게이션 탭 정의 – 경로와 라벨을 수정하면 메뉴 구조를 쉽게 바꿀 수 있습니다.
 */
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
    <nav className="w-full border-b bg-neutral/90 backdrop-blur">
      <div className="mx-auto max-w-6xl flex items-center gap-4 px-4 h-12">
        {/* 로고/제목 */}
        <span className="font-semibold text-lg">관계OS</span>
        {/* 메뉴 */}
        <div className="flex gap-2 text-sm">
          {tabs.map((t) => {
            const active = pathname === t.href;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`px-3 py-1 rounded-md transition-colors ${
                  active
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-primary/10 hover:text-primary"
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
