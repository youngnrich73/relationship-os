"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { sb } from "@/lib/supabase-client";
import Link from "next/link"; // ✅ 추가


type Person = { id: string; label: string };
type Log = {
  id: string;
  person_id: string;
  happened_at: string;
  kind: "chat" | "call" | "meet" | "note";
  mood: number | null;
  note: string | null;
};

export default function InteractionsPage() {
  const supabase = sb();

  // 빠른 저장용
  const [people, setPeople] = useState<Person[]>([]);
  const [personId, setPersonId] = useState("");
  const [kind, setKind] = useState<"chat" | "call" | "meet" | "note">("chat");
  const [mood, setMood] = useState(0);
  const [note, setNote] = useState("");

  // 목록용
  const [rows, setRows] = useState<Log[]>([]);
  const labelOf = useMemo(() => {
    const map = new Map<string, string>();
    people.forEach((p) => map.set(p.id, p.label));
    return (id: string) => map.get(id) ?? "Unknown";
  }, [people]);
  const refresh = useCallback(async () => {
    const { data: ppl } = await supabase.from('people').select('id,label').order('label');
    setPeople((ppl||[]) as Person[]);
    // personId가 비어있을 때만 첫 사람으로 설정
    setPersonId(prev => (ppl && ppl[0] && !prev ? ppl[0].id : prev));

    const { data: logs } = await supabase
      .from('interactions')
      .select('id,person_id,happened_at,kind,mood,note')
      .order('happened_at', { ascending: false })
      .limit(200);
    setRows((logs||[]) as Log[]);
  }, [supabase]); // setState 함수들은 안정적이라 deps에 안 넣어도 됨

  useEffect(() => {
    refresh();
    // supabase는 훅 밖에서 생성되어도 effect 내부에서만 참조 ⇒ deps 경고 없음
    // personId는 set으로만 갱신하므로 여기 deps로 넣지 않음
  }, [refresh]);

  async function save() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase.from("interactions").insert({
      person_id: personId,
      user_id: user?.id, // RLS 위해
      happened_at: new Date().toISOString(),
      kind,
      mood,
      note,
    });
    if (error) {
      alert(error.message);
      return;
    }
    setNote("");
    await refresh(); // 저장 후 즉시 새로고침
  }

  return (
    <main className="p-6 space-y-6">
      <section className="space-y-3">
        <h1 className="text-xl font-semibold">빠른 기록</h1>
        <select
          className="border p-2 w-full"
          value={personId}
          onChange={(e) => setPersonId(e.target.value)}
        >
          {people.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        <select
          className="border p-2 w-full"
          value={kind}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setKind(e.target.value as 'chat'|'call'|'meet'|'note')
         }
        >
          <option value="chat">채팅</option>
          <option value="call">통화</option>
          <option value="meet">만남</option>
          <option value="note">메모</option>
        </select>
        <input
          className="border p-2 w-full"
          type="number"
          min="-3"
          max="3"
          value={mood}
          onChange={(e) => setMood(parseInt(e.target.value || "0"))}
          placeholder="기분(-3~+3)"
        />
        <textarea
          className="border p-2 w-full"
          placeholder="메모 (선택)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button className="border px-3 py-2" onClick={save}>
          저장
        </button>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">최근 기록 (최신순)</h2>
        <ul className="grid gap-2">
          {rows.map((r) => (
            <li key={r.id} className="border rounded p-3">
              <div className="text-sm opacity-70">
                {new Date(r.happened_at).toLocaleString()} • {r.kind}
                {typeof r.mood === "number" ? ` • mood ${r.mood}` : ""}
                {" • "}
                {/* ✅ <a> → <Link> 교체 */}
                <Link
                  className="underline"
                  href={`/people/${r.person_id}`}
                >
                  {labelOf(r.person_id)}
                </Link>
              </div>
              {r.note ? <p className="mt-1">{r.note}</p> : null}
            </li>
          ))}
          {rows.length === 0 && (
            <li className="text-sm text-gray-500">
              아직 기록이 없습니다.
            </li>
          )}
        </ul>
      </section>
    </main>
  );
}
