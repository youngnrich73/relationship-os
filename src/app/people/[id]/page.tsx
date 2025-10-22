import { sb } from "@/lib/supabase-client";

export default async function PersonDetail({ params }: { params: { id: string } }) {
  const supabase = sb();
  const { data: person } = await supabase.from("people").select("id,label").eq("id", params.id).single();
  if (!person){
    return (
      <div className="mx-auto max-w-3xl p-4">
        <h1 className="text-xl font-semibold">존재하지 않는 인물입니다.</h1>
        <p className="mt-2 text-sm text-gray-500">목록에서 다시 선택해 주세요.</p>
      </div>
    );
  }

  const { data: logs } = await supabase
    .from("interactions")
    .select("id,happened_at,kind,mood,note")
    .eq("person_id", params.id)
    .order("happened_at",{ascending:false});

  return (
    <div className="mx-auto max-w-3xl p-4 space-y-4">
      <h1 className="text-2xl font-bold">{person.label}</h1>
      <ul className="space-y-2">
        {(logs??[]).map(l=>(
          <li key={l.id} className="rounded-xl border p-4 bg-white">
            <div className="text-sm opacity-70">
              {new Date(l.happened_at).toLocaleString()} • {l.kind}
              {typeof l.mood==="number" ? ` • mood ${l.mood}` : ""}
            </div>
            {l.note ? <p className="mt-1">{l.note}</p> : null}
          </li>
        ))}
        {(!logs || logs.length===0) && <li className="text-sm text-gray-500">아직 기록이 없습니다.</li>}
      </ul>
    </div>
  );
}
