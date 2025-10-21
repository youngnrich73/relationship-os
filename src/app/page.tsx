// src/app/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

// UI
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// 타입만 가져옴(런타임 영향 없음)
import type { SupabaseClient } from "@supabase/supabase-js";

/** 안전한 key 함수 호출 헬퍼 (any 금지, unknown + 좁히기) */
function callIfFn<R>(obj: unknown, key: string): R | null {
  if (obj && typeof obj === "object" && key in (obj as Record<string, unknown>)) {
    const val = (obj as Record<string, unknown>)[key];
    if (typeof val === "function") {
      return (val as (...args: unknown[]) => R)();
    }
  }
  return null;
}

/** supabase 클라이언트 생성(헬퍼가 있으면 우선 사용, 없으면 직접 생성) */
async function getSupabaseClient(): Promise<SupabaseClient> {
  // 1) 프로젝트 내부 헬퍼 우선 시도
  try {
    const mod: unknown = await import("@/lib/supabase-client");
    // sb() / default() / createClient() 중 하나가 있으면 호출
    const fromSb = callIfFn<SupabaseClient>(mod, "sb");
    if (fromSb) return fromSb;

    const fromDefault = callIfFn<SupabaseClient>(mod, "default");
    if (fromDefault) return fromDefault;

    const fromCreate = callIfFn<SupabaseClient>(mod, "createClient");
    if (fromCreate) return fromCreate;
  } catch {
    // 모듈이 없으면 무시하고 폴백 진행
  }

  // 2) 폴백: 직접 생성
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error(
      "Supabase 환경변수가 없습니다. NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 를 설정하세요."
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

  // URL에 토큰/코드 유무
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
          // 이미 로그인 상태면 /people로
          const supabase = await getSupabaseClient();
          const { data } = await supabase.auth.getSession();
          if (data?.session) router.replace("/people");
          return;
        }

        setStatus("exchanging");
        const supabase = await getSupabaseClient();

        // exchangeCodeForSession 유무 안전 체크(타입가드)
        const authObj = supabase.auth as unknown as {
          exchangeCodeForSession?: (url: string) => Promise<unknown>;
          getSession: () => Promise<{ data: { session: unknown } }>;
        };

        let exchanged = false;
        if (typeof authObj.exchangeCodeForSession === "function") {
          await authObj.exchangeCodeForSession(window.location.href);
          exchanged = true;
        }

        // 일부 세팅은 위 단계가 없어도 세션 잡힐 수 있음 → 재확인
        const { data } = await authObj.getSession();
        if (!data?.session) {
          if (!exchanged) throw new Error("세션 교환 실패");
        }

        // (선택) 최초 로그인 부트스트랩
        try {
          await fetch("/api/bootstrap", { method: "POST" });
        } catch {
          // 없어도 진행
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
          {/* variant는 "default" | "ghost"만; 라우팅은 onClick으로 */}
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
