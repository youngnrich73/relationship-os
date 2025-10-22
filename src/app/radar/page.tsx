"use client";

import { useEffect, useMemo, useState } from "react";
import { sb } from "@/lib/supabase-client";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip
} from "recharts";

const palette = [
  'var(--color-primary)',
  'var(--color-secondary)',
  'var(--color-warning)',
  '#A78BFA',
  '#FB923C',
];

type Person = { id: string; label: string };
type Log = {
  id: string; person_id: string; happened_at: string;
  kind: "chat"|"call"|"meet"|"note"; mood: number|null;
};

type Metric = {
  person_id: string; label: string;
  freq: number;               // 빈도 (최근 60일)
  recency: number;            // 최근성 (가까울수록↑)
  variety: number;            // 다양성 (kind 고르게↑)
  moodAvg: number;            // 평균 기분 (-3~+3 → 0~100 변환)
};

export default function RadarPage(){
  const supabase = useMemo(() => sb(), []);
  const [people, setPeople] = useState<Person[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    (async () => {
      const since = new Date();
      since.setDate(since.getDate() - 60);

      const [{ data: ppl }, { data: raw }] = await Promise.all([
        supabase.from("people").select("id,label").order("label"),
        supabase
          .from("interactions")
          .select("id,person_id,happened_at,kind,mood")
          .gte("happened_at", since.toISOString())
          .order("happened_at", { ascending: false }),
      ]);

      setPeople((ppl||[]) as Person[]);
      setLogs((raw||[]) as Log[]);
    })();
  }, [supabase]);

  const metrics = useMemo<Metric[]>(() => {
    if (!people.length) return [];
    const byPerson = new Map<string, Log[]>();
    people.forEach(p => byPerson.set(p.id, []));
    logs.forEach(l => {
      if (!byPerson.has(l.person_id)) byPerson.set(l.person_id, []);
      byPerson.get(l.person_id)!.push(l);
    });

    const now = Date.now();
    const arr: Metric[] = [];
    for (const p of people){
      const L = byPerson.get(p.id) || [];
      const freq = L.length;

      // 최근성: 가장 최근 상호작용까지의 일수 (짧을수록 점수↑)
      let recencyScore = 0;
      if (L.length){
        const last = new Date(L[0].happened_at).getTime();
        const days = Math.max(0, (now - last) / (1000*60*60*24));
        // 0일=100점, 60일 이상=0점으로 선형
        recencyScore = Math.max(0, 100 - (days/60)*100);
      }

      // 다양성: kind 종류 수 / 4 (chat/call/meet/note)
      const kinds = new Set(L.map(x => x.kind));
      const variety = (kinds.size/4)*100;

      // 평균 기분: -3~+3 → 0~100 변환
      const moods = L.map(x => typeof x.mood === "number" ? x.mood! : null).filter(x => x!==null) as number[];
      const moodAvg = moods.length
        ? ((moods.reduce((a,b)=>a+b,0)/moods.length + 3) / 6) * 100
        : 50; // 데이터 없으면 중립

      arr.push({ person_id: p.id, label: p.label, freq, recency: recencyScore, variety, moodAvg });
    }

    // freq 정규화: 상위 대비 비율 (0~100)
    const maxF = Math.max(1, ...arr.map(a => a.freq));
    arr.forEach(a => { a.freq = (a.freq/maxF)*100; });

    return arr;
  }, [people, logs]);

  // Top5 (freq + recency + variety 평균 상위)
  const top = useMemo(() => {
    const scored = metrics
      .map(m => ({ m, s: (m.freq + m.recency + m.variety)/3 }))
      .sort((a,b)=>b.s-a.s)
      .slice(0, Math.min(5, metrics.length))
      .map(x => x.m);
    return scored;
  }, [metrics]);

  // Recharts 데이터 포맷: [{metric: "Freq", "이름1": 80, "이름2": 40, ...}, ...]
  
// 1) 차트 행 타입: metric은 string, 그 외 키들은 number를 넣을 예정이므로 union으로 완화
type ChartRow = { metric: string } & Record<string, number | string>;

const chartData = useMemo<ChartRow[]>(() => {
  // 2) 초기엔 metric만 있으니 OK, 나중에 사람 이름 키로 숫자를 채워 넣음
  const rows: ChartRow[] = [
    { metric: "Frequency" },
    { metric: "Recency" },
    { metric: "Variety" },
    { metric: "Mood" },
  ];

  for (const m of top) {
    rows[0][m.label] = Math.round(m.freq);
    rows[1][m.label] = Math.round(m.recency);
    rows[2][m.label] = Math.round(m.variety);
    rows[3][m.label] = Math.round(m.moodAvg);
  }
  return rows;
}, [top]);


  if (!people.length) return <div className="p-6">사람 데이터를 불러오는 중…</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">관계 레이더 (최근 60일)</h1>
      <p className="text-sm text-gray-500">
        Frequency(빈도), Recency(최근성), Variety(다양성), Mood(평균기분) 기준 상위 5명을 비교합니다.
      </p>

      <div className="w-full h-[520px] border rounded">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            <Tooltip />
            <Legend />
            {top.map((m, idx) => (
              <Radar
                key={m.person_id}
                name={m.label}
                dataKey={m.label}
                stroke={palette[idx % palette.length]}
                fill={palette[idx % palette.length]}
                fillOpacity={0.2 + idx * 0.1}
              />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
