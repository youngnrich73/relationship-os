// src/app/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

// UI 컴포넌트 (shadcn or custom)
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * 하이브리드 Supabase 클라이언트 로더
 * - 있으면: "@/lib/supabase-client" (예: sb() 또는 default() 같은 헬퍼)
 * - 없으면: "@supabase/supabase-js" 로 즉석 생성 (NEXT_PUBLIC_* 환경변수 필요)
 */
async function getSupabaseClient() {
  try {
    const mod: any = await import("@/lib/supabase-client");
    if (typeof mod?.sb === "function") return mod.sb();
    if (typeof mod?.default === "function") return mod.default();
    if (typeof mod?.createClient === "function") return mod.createClient();
  } catch {
    // 헬퍼 없으면 폴백으로 진행
  }
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!url || !anon) {
    throw new Error(
      "Supabase 환경변수가 없습니다. NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 설정을 확인하세요."
    );
  }
  return createClient(url, anon);
}

const dummySuggestions = [
  { id: 1, title: "가벼운 터치", body: "최근 연락이 뜸했어요. 지난번 웃겼던 사진 1장을 보내볼까요?" },
  { id: 2, title: "루틴 리마인드", body: "부모님과 월 2회 통화 루틴이 곧 도래합니다." },
];

function HomeInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<"idle" | "exchanging" | "done" | "error">("idle");
  const onceRef = useRef(false);

  const hasAuthParams = useMemo(() => {
    const code = searchParams.get("code");
    const access = searchParams.get("access_token");
    const refresh = searchParams.get("refresh_token");
    return Boolean(code || access || refresh);
  }, [searchParams]);

  useEffect(() => {
    if (onceRef.current) return;
    onceRef.current = true;

    (async () => {
      try {
        if (!hasAuthParams) {
          // 이미 로그인된 세션이 있으면 바로 /people
          const supabase = await getSupabaseClient();
          const { data } = await supabase.auth.getSession();
          if (data?.session) router.replace("/people");
          return;
        }

        setStatus("exchanging");
        const supabase = await getSupabaseClient();

        try {
          // @ts-ignore - 존재하면 사용
          if (typeof supabase.auth.exchangeCodeForSession === "function") {
            // @ts-ignore
            await supabase.auth.exchangeCodeForSession(window.location.href);
          } else {
            const { data } = await supabase.auth.getSession();
            if (!data?.session) throw new Error("세션 교환 API 없음");
          }
        } catch (e) {
          const { data } = await supabase.auth.getSession();
          if (!data?.session) throw e;
        }

        try {
          await fetch("/api/bootstrap", { method: "POST" });
        } catch {
          // 선택 로직: 실패해도 치명적 아님
        }

        setStatus("done");
        router.replace("/people");
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    })();
  }, [hasAuthParams, router]);

  return (
    <div className="space-y-6">
      {status !== "idle" && (
        <div className="rounded-md border p-3 text-sm">
          상태: {status === "exchanging" ? "로그인 처리 중..." : status}
        </div>
      )}

      <section>
        <h2 className="text-lg font-semibold mb-2">관계 레이더</h2>
        <div className="w-full max-w-lg mx-auto rounded-xl border border-dashed p-10 text-center text-sm text-gray-500">
          레이더 차트 영역 (차트 라이브러리 연결 전 임시)
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Top 5 제안</h2>
          {/* variant는 "ghost"나 "default"만 허용됨 / asChild 미지원 → router.push 사용 */}
          <Button variant="ghost" onClick={() => router.push("/people")}>
            People 바로가기
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {dummySuggestions.map((s) => (
            <Card key={s.id}>
              <CardHeader>
                <h3 className="font-medium text-primary">{s.title}</h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3">{s.body}</p>
                {/* asChild 없이 클릭 핸들러로 이동 */}
                <Button className="w-full" onClick={() => router.push("/people")}>
                  지금 실행
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="text-sm text-gray-500">로딩 중…</div>}>
      <HomeInner />
    </Suspense>
  );
}
