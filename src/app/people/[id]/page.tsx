import { sb } from "@/lib/supabase-client";
import { notFound } from "next/navigation";

export default async function PersonDetail({ params }: { params: { id: string } }) {
  const supabase = sb();

  // 사람 정보
  const { data: person } = await supabase
    .from("people")
    .select("id,label")
    .eq("id", params.id)
    .single();

  if (!person) return notFound();

  // 타임라인: 최신순
  const { data: logs } = await supabase
    .from("interactions")
    .select("id,happened_at,kind,mood,note")
    .eq("person_id", params.id)
    .order("happened_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl p-4 space-y-4">
      <h1 className="text-xl font-semibold">{person.label}</h1>
      <ul className="space-y-2">
        {(logs ?? []).map((l) => (
          <li key={l.id} className="rounded border p-3">
            <div className="text-sm opacity-70">
              {new Date(l.happened_at).toLocaleString()} • {l.kind}
              {typeof l.mood === "number" ? ` • mood ${l.mood}` : ""}
            </div>
            {l.note ? <p className="mt-1">{l.note}</p> : null}
          </li>
        ))}
        {(!logs || logs.length === 0) && (
          <li className="text-sm text-gray-500">아직 기록이 없습니다.</li>
        )}
      </ul>
    </div>
  );
}
