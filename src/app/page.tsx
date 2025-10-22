// src/app/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import type { SupabaseClient } from "@supabase/supabase-js";

/** 안전 호출 헬퍼: obj[key]가 함수면 실행 */
function callIfFn<R>(obj: unknown, key: string, ...args: unknown[]): R | null {
  if (obj && typeof obj === "object" && key in (obj as Record<string, unknown>)) {
    const val = (obj as Record<string, unknown>)[key];
    if (typeof val === "function") {
      return (val as (...a: unknown[]) => R)(...args);
    }
  }
  return null;
}

/** Supabase 클라이언트 로더 (프로젝트 헬퍼 우선, 없으면 폴백) */
async function getSupabaseClient(): Promise<SupabaseClient> {
  try {
    const mod: unknown = await import("@/lib/supabase-client");
    const useSb = callIfFn<SupabaseClient>(mod, "sb");
    if (useSb) return useSb;
    const useDefault = callIfFn<SupabaseClient>(mod, "default");
    if (useDefault) return useDefault;
    const useCreate = callIfFn<SupabaseClient>(mod, "createClient");
    if (useCreate) return useCreate;
  } catch {
    /* 헬퍼 없음 → 폴백 진행 */
  }
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 가 필요합니다.");
  }
  return createClient(url, anon);
}

const suggestions = [
  { id: 1, title: "가벼운 터치", body: "최근 연락이 뜸해요. 지난번에 같이 웃었던 사진 1장을 가볍게 보내볼까요?" },
  { id: 2, title: "루틴 리마인드", body: "부모님과 월 2회 통화 루틴, 이번 주가 기한이에요." },
  { id: 3, title: "만남 제안", body: "근처 전시회/카페를 골라 30분 산책+커피 제안하기." },
  { id: 4, title: "응원 한마디", body: "시험/프로젝트 앞둔 친구에게 짧은 응원 메시지 보내기." },
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

// Home 페이지의 useEffect 수정 – 로그인 콜백 처리 시에만 동작
useEffect(() => {
  if (!hasAuthParams) return; // URL에 인증 매개변수가 없으면 홈을 그대로 보여줍니다.
  (async () => {
    try {
      setStatus("exchanging");
      const supabase = await getSupabaseClient();

      const authAny = supabase.auth as unknown as {
        exchangeCodeForSession?: (url: string) => Promise<unknown>;
        getSession: () => Promise<{ data: { session: unknown } }>;
      };

      let exchanged = false;
      if (typeof authAny.exchangeCodeForSession === "function") {
        await authAny.exchangeCodeForSession(window.location.href);
        exchanged = true;
      }

      const { data } = await authAny.getSession();
      if (!data?.session && !exchanged) {
        throw new Error("세션 교환 실패");
      }
      // (선택) 최초 로그인 시 부트스트랩 API 호출
      try {
        await fetch("/api/bootstrap", { method: "POST" });
      } catch {}

      setStatus("done");
      // 세션이 준비된 후에는 People 화면으로 이동
      router.replace("/people");
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  })();
}, [hasAuthParams, router]);


  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Top nav */}
      <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/90 border-b">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-xl bg-black" />
            <span className="font-semibold">관계OS</span>
            <span className="ml-2 rounded-full border px-2 py-0.5 text-xs text-slate-600">
              Preview
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => router.push("/people")}>
              People
            </Button>
            <Button onClick={() => router.push("/people")}>시작하기</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-12 pb-6">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-slate-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              관계를 ‘실행’으로 바꾸는 레이더
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl font-bold leading-tight">
              중요한 사람들과의 연결을 <span className="underline decoration-emerald-400">놓치지 않게</span>
            </h1>
            <p className="mt-3 text-slate-600">
              메시지 타이밍, 간단한 제안, 루틴 리마인드를 한 화면에서. 오늘 한 번, 가볍게 터치하세요.
            </p>
            <div className="mt-5 flex gap-2">
              <Button onClick={() => router.push("/people")}>지금 실행</Button>
              <Button variant="ghost" onClick={() => router.push("/people")}>
                데모 보기
              </Button>
            </div>
          </div>

          {/* Radar placeholder */}
          <div className="relative">
            <div className="rounded-2xl border bg-white shadow-sm p-6">
              <div className="rounded-xl border border-dashed p-10 text-center text-sm text-slate-500">
                레이더 차트 (임시 자리)
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">오늘 제안</div>
                  <div className="text-lg font-semibold">3</div>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">이번주 루틴</div>
                  <div className="text-lg font-semibold">5</div>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">응답률</div>
                  <div className="text-lg font-semibold">72%</div>
                </div>
              </div>
            </div>

            {/* 상태 배지 (로그인 처리 중/오류 표시) */}
            {status !== "idle" && (
              <div className="absolute -top-3 -right-2">
                <span
                  className={[
                    "rounded-full border px-3 py-1 text-xs",
                    status === "exchanging" ? "bg-amber-50 border-amber-200 text-amber-700" :
                    status === "done" ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                    "bg-rose-50 border-rose-200 text-rose-700",
                  ].join(" ")}
                >
                  {status === "exchanging" ? "로그인 처리 중…" : status === "done" ? "완료" : "오류"}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Suggestions */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">오늘의 제안</h2>
          <Button variant="ghost" onClick={() => router.push("/people")}>
            People로 이동
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {suggestions.map((s) => (
            <Card key={s.id} className="hover:shadow-sm transition">
              <CardHeader>
                <h3 className="font-medium">{s.title}</h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-3">{s.body}</p>
                <Button className="w-full" onClick={() => router.push("/people")}>
                  지금 실행
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Quick actions */}
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="text-sm text-slate-500">빠른 실행</div>
              <div className="font-semibold">30초 만에 사람 추가하고 첫 터치 보내기</div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => router.push("/people")}>사람 추가</Button>
              <Button variant="ghost" onClick={() => router.push("/people")}>
                템플릿 보기
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-slate-500">
          © {new Date().getFullYear()} 관계OS — make relationships actionable.
        </div>
      </footer>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-500 p-6">로딩 중…</div>}>
      <HomeInner />
    </Suspense>
  );
}
