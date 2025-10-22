"use client";

import { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

async function getSupabaseClient(){
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, anon);
}

const suggestions = [
  { id:1, title:"가벼운 터치", body:"최근 연락이 뜸해요. 지난번에 같이 웃었던 사진 1장을 가볍게 보내볼까요?" },
  { id:2, title:"루틴 리마인드", body:"부모님과 월 2회 통화 루틴, 이번 주가 기한이에요." },
  { id:3, title:"만남 제안", body:"근처 전시회/카페를 골라 30분 산책+커피 제안하기." },
  { id:4, title:"응원 한마디", body:"시험/프로젝트 앞둔 친구에게 짧은 응원 메시지 보내기." },
];

function HomeInner(){
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState<"idle"|"exchanging"|"done"|"error">("idle");
  const hasAuthParams = useMemo(()=> Boolean(params.get("code") || params.get("access_token")), [params]);
  const once = useRef(false);

  useEffect(()=>{
    if (!hasAuthParams || once.current) return;
    once.current = true;
    (async ()=>{
     try {
       setStatus("exchanging");
       const sb = await getSupabaseClient();
     
       // ✅ 'any' 금지: 필요한 메서드만 가진 타입을 좁혀서 사용
       type AuthLite = {
         exchangeCodeForSession?: (url: string) => Promise<unknown>;
         getSession: () => Promise<{ data: { session: unknown } }>;
       };
     
       const auth = sb.auth as unknown as AuthLite;
     
       if (typeof auth.exchangeCodeForSession === "function") {
         await auth.exchangeCodeForSession(window.location.href);
       }
     
       const { data } = await auth.getSession();
     
       if (!data?.session) {
         // (선택) 교환 불가 시에도 세션이 없으면 오류로 처리
         throw new Error("세션 교환 실패");
       }
     
       setStatus("done");
       router.replace("/people");
     } catch {
       setStatus("error");
     }

    })();
  },[hasAuthParams, router]);

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* HERO */}
      <section className="pt-6 pb-4">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-gray-600">
              <span className="h-2 w-2 rounded-full bg-primary" /> 관계를 ‘실행’으로 바꾸는 레이더
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight">
              중요한 사람들과의 연결을 <span className="underline decoration-secondary">놓치지 않게</span>
            </h1>
            <p className="mt-3 text-gray-600">
              메시지 타이밍, 간단한 제안, 루틴 리마인드를 한 화면에서.
            </p>
            <div className="mt-6 flex gap-2">
              <Button onClick={()=>router.push("/people")}>지금 실행</Button>
              <Button variant="ghost" onClick={()=>router.push("/people")}>데모 보기</Button>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-soft">
            <div className="rounded-xl border border-dashed p-10 text-center text-sm text-gray-500">
              레이더 차트 (임시 자리)
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-neutral p-3">
                <div className="text-xs text-gray-500">오늘 제안</div>
                <div className="text-xl font-semibold">3</div>
              </div>
              <div className="rounded-lg bg-neutral p-3">
                <div className="text-xs text-gray-500">이번주 루틴</div>
                <div className="text-xl font-semibold">5</div>
              </div>
              <div className="rounded-lg bg-neutral p-3">
                <div className="text-xs text-gray-500">응답률</div>
                <div className="text-xl font-semibold">72%</div>
              </div>
            </div>
            {status!=="idle" && (
              <div className="mt-3 text-xs">
                {status==="exchanging" ? "로그인 처리 중…" : status==="done" ? "완료" : "오류"}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SUGGESTIONS */}
      <section className="py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">오늘의 제안</h2>
          <Button variant="ghost" onClick={()=>router.push("/people")}>People로 이동</Button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {suggestions.map(s=>(
            <Card key={s.id} className="hover:shadow-soft transition">
              <CardHeader><h3 className="font-medium">{s.title}</h3></CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">{s.body}</p>
                <Button className="w-full" onClick={()=>router.push("/people")}>지금 실행</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function HomePage(){
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-500">로딩 중…</div>}>
      <HomeInner/>
    </Suspense>
  );
}
