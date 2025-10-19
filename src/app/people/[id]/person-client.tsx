"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { sb } from "@/lib/supabase-client";

type Person = {
  id: string;
  name: string;
  note: string | null;
  created_at: string;
};

export default function PersonClient() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = sb();

  const [p, setP] = useState<Person | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("people").select("*").eq("id", id).single();
      if (error) setMsg("불러오기 오류: " + error.message);
      else setP(data as Person);
    })();
  }, [id, supabase]);

  const remove = async () => {
    const ok = confirm("정말 삭제할까요?");
    if (!ok) return;
    const { error } = await supabase.from("people").delete().eq("id", id);
    if (error) setMsg("삭제 오류: " + error.message);
    else router.replace("/people");
  };

  if (!p) return <div className="p-6">{msg ?? "로딩…"}</div>;

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <Link href="/people" className="text-sm underline">← 목록으로</Link>
      <h2 className="text-2xl font-bold">{p.name}</h2>
      {p.note && <p className="text-gray-700 whitespace-pre-wrap">{p.note}</p>}
      <p className="text-xs text-gray-500">{new Date(p.created_at).toLocaleString()}</p>
      <button onClick={remove} className="text-sm underline">삭제</button>
    </div>
  );
}
