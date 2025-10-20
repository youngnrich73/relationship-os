"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sb } from "@/lib/supabase-client";

export const dynamic = "force-dynamic";

function HomeInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const supabase = sb();
      // 이미 로그인돼 있으면 아무것도 하지 않음
      const { data } = await supabase.auth.getSession();
      if (data.session) return;

      // URL에 code / access_token 이 있을 때만 교환 시도
      const code = sp.get("code") || sp.get("access_token");
      if (!code) return;

      setMsg("로그인 처리 중...");
      try {
        const { error } = await supabase.auth.exchangeCodeForSession(
          window.location.href
        );
        if (error) {
          // 사용자를 놀라게 할 필요 없는 내부 오류는 표시하지 않고 종료
          console.debug("exchange error:", error.message);
          setMsg(null);
          return;
        }
        // 프로필 upsert (실패해도 앱 진행에는 영향X)
        fetch("/api/bootstrap", { method: "POST" }).catch(() => {});
        router.replace("/people");
      } catch {
        setMsg(null);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4 text-center py-20">
      <h1 className="text-2xl font-bold">관계OS MVP</h1>
      <p className="text-sm text-gray-600">
        설치/연결 완료! 이제 <code>/people</code>/<code>/interactions</code> 페이지를
        붙여가면 됩니다.
      </p>
      <p>
        <Link className="underline" href="/people">People 열기</Link>
      </p>
      {msg && <p className="text-sm">{msg}</p>}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">로딩…</div>}>
      <HomeInner />
    </Suspense>
  );
}

