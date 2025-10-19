"use client";
import { useEffect, useMemo, useState } from "react";
import { sb } from "@/lib/supabase-client";
import Link from "next/link"; // ✅ 추가

type Person = { id: string; label: string };
type Log = {
  id: string;
  person_id: string;
  happened_at: string;
  kind: "chat" | "call" | "meet" | "note";
  mood: number | null;
};
type Idea = { person_id: string; label: string; items: string[] };

export default function IdeasPage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    (async () => {
      const supabase = sb();  
      const since = new Date();
      since.setDate(since.getDate() - 90);
      const [{ data: ppl }, { data: raw }] = await Promise.all([
        supabase.from("people").select("id,label").order("label"),
        supabase
          .from("interactions")
          .select("id,person_id,happened_at,kind,mood")
          .gte("happened_at", since.toISOString())
          .order("happened_at", { ascending: false }),
      ]);
      setPeople((ppl || []) as Person[]);
      setLogs((raw || []) as Log[]);
    })();
  }, []);

  const ideas = useMemo<Idea[]>(() => {
    const map = new Map<string, { label: string; arr: Log[] }>();
    people.forEach((p) => map.set(p.id, { label: p.label, arr: [] }));
    logs.forEach((l) => {
      if (!map.has(l.person_id))
        map.set(l.person_id, { label: l.person_id, arr: [] as Log[] });
      map.get(l.person_id)!.arr.push(l);
    });

    const now = Date.now();
    const res: Idea[] = [];
    for (const [pid, v] of map.entries()) {
      const L = v.arr;
      const items: string[] = [];

      // 최근 접촉일
      const lastAt = L.length ? new Date(L[0].happened_at).getTime() : 0;
      const days = lastAt
        ? Math.round((now - lastAt) / (1000 * 60 * 60 * 24))
        : 999;

      // 평균 기분
      const moods = L.map((x) =>
        typeof x.mood === "number" ? x.mood! : null
      ).filter((x) => x !== null) as number[];
      const moodAvgPct = moods.length
        ? ((moods.reduce((a, b) => a + b, 0) / moods.length + 3) / 6) * 100
        : 50;

      // 만남 비율 (오프라인 접촉 강화 필요 체크)
      const meetCnt = L.filter((x) => x.kind === "meet").length;
      const ratioMeet = L.length ? meetCnt / L.length : 0;

      if (days >= 21) {
        items.push("최근 소통이 뜸했어요. 가벼운 안부 인사(톡/DM) 한 번 보내보기 👋");
      }
      if (moodAvgPct <= 35) {
        items.push("요즘 컨디션이 안 좋아 보여요. 관심사/격려 위주로 짧게 공감해주기 💬");
      }
      if (ratioMeet < 0.15 && L.length >= 4) {
        items.push("온라인 위주였어요. 주말에 30분 산책/커피 같은 가벼운 만남 제안 ☕");
      }
      if (items.length === 0) {
        items.push("좋은 흐름이에요! 가볍게 근황 공유나 사진 한 장 건네보기 📸");
      }

      res.push({ person_id: pid, label: v.label, items });
    }

    // 카드 정렬: ‘필요도’ 높은 순 (오래 안 만난 사람 우선)
    res.sort((a, b) => {
      const lastA =
        map.get(a.person_id)!.arr[0]?.happened_at ?? "1970-01-01";
      const lastB =
        map.get(b.person_id)!.arr[0]?.happened_at ?? "1970-01-01";
      return new Date(lastA).getTime() - new Date(lastB).getTime();
    });
    return res.slice(0, 20);
  }, [people, logs]);

  if (!people.length)
    return <div className="p-6">사람 데이터를 불러오는 중…</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">다음 행동 제안</h1>
      <p className="text-sm text-gray-500">
        최근 기록(90일)을 바탕으로 간단한 규칙으로 제안합니다.
      </p>
      <div className="grid gap-3">
        {ideas.map((card) => (
          <div key={card.person_id} className="border rounded p-4">
            <div className="font-semibold">{card.label}</div>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              {card.items.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
            <div className="mt-3 text-sm">
              {/* ✅ <a> → <Link> 로 교체 */}
              <Link className="underline" href={`/people/${card.person_id}`}>
                타임라인 보기
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
