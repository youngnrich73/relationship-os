"use client";
import { useEffect, useState } from "react";
import { sb } from "@/lib/supabase-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Person = { id: string; label: string; created_at: string };

export default function PeoplePage(){
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<string|null>(null);
  const [list, setList] = useState<Person[]>([]);
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string|null>(null);

  const load = async ()=>{
    setLoading(true); setError(null);
    const supabase = sb();
    const { data: userRes } = await supabase.auth.getUser();
    const uid = userRes.user?.id ?? null;
    setMe(uid);
    if (!uid){ setLoading(false); return; }

    try{ await supabase.from("profiles").upsert({ id: uid }).select().single(); } catch {}
    const { data, error } = await supabase.from("people").select("id,label,created_at").order("created_at",{ascending:false});
    if (error) setError(error.message);
    setList(data ?? []);
    setLoading(false);
  };

  useEffect(()=>{ load(); }, []);

  const addPerson = async (e: React.FormEvent)=>{
    e.preventDefault(); if (!me) return;
    const supabase = sb();
    try{ await supabase.from("profiles").upsert({ id: me }).select().single(); } catch {}
    const { error } = await supabase.from("people").insert({ user_id: me, label });
    if (error){ alert(error.message); return; }
    setLabel(""); load();
  };

  const signOut = async ()=>{
    const supabase = sb();
    await supabase.auth.signOut();
    window.location.href = "/signin";
  };

  if (!me){
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-bold">People</h1>
        <p className="text-sm text-gray-600">로그인이 필요합니다.</p>
        <Link href="/signin"><Button>Sign in</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">사람 관리</h1>
        <Button variant="ghost" className="text-sm" onClick={signOut}>로그아웃</Button>
      </div>

      <form onSubmit={addPerson} className="flex items-center gap-2">
        <Input placeholder="이름/호칭 (예: 엄마, 민수, 팀장님)" value={label} onChange={e=>setLabel(e.target.value)} required />
        <Button type="submit">추가</Button>
        <Button type="button" variant="ghost" onClick={load}>새로고침</Button>
      </form>
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {loading ? (
        <p>불러오는 중...</p>
      ) : (
        <ul className="divide-y border rounded-2xl bg-white">
          {list.map(p=>(
            <li key={p.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">
                  <Link className="underline" href={`/people/${p.id}`}>{p.label}</Link>
                </div>
                <div className="text-xs text-gray-500">{new Date(p.created_at).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-3">
                <Link className="text-sm underline" href={`/people/${p.id}`}>상세</Link>
              </div>
            </li>
          ))}
          {list.length===0 && <li className="p-4 text-sm text-gray-500">아직 추가된 사람이 없어요.</li>}
        </ul>
      )}
    </div>
  );
}
